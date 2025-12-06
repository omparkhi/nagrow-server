const Rider = require("../../models/rider.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../../utils/generateToken");
const sendOtpToPhone = require("../../services/otp.services");
const otpModel = require("../../models/otp.model");
const { emitToUser, emitToRestaurant, emitToRider } = require("../../services/emit.socket");
const { getSocket } = require("../../socket");

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

exports.registerRider = async (req, res) => {
  const { name, phone, email, password, location } = req.body;

  if (!name || !phone || !password) {
    return res
      .status(400)
      .json({ message: "Name, phone and password are required" });
  }

  try {
    const existingRider = await Rider.findOne({ phone });

    if (existingRider) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const rider = await Rider.create({
      name,
      phone,
      email,
      password: hashedPassword,
      location: {
        type: "Point",
        coordinates: Array.isArray(location?.coordinates)
          ? location.coordinates.map(Number)
          : [0, 0],
      },
    });

    const token = generateToken(rider._id);

    return res.status(201).json({
      success: true,
      message: "Rider registered successfully",
      token,
      rider,
    });
  } catch (err) {
    console.error("Rider Registration Error: ", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.loginRider = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: "Phone and password are required" });
  }

  try {
    const rider = await Rider.findOne({ phone });
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    const isMatch = await bcrypt.compare(password, rider.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid  phone or password" });
    }

    const token = generateToken(rider._id);

    return res.status(200).json({
      success: true,
      message: "Rider Login successfully",
      token,
      rider,
    });
  } catch (err) {
    console.error("Rider Login error", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.fetchProfile = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id).select("-password");
    if (!rider) return res.status(404).json({ message: "rider not found" });
    // console.log("rider info from backend:", rider)

    res.json({ success: true, rider });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.locationUpdate = async (req, res) => {
  try {
    const { riderId, coords } = req.body;

    if (!riderId || !coords) {
      return res.status(400).json({ message: "Missing data" });
    }

    const rider = await Rider.findByIdAndUpdate(riderId, {
      location: coords,
      isOnline: true,
      isAvailable: true,
      lastActive: new Date(),
    });
    // // console.log("rider tracking start:", rider);
    // emitToUser(rider.currentOrderId, "rider:location", {
    //   lat: rider.location
    // })

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}

exports.stopShift = async (req, res) => {
  try {
    const { riderId } = req.body;
  if (!riderId) {
    return res.status(400).json({ message: "Missing data" });
  }

  const rider = await Rider.findByIdAndUpdate(riderId, {
    isOnline: false,
    isAvailable: false,
    location: null
  },
  { new: true }
);
  const io = getSocket();
  // req.io.to(riderId).emit("rider:offline", { riderId });

  res.json({ success: true });  
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}
