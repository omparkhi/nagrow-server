const mongoose = require("mongoose");
const restaurantModel = require("./restaurant.model");

const menuitemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },

    isavailable: {
      type: Boolean,
      default: true,
    },

    category: {
      type: String,
      enum: ["Main Course", "Dessert", "Snacks", "Beverages", "Appetizers"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItems", menuitemSchema);
