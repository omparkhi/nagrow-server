const express = require("express");
const router = express.Router();

const upload = require("../../middlewares/multer");
const restaurantController = require("../../controllers/Restaurant/restaurantAuth.controller");

router.post("/register", restaurantController.registerRestaurant);
router.post("/login", restaurantController.loginRestaurant);

module.exports = router;
