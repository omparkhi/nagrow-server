const express = require("express");

const userAuthController = require("../controllers/userAuth.controller");

const router = express.Router();

router.post("/send-otp", userAuthController.sendOtp);

module.exports = router;
