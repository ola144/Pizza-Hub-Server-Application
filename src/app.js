import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminOrderRoutes from "./routes/admin-order.routes.js";

import { razorpayWebhook } from "./controllers/payment.controller.js";
import swaggerSpec from "./swagger.js";

const allowedOrigins = [
  "http://localhost:5173",
  "https://pizza-hub-server-application.onrender.com",
];

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.post(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
  }),
  razorpayWebhook,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "Pizza API is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin/orders", adminOrderRoutes);

export default app;
