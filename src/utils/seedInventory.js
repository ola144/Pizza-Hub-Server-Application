import Inventory from "../models/Inventory.js";

const inventoryItems = [
  // BASES
  {
    name: "Classic Thin Crust",
    category: "base",
    stock: 50,
    threshold: 20,
    price: 500,
  },
  {
    name: "Classic Thick Crust",
    category: "base",
    stock: 50,
    threshold: 20,
    price: 600,
  },
  {
    name: "Cheese Burst Crust",
    category: "base",
    stock: 40,
    threshold: 15,
    price: 900,
  },
  {
    name: "Whole Wheat Crust",
    category: "base",
    stock: 35,
    threshold: 15,
    price: 700,
  },
  {
    name: "Gluten Free Crust",
    category: "base",
    stock: 25,
    threshold: 10,
    price: 1000,
  },

  // SAUCES
  {
    name: "Classic Tomato",
    category: "sauce",
    stock: 60,
    threshold: 20,
    price: 300,
  },
  {
    name: "Spicy Peri Peri",
    category: "sauce",
    stock: 50,
    threshold: 20,
    price: 400,
  },
  {
    name: "BBQ Sauce",
    category: "sauce",
    stock: 45,
    threshold: 15,
    price: 400,
  },
  {
    name: "Creamy Garlic",
    category: "sauce",
    stock: 40,
    threshold: 15,
    price: 450,
  },
  {
    name: "Pesto Sauce",
    category: "sauce",
    stock: 30,
    threshold: 10,
    price: 500,
  },

  // CHEESES
  {
    name: "Mozzarella",
    category: "cheese",
    stock: 80,
    threshold: 25,
    price: 700,
  },
  {
    name: "Cheddar",
    category: "cheese",
    stock: 60,
    threshold: 20,
    price: 600,
  },
  {
    name: "Parmesan",
    category: "cheese",
    stock: 40,
    threshold: 15,
    price: 800,
  },
  {
    name: "Gouda",
    category: "cheese",
    stock: 40,
    threshold: 15,
    price: 750,
  },

  // VEGETABLES
  {
    name: "Mushrooms",
    category: "vegetable",
    stock: 100,
    threshold: 30,
    price: 250,
  },
  {
    name: "Onions",
    category: "vegetable",
    stock: 120,
    threshold: 30,
    price: 150,
  },
  {
    name: "Bell Peppers",
    category: "vegetable",
    stock: 100,
    threshold: 25,
    price: 200,
  },
  {
    name: "Sweet Corn",
    category: "vegetable",
    stock: 90,
    threshold: 25,
    price: 200,
  },
  {
    name: "Black Olives",
    category: "vegetable",
    stock: 70,
    threshold: 20,
    price: 250,
  },
  {
    name: "Jalapeños",
    category: "vegetable",
    stock: 60,
    threshold: 20,
    price: 200,
  },
];

export const seedInventory = async () => {
  const count = await Inventory.countDocuments();

  if (count > 0) {
    console.log("Inventory already seeded");

    return;
  }

  await Inventory.insertMany(inventoryItems);

  console.log(`Seeded ${inventoryItems.length} inventory items`);
};
