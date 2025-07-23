const express = require("express");
const router = express.Router();

const upload = require("../middlewares/multer");
const restaurantController = require("../controllers/restaurant.controller");

const multiUpload = upload.fields([
  { name: "license", maxCount: 1 },
  { name: "gst", maxCount: 1 },
  { name: "ownerId", maxCount: 1 },
  { name: "shopPhoto", maxCount: 1 },
  { name: "logo", maxCount: 1 },
]);

router.post("/register", multiUpload, restaurantController.registerRestaurant);

module.exports = router;
