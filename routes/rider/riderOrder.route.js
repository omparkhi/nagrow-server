const express = require("express");
const router = express.Router();

const riderOrderController = require("../../controllers/rider/riderOrder.controller");

router.post("/order/response", riderOrderController.riderResponse);
router.get("/order/:id", riderOrderController.getRiderOrderdetails);
router.put("/order/update/status", riderOrderController.updateRiderOrderStatus);

module.exports = router;