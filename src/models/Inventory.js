import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Inventory item name is required"],
      trim: true,
    },

    category: {
      type: String,
      enum: ["base", "sauce", "cheese", "vegetable"],
      required: [true, "Inventory category is required"],
    },

    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    threshold: {
      type: Number,
      required: true,
      min: [0, "Threshold cannot be negative"],
      default: 20,
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

inventorySchema.index({
  category: 1,
  active: 1,
});

inventorySchema.index({
  stock: 1,
  threshold: 1,
});

export default mongoose.model("Inventory", inventorySchema);
