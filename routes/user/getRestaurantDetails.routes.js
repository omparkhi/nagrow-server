const express = require("express");
const router = express.Router();

const restaurantController = require("../../controllers/user/getRestaurantDetails.controller");

router.get("/:id", restaurantController.getRestaurantDetails);

module.exports = router;
