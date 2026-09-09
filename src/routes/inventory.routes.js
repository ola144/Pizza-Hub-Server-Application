import express from "express";

import {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
} from "../controllers/inventory.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

/*
  Public inventory

  Used by:
  - Pizza builder
  - User dashboard
*/
router.get("/", getInventory);

router.get("/low-stock", protect, requireRole("admin"), getLowStockItems);

router.get("/:id", getInventoryItem);

/*
  Admin only
*/
router.post("/", protect, requireRole("admin"), createInventoryItem);

router.patch("/:id", protect, requireRole("admin"), updateInventoryItem);

router.delete("/:id", protect, requireRole("admin"), deleteInventoryItem);

export default router;
