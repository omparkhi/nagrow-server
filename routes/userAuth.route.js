const express = require("express");

const userAuthController = require("../controllers/userAuth.controller");

const router = express.Router();

router.post("/send-otp", userAuthController.sendOtp);
router.post("/verify-otp", userAuthController.verifyOtp);
router.post("/register", userAuthController.registerUser);
router.post("/login", userAuthController.loginUser);

module.exports = router;
