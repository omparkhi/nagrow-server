const express = require("express");
const router = express.Router();
const OrderController = require("../../controllers/Restaurant/getOrder.controller");

router.get("/:id", OrderController.getOrder);
router.put("/update-status", OrderController.updateStatus);

module.exports = router;