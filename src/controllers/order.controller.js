import mongoose from "mongoose";
import Order from "../models/Order.js";

import { prepareOrderItems } from "../services/order.service.js";

import { decrementInventory } from "../services/inventory.service.js";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { baseId, sauceId, cheeseId, vegetableIds = [] } = req.body;

    if (!baseId || !sauceId || !cheeseId) {
      return res.status(400).json({
        success: false,
        message: "Base, sauce and cheese are required",
      });
    }

    if (!Array.isArray(vegetableIds)) {
      return res.status(400).json({
        success: false,
        message: "vegetableIds must be an array",
      });
    }

    const preparedOrder = await prepareOrderItems({
      baseId,
      sauceId,
      cheeseId,
      vegetableIds,
    });

    let order;

    await session.withTransaction(async () => {
      // Decrease stock atomically
      await decrementInventory(preparedOrder.items, session);

      const [createdOrder] = await Order.create(
        [
          {
            user: req.user._id,
            items: preparedOrder.items,
            subtotal: preparedOrder.subtotal,
            total: preparedOrder.subtotal,
            status: "pending_payment",
            paymentStatus: "pending",
            statusHistory: [
              {
                status: "pending_payment",
                changedAt: new Date(),
                changedBy: req.user._id,
              },
            ],
          },
        ],
        {
          session,
        },
      );

      order = createdOrder;
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};
