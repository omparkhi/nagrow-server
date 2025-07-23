const Admin = require("../models/admin.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

exports.registerAdmin = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  if ((!firstName, !lastName, !email, !phone, !password)) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled" });
  }

  try {
    const existingUser = await Admin.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this phone" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    const token = generateToken(admin._id);

    return res.status(201).json({
      success: true,
      message: "Admin registered Successfully",
      token,
      admin: {
        id: admin._id,
        name: admin.firstName,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (err) {
    console.error("Admin Registration Error", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if ((!email, !password)) {
    return res.status(400).json({ message: "Email and password is required" });
  }

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin not found with this number" });
    }

    //compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const token = generateToken(admin._id);

    return res.status(200).json({
      success: true,
      message: "Admin Login Successfull",
      token,
      admin: {
        id: admin._id,
        name: admin.firstName,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (err) {
    console.error("Error while Admin Login", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
