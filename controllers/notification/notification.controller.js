const Notification = require("../../models/notification.model");

exports.createNotification = async (req, res) => {
  try {
    const payload = req.body;
    // Basic validation
    if (!payload.receiverId || !payload.receiverModel) {
      return res.status(400).json({ success: false, message: "receiverId and receiverModel required" });
    }

    const created = await Notification.create(payload);
    return res.status(201).json({ success: true, notification: created });
  } catch (err) {
    console.error("createNotification error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { receiverId, limit = 50, skip = 0 } = req.query;
    if (!receiverId) return res.status(400).json({ success: false, message: "receiverId required" });

    const notifications = await Notification.find({ receiverId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    return res.json({ success: true, notifications });
  } catch (err) {
    console.error("getNotifications error:", err);
    return res.status(500).json({ success: false });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ success: false });

    await Notification.updateMany({ receiverId }, { $set: { read: true } });
    return res.json({ success: true });
  } catch (err) {
    console.error("markAllRead error:", err);
    return res.status(500).json({ success: false });
  }
};