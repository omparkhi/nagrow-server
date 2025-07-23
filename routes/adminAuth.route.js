const express = require("express");
const router = express.Router();

const adminAuthController = require("../controllers/adminAuth.controller");

router.post("/register-admin", adminAuthController.registerAdmin);
router.post("/login-admin", adminAuthController.loginAdmin);

module.exports = router;
