const { sendOtpToPhone } = require("../../services/otp.services");
const otpModel = require("../../models/otp.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../../utils/generateToken");
const User = require("../../models/user.model");
const axios = require("axios");

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

exports.fetchProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if(!user) return res.status(404).json({ message: "user not found" });

    res.json({ success: true, user })
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.saveAddress = async (req, res) => {
  const userId = req.user?._id;
  const { addressId, label, latitude, longitude } = req.body;
  if (!label || !latitude || !longitude) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const geoRes = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
    );

    if (!geoRes.data || geoRes.data.status !== "OK") {
      return res
        .status(400)
        .json({ message: "Failed to fetch address from Google Maps" });
    }
    const fullAddress = geoRes.data.results[0].formatted_address;
    const parts = fullAddress.split(",");
    const houseNo = parts[0]?.includes("/")
      ? parts[0].split("/")[1].trim()
      : parts[0].trim();
    const area = parts[1]?.trim() || "";
    const city = parts[2]?.trim() || "";
    const pinCode = parts[3]?.match(/\d{6}/)?.[0] || "";
    const country = parts[4]?.trim() || "";
    const formattedAddress = `House No: ${houseNo}, ${area}, ${city}, ${pinCode}, ${country}`;

    const newAddress = {
      label,
      fullAddress,
      formattedAddress,
      coordinates: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    };

    if (addressId) {
      // update existing address using Mongoose's subdocument update
      const address = user.address.id(addressId);
      if(!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      Object.assign(address, newAddress);

      address.label = label;
      address.fullAddress = fullAddress;
      address.formattedAddress = formattedAddress;
      address.coordinates = {
        type: "Point",
        coordinates: [longitude, latitude],
      };

      user.markModified("address");
    } else {
      // Add new address
      user.address.push(newAddress);
    }

    // console.log("Saving address:", newAddress);

    await user.save();

    return res.status(200).json({
      success: true,
      message: addressId
        ? "Address updated successfully"
        : "Address saved successfully",
      address: newAddress,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.query;

    const user = await User.findById(userId);
    // const user = await User.findById(userId);
    // console.log(user.address);


    if (!user || !user.address || user.address.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No address found" });
    }

    if(addressId) {
      user.address.forEach((a) => (a.selectedAddress = false));

      const target = user.address.id(addressId);
      if(!target) {
        return res
          .status(404)
          .json({ success: false, message: "Address not found" });
      }
      target.selectedAddress = true;
    }

    if(!user.address.some((a) => a.selectedAddress)) {
      user.address[0].selectedAddress = true;
    }

    user.address = user.address.filter(a => a.fullAddress && a.formattedAddress);

    await user.save();

    return res.status(200).json({
      success: true,
      message: addressId
        ? "Address selected successfully"
        : "Addresses fetched successfully",
      addresses: user.address,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateAddress = async (req, res) => {
  const { addressId } = req.params;
  const { formattedAddress } = req.body;

  if (!formattedAddress) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user.id, "address._id": addressId },
      {
        $set: {
          // "address.$.label": label,
          "address.$.formattedAddress": formattedAddress,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({
      success: true,
      message: "Address Updatd Successfully",
      addresses: user.address,
    });
  } catch (error) {
    console.log("Update Address Error", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteAddress = async (req, res) => {
  const { addressId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { address: { _id: addressId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.address,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


