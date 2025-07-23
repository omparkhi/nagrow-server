const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const connectDB = require("./db/db");
const cors = require("cors");
const userAuthRoutes = require("./routes/userAuth.route");
const adminAuthRoutes = require("./routes/adminAuth.route");

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("this is home route");
});

app.use("/api/users", userAuthRoutes);
app.use("/api/admin", adminAuthRoutes);

module.exports = app;
