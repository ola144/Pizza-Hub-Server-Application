import express from "express";

import {
  getAllOrders,
  getAdminOrderById,
  changeOrderStatus,
} from "../controllers/admin-order.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(requireRole("admin"));

router.get("/", getAllOrders);

router.get("/:id", getAdminOrderById);

router.patch("/:id/status", changeOrderStatus);

export default router;
