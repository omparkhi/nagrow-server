const mongoose = require("mongoose");
const restaurantModel = require("./restaurant.model");

const menuitemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    name: {
      typr: String,
      required: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
    },
    image: String,
    isavailable: {
      type: Boolean,
      default: true,
    },
    category: String, //Main course,Dessert,Snacks
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItems", menuitemSchema);
