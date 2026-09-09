import Order from "../models/Order.js";

const allowedTransitions = {
  pending_payment: ["order_received", "cancelled"],

  order_received: ["in_kitchen", "cancelled"],

  in_kitchen: ["sent_to_delivery"],

  sent_to_delivery: ["delivered"],

  delivered: [],

  cancelled: [],
};

export const updateOrderStatus = async ({ orderId, status, adminId }) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === status) {
    throw new Error(`Order is already ${status}`);
  }

  const allowed = allowedTransitions[order.status] || [];

  if (!allowed.includes(status)) {
    throw new Error(
      `Cannot change order status from ${order.status} to ${status}`,
    );
  }

  order.status = status;

  order.statusHistory.push({
    status,
    changedAt: new Date(),
    changedBy: adminId,
  });

  await order.save();

  return order;
};
