import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import User from "../models/User.js";

import { generateToken, setAuthCookie } from "../utils/auth.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(admin._id, "admin");

    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: "Admin login successful",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const [users, total] = await Promise.all([
      User.aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "user",
            as: "orders",
          },
        },
        {
          $addFields: {
            ordersCount: { $size: "$orders" },
            totalSpent: { $sum: "$orders.total" },
          },
        },
        {
          $project: {
            orders: 0,
            password: 0,
            emailVerificationToken: 0,
            emailVerificationExpires: 0,
            passwordResetToken: 0,
            passwordResetExpires: 0,
            __v: 0,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limitNumber,
        },
      ]),

      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully!",
      count: users.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
