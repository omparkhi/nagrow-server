const Restaurant = require("../../models/restaurant.model.js");
const cloudinary = require("../../utils/cloudinary.js");
const bcrypt = require("bcryptjs");
const generateToken = require("../../utils/generateToken.js");

exports.registerRestaurant = async (req, res) => {
  const {
    name,
    ownername,
    phone,
    email,
    password,
    cuisine,
    address,
    deliveryTimeEstimate,
  } = req.body;

  if (!name || !ownername || !phone || !email || !password || !address) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled" });
  }

  try {
    const existing = await Restaurant.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //build location update
    let coordinates = [0, 0];
    if (
      address?.location?.coordinates &&
      Array.isArray(address.location.coordinates) &&
      address.location.coordinates.length === 2
    ) {
      coordinates = address.location.coordinates.map(Number);
    }

    const restaurant = await Restaurant.create({
      name,
      ownername,
      phone,
      email,
      password: hashedPassword,
      cuisine: cuisine ? (Array.isArray(cuisine) ? cuisine : [cuisine]) : [],
      deliveryTimeEstimate,
      address: {
        street: address?.street || "",
        city: address?.city || "",
        state: address?.state || "",
        pincode: address?.pincode || "",
        fullAddress: address?.fullAddress || "",
        location: {
          type: "Point",
          coordinates,
        },
      },
    });

    const token = generateToken(restaurant._id);

    return res.status(200).json({
      success: true,
      message: "Restaurant Registered Successfully",
      token,
      restaurant,
    });
  } catch (err) {
    console.error("Restaurant Registration Error: ", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.loginRestaurant = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const restaurant = await Restaurant.findOne({ email });

    if (!restaurant) {
      return res
        .status(404)
        .json({ message: "Restaurant with this email id Not Found" });
    }

    //compare password
    const isMatch = await bcrypt.compare(password, restaurant.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email id or password" });
    }

    const token = generateToken(restaurant._id);

    return res.status(200).json({
      success: true,
      message: "Restaurant Login Successfull",
      token,
      restaurant,
    });
  } catch (err) {
    console.log("Error while Restaurant Login", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAddress = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurantId);
    if(!restaurant || !restaurant.address || !restaurant.address.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No Address Found" });
    }
    console.log(restaurant.address);
    return res.status(200).message({ success: true, addresses: restaurant.address });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
