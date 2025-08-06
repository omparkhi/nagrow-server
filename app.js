const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const connectDB = require("./db/db");
const cors = require("cors");
const userAuthRoutes = require("./routes/user/userAuth.route");
const adminAuthRoutes = require("./routes/admin/adminAuth.route");
const restaurantAuthRoutes = require("./routes/Restaurant/restaurantAuth.routes");
const riderAuthRoutes = require("./routes/rider/riderAuth.route");
const adminRoutes = require("./routes/admin/admin.route");
const riderRoutes = require("./routes/rider/rider.route");
const restaurantRoutes = require("./routes/Restaurant/restaurant.routes");
const menuRoutes = require("./routes/Restaurant/menu.routes");

connectDB();

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("this is home route");
});

app.use("/api/users", userAuthRoutes);
app.use("/api/restaurants", restaurantAuthRoutes);
app.use("/api/rider", riderAuthRoutes);
app.use("/api/rider", riderRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/restaurants", menuRoutes);

module.exports = app;
