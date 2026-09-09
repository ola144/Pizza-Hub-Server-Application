import Inventory from "../models/Inventory.js";

export const decrementInventory = async (items, session) => {
  for (const item of items) {
    const updatedItem = await Inventory.findOneAndUpdate(
      {
        _id: item.inventoryId,
        active: true,
        stock: { $gte: item.quantity },
      },
      {
        $inc: {
          stock: -item.quantity,
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!updatedItem) {
      throw new Error(`${item.name} does not have enough stock`);
    }
  }
};

export const validateInventory = async (items) => {
  const inventoryIds = items.map((item) => item.inventoryId);

  const inventory = await Inventory.find({
    _id: {
      $in: inventoryIds,
    },
    active: true,
  });

  const inventoryMap = new Map(
    inventory.map((item) => [item._id.toString(), item]),
  );

  for (const requested of items) {
    const item = inventoryMap.get(requested.inventoryId.toString());

    if (!item) {
      throw new Error(`Inventory item ${requested.inventoryId} is unavailable`);
    }

    if (item.stock < requested.quantity) {
      throw new Error(`${item.name} has insufficient stock`);
    }
  }

  return true;
};
