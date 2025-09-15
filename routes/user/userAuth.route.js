const express = require("express");

const userAuthController = require("../../controllers/user/userAuth.controller");
const { protect } = require("../../middlewares/user.middleware");

const router = express.Router();

router.post("/send-otp", userAuthController.sendOtp);
router.post("/verify-otp", userAuthController.verifyOtp);
router.post("/register", userAuthController.registerUser);
router.post("/login", userAuthController.loginUser);
router.post("/save-address", protect, userAuthController.saveAddress);
router.get("/get-address", protect, userAuthController.getAddress);
router.put(
  "/update-address/:addressId",
  protect,
  userAuthController.updateAddress
);
router.delete(
  "/delete-address/:addressId",
  protect,
  userAuthController.deleteAddress
);

module.exports = router;
