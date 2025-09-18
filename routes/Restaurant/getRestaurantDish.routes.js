const express = require("express");
const router = express.Router();

const restaurantController = require("../../controllers/Restaurant/getRestaurant.controller");

router.get("/home", restaurantController.getRestaurantWithFeaturedDish);

module.exports = router;
