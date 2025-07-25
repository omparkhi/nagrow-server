const express = require("express");
const router = express.Router();

const adminAuthController = require("../../controllers/admin/adminAuth.controller");

router.post("/register", adminAuthController.registerAdmin);
router.post("/login", adminAuthController.loginAdmin);

module.exports = router;
