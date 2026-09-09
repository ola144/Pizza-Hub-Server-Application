import crypto from "crypto";

import razorpay from "../config/razorpay.js";
import Order from "../models/Order.js";

export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order has already been paid",
      });
    }

    /*
     * If we already created a Razorpay order for
     * this internal order, don't create another one.
     */
    if (order.razorpayOrderId) {
      return res.status(200).json({
        success: true,
        message: "Payment order already exists",

        key: process.env.RAZORPAY_KEY_ID,

        razorpayOrder: {
          id: order.razorpayOrderId,
          amount: Math.round(order.total * 100),
          currency: process.env.RAZORPAY_CURRENCY || "INR",
        },

        order,
      });
    }

    /*
     * Razorpay expects amount in the smallest
     * currency unit.
     *
     * Example:
     *
     * ₦/₹ 1,850
     * becomes
     * 185000 paise
     */
    const amount = Math.round(order.total * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: process.env.RAZORPAY_CURRENCY || "INR",
      receipt: `pizza_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Successfully create the payment",

      key: process.env.RAZORPAY_KEY_ID,

      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },

      order,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (
      !orderId ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Incomplete payment information",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
     * Make sure the Razorpay order belongs
     * to our internal order.
     */
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay order",
      });
    }

    /*
     * Signature:
     *
     * HMAC_SHA256(
     *   razorpay_order_id + "|" + razorpay_payment_id,
     *   RAZORPAY_KEY_SECRET
     * )
     */
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    /*
     * Payment is authentic.
     */
    order.paymentId = razorpay_payment_id;

    order.paymentStatus = "paid";

    order.status = "order_received";

    order.statusHistory.push({
      status: "order_received",
      changedAt: new Date(),
      changedBy: null,
    });

    order.paidAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing webhook signature",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = JSON.parse(req.body.toString());

    console.log("Razorpay webhook:", event.event);

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;

        const razorpayOrderId = payment.order_id;

        const order = await Order.findOne({
          razorpayOrderId,
        });

        if (order) {
          order.paymentStatus = "paid";

          order.paymentId = payment.id;

          order.status = "order_received";

          order.statusHistory.push({
            status: "order_received",
            changedAt: new Date(),
            changedBy: null,
          });

          order.paidAt = order.paidAt || new Date();

          await order.save();
        }

        break;
      }

      case "order.paid": {
        const razorpayOrder = event.payload.order.entity;

        const order = await Order.findOne({
          razorpayOrderId: razorpayOrder.id,
        });

        if (order) {
          order.paymentStatus = "paid";

          order.status = "order_received";

          order.statusHistory.push({
            status: "order_received",
            changedAt: new Date(),
            changedBy: null,
          });

          order.paidAt = order.paidAt || new Date();

          await order.save();
        }

        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;

        const order = await Order.findOne({
          razorpayOrderId: payment.order_id,
        });

        if (order) {
          order.paymentStatus = "failed";

          await order.save();
        }

        break;
      }

      default:
        console.log(`Unhandled Razorpay event: ${event.event}`);
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    return res.status(500).json({
      success: false,
    });
  }
};
