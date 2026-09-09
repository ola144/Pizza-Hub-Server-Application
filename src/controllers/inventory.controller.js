import Inventory from "../models/Inventory.js";

export const getInventory = async (req, res) => {
  try {
    const { category, active } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (active !== undefined) {
      filter.active = active === "true";
    }

    const inventory = await Inventory.find(filter).sort({
      category: 1,
      name: 1,
    });

    return res.json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};

export const getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Get inventory item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory item",
    });
  }
};

export const createInventoryItem = async (req, res) => {
  try {
    const { name, category, stock, threshold, price, active } = req.body;

    if (
      !name ||
      !category ||
      stock === undefined ||
      threshold === undefined ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, category, stock, threshold and price are required",
      });
    }

    const existingItem = await Inventory.findOne({
      name: name.trim(),
      category,
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message:
          "An inventory item with this name already exists in this category",
      });
    }

    const item = await Inventory.create({
      name: name.trim(),
      category,
      stock,
      threshold,
      price,
      active: active !== undefined ? active : true,
    });

    return res.status(201).json({
      success: true,
      message: "Inventory item created",
      item,
    });
  } catch (error) {
    console.error("Create inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create inventory item",
    });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const { name, stock, threshold, price, active } = req.body;

    if (name !== undefined) {
      item.name = name.trim();
    }

    if (stock !== undefined) {
      if (stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock cannot be negative",
        });
      }

      item.stock = stock;
    }

    if (threshold !== undefined) {
      if (threshold < 0) {
        return res.status(400).json({
          success: false,
          message: "Threshold cannot be negative",
        });
      }

      item.threshold = threshold;
    }

    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative",
        });
      }

      item.price = price;
    }

    if (active !== undefined) {
      item.active = active;
    }

    await item.save();

    return res.json({
      success: true,
      message: "Inventory updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update inventory",
    });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    item.active = false;

    await item.save();

    return res.json({
      success: true,
      message: "Inventory item deactivated successfully",
    });
  } catch (error) {
    console.error("Delete inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate inventory item",
    });
  }
};

export const getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.find({
      active: true,
      $expr: {
        $lt: ["$stock", "$threshold"],
      },
    }).sort({
      stock: 1,
    });

    return res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Low stock error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch low-stock items",
    });
  }
};
