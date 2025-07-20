const { sendOtpToPhone } = require("../services/otp.services");
const otpModel = require("../models/otp.model");

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400), json({ message: "Phone number is required" });
  }

  // const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    const data = await sendOtpToPhone(phone, otp);

    if (data.Status === "Success") {
      await otpModel.create({ phone, otp });

      return res.json({
        success: true,
        message: "OTP sent successfully",
        sessionId: data.Details,
      });
    } else {
      return res.status(400).json({ success: false, message: data.Details });
    }
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!otp || !phone) {
    return res
      .status(400)
      .json({ success: false, message: "OTP or phone number is required" });
  }

  try {
    const data = await otpModel.findOne({ phone, otp });

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or phone number",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
