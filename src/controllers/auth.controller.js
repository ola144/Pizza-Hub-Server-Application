import bcrypt from "bcryptjs";

import User from "../models/User.js";
import {
  generateToken,
  setAuthCookie,
  clearAuthCookie,
} from "../utils/auth.js";

import { generateRandomToken, hashToken } from "../utils/token.js";

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/email.service.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationToken = generateRandomToken();

    const hashedVerificationToken = hashToken(verificationToken);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await sendVerificationEmail(user.email, user.name, verificationToken);

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error);

    return res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const token = generateToken(user._id, user.role);

    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

export const logout = async (req, res) => {
  clearAuthCookie(res);

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email?.toLowerCase().trim(),
    });

    // Don't reveal whether an email exists
    if (!user) {
      return res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent.",
      });
    }

    const resetToken = generateRandomToken();

    user.passwordResetToken = hashToken(resetToken);

    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return res.json({
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to process password reset",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: new Date(),
      },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link",
      });
    }

    user.password = await bcrypt.hash(password, 12);

    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};
