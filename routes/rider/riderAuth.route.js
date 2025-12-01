const express = require("express");
const router = express.Router();

const riderAuthController = require("../../controllers/rider/riderAuth.controller");

router.post("/send-otp", riderAuthController.sendOtp);
router.post("/verify-otp", riderAuthController.verifyOtp);
router.post("/register", riderAuthController.registerRider);
router.post("/login", riderAuthController.loginRider);
router.get("/profile/:id", riderAuthController.fetchProfile);
router.post("/update/location", riderAuthController.locationUpdate);

module.exports = router;
