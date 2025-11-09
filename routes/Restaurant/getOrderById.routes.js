const express = require("express");
const router = express.Router();
const OrderByIdController = require("../../controllers/Restaurant/getOrderById.controller");

router.get("/:id", OrderByIdController.getOrderById);

module.exports = router;