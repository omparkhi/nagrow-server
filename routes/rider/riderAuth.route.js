const express = require("express");
const router = express.Router();

const riderAuthController = require("../../controllers/rider/riderAuth.controller");

router.post("/register", riderAuthController.registerRider);
router.post("/login", riderAuthController.loginRider);

module.exports = router;
