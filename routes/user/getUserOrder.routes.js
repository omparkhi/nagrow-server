const express = require("express");
const router = express.Router();
const getUserOrderController = require("../../controllers/user/getUserOrder.controller");
const { protect } = require("../../middlewares/user.middleware");

router.get("/order/:id", protect, getUserOrderController.getUserOrder);

module.exports = router;