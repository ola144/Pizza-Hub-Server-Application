import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

export const seedAdmin = async () => {
  const existingAdmin = await Admin.findOne({
    email: process.env.ADMIN_EMAIL,
  });

  if (existingAdmin) {
    return;
  }

  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is missing from .env");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await Admin.create({
    name: "PizzaHub Admin",
    email: process.env.ADMIN_EMAIL,
    password: hashedPassword,
  });

  console.log("Admin account created");
};
