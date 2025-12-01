const express = require("express");
const router = express.Router();
const NotificationController = require("../../controllers/notification/notification.controller");

router.post("/", NotificationController.createNotification);
router.get("/", NotificationController.getNotifications);
router.patch("/mark-read", NotificationController.markAllRead);

module.exports = router;