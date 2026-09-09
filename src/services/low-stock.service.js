import Inventory from "../models/Inventory.js";
import { sendEmail } from "../services/email.service.js";

export const checkLowStock = async () => {
  try {
    const lowStockItems = await Inventory.find({
      active: true,
      $expr: {
        $lt: ["$stock", "$threshold"],
      },
    }).sort({
      category: 1,
      stock: 1,
    });

    if (lowStockItems.length === 0) {
      console.log("Inventory check: No low-stock items.");
      return;
    }

    console.log(
      `Inventory check: ${lowStockItems.length} low-stock item(s) found.`,
    );

    const rows = lowStockItems
      .map(
        (item) => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">
              ${item.name}
            </td>

            <td style="padding: 10px; border: 1px solid #ddd;">
              ${item.category}
            </td>

            <td style="padding: 10px; border: 1px solid #ddd;">
              <strong>${item.stock}</strong>
            </td>

            <td style="padding: 10px; border: 1px solid #ddd;">
              ${item.threshold}
            </td>
          </tr>
        `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">

          <h2 style="color: #d32f2f;">
            ⚠️ Low Stock Alert
          </h2>

          <p>
            The following inventory items have fallen below
            their configured stock thresholds:
          </p>

          <table
            style="
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            "
          >
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; border: 1px solid #ddd;">
                  Item
                </th>

                <th style="padding: 10px; border: 1px solid #ddd;">
                  Category
                </th>

                <th style="padding: 10px; border: 1px solid #ddd;">
                  Current Stock
                </th>

                <th style="padding: 10px; border: 1px solid #ddd;">
                  Threshold
                </th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <p style="margin-top: 20px;">
            Please update your inventory as soon as possible.
          </p>

        </body>
      </html>
    `;

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `⚠️ Low Stock Alert - ${lowStockItems.length} Item(s)`,
      html,
    });

    console.log("Low-stock alert email sent successfully.");
  } catch (error) {
    console.error("Low-stock check failed:", error);
  }
};
