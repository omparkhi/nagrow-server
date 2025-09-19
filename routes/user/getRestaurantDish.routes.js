const express = require("express");
const router = express.Router();

const restaurantController = require("../../controllers/user/getRestaurant.controller");

router.get("/home", restaurantController.getRestaurantWithFeaturedDish);

module.exports = router;
