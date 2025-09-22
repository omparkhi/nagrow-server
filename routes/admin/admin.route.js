const express = require("express");
const router = express.Router();

const adminController = require("../../controllers/admin/admin.controller");

//restaurants
router.get(
  "/unverified/restaurants",
  adminController.getAllUnverifiedRestaurants
);

router.get("/verified/restaurants", adminController.getAllVerifiedRestaurants);

router.post(
  "/restaurant/verify-status-update/:id",
  adminController.updateVerificationStatus
);

//riders
router.get(
  "/unverified/riders", adminController.getAllUnverifiedRiders);

router.get("/verified/riders", adminController.getAllVerifiedRiders);

router.post(
  "/rider/verify-status-update/:id",
  adminController.updateRiderVerificationStatus
);

module.exports = router;
