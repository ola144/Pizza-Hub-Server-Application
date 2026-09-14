import Order from "../models/Order.js";

import { updateOrderStatus } from "../services/order-status.service.js";
import { getIO } from "../socket/socket.js";

export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("statusHistory.changedBy", "name email")
      .lean();

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
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

export const changeOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const order = await updateOrderStatus({
      orderId: req.params.id,
      status,
      adminId: req.user._id,
    });

    //Emit realtime update
    const io = getIO();

    const room = `order:${order._id.toString()}`;

    io.to(room).emit("order-status-updated", {
      orderId: order._id.toString(),
      status: order.status,
      order,
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
