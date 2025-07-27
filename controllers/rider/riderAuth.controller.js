const Rider = require("../../models/rider.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../../utils/generateToken");

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
