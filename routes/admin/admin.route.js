const express = require("express");
const router = express.Router();

const adminController = require("../../controllers/admin/admin.controller");

router.get(
  "/unverified/restaurants",
  adminController.getAllUnverifiedRestaurants
);

router.get("/verified/restaurants", adminController.getAllVerifiedRestaurants);

router.post(
  "/restaurant/verify-status-update/:id",
  adminController.updateVerificationStatus
);

module.exports = router;
