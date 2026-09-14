import "dotenv/config";

import connectDB from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";
import { startLowStockJob } from "./jobs/low-stock.job.js";

import server from "./app.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    await seedAdmin();

    startLowStockJob();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
