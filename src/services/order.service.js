import Inventory from "../models/Inventory.js";

export const prepareOrderItems = async ({
  baseId,
  sauceId,
  cheeseId,
  vegetableIds = [],
}) => {
  const ids = [baseId, sauceId, cheeseId, ...vegetableIds];

  // Prevent duplicate ingredients
  const uniqueIds = [...new Set(ids.map(String))];

  if (uniqueIds.length !== ids.length) {
    throw new Error("Duplicate ingredients are not allowed");
  }

  const inventory = await Inventory.find({
    _id: { $in: uniqueIds },
    active: true,
  });

  if (inventory.length !== uniqueIds.length) {
    throw new Error("One or more selected ingredients are unavailable");
  }

  const inventoryMap = new Map(
    inventory.map((item) => [item._id.toString(), item]),
  );

  const base = inventoryMap.get(String(baseId));
  const sauce = inventoryMap.get(String(sauceId));
  const cheese = inventoryMap.get(String(cheeseId));

  if (!base || base.category !== "base") {
    throw new Error("Invalid pizza base");
  }

  if (!sauce || sauce.category !== "sauce") {
    throw new Error("Invalid pizza sauce");
  }

  if (!cheese || cheese.category !== "cheese") {
    throw new Error("Invalid cheese");
  }

  const vegetables = vegetableIds.map((id) => {
    const vegetable = inventoryMap.get(String(id));

    if (!vegetable || vegetable.category !== "vegetable") {
      throw new Error("Invalid vegetable selected");
    }

    return vegetable;
  });

  const selectedItems = [base, sauce, cheese, ...vegetables];

  // Check stock
  for (const item of selectedItems) {
    if (item.stock < 1) {
      throw new Error(`${item.name} is out of stock`);
    }
  }

  const items = selectedItems.map((item) => ({
    inventoryId: item._id,
    name: item.name,
    category: item.category,
    price: item.price,
    quantity: 1,
  }));

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return {
    items,
    subtotal,
  };
};
