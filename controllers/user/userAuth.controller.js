const { sendOtpToPhone } = require("../../services/otp.services");
const otpModel = require("../../models/otp.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../../utils/generateToken");
const User = require("../../models/user.model");

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

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

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  if (!firstName || !lastName || !phone || !password) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled" });
  }

  try {
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this phone" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.firstName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Registration Error: ", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.loginUser = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res
      .status(400)
      .json({ message: "Phone number and password are required" });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this number" });
    }

    //compare password

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid phone number or password" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.firstName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Login Error", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.saveAddress = async (req, res) => {
  const { label, latitude, longitude } = req.body;
  if (!label || !latitude || !longitude) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const newAddress = {
      label,
      coordinates: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    };

    user.address.push(newAddress);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address saved successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.address || user.address.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No address found" });
    }
    return res.status(200).json({ success: true, addresses: user.address });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
