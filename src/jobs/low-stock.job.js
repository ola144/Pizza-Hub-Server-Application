import cron from "node-cron";
import { checkLowStock } from "../services/low-stock.service.js";

export const startLowStockJob = () => {
  cron.schedule("*/30 * * * *", async () => {
    console.log("Running scheduled low-stock check...");

    await checkLowStock();
  });

  console.log("Low-stock monitoring job started.");
};
