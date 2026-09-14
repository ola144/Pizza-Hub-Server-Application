import express from "express";

import { adminLogin, getAllUsers } from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/users", protect, requireRole("admin"), getAllUsers);

export default router;
