  const dotenv = require("dotenv");
  dotenv.config();

  const express = require("express");
  const app = express();
  const connectDB = require("./db/db");
  const cors = require("cors");
  const userAuthRoutes = require("./routes/user/userAuth.route");
  const adminAuthRoutes = require("./routes/admin/adminAuth.route");
  const restaurantAuthRoutes = require("./routes/Restaurant/restaurantAuth.routes");
  const restaurantOrderRoutes = require("./routes/Restaurant/getOrder.routes");
  const restaurantOrderByIdRoutes = require("./routes/Restaurant/getOrderById.routes");
  const riderAuthRoutes = require("./routes/rider/riderAuth.route");
  const adminRoutes = require("./routes/admin/admin.route");
  const riderRoutes = require("./routes/rider/rider.route");
  const restaurantRoutes = require("./routes/Restaurant/restaurant.routes");
  const menuRoutes = require("./routes/Restaurant/menu.routes");
  const getRestaurantDish = require("./routes/user/getRestaurantDish.routes");
  const getRestaurantDetails = require("./routes/user/getRestaurantDetails.routes");
  const paymentRoutes = require("./routes/user/payment.routes");
  const getUserOrderRoutes = require("./routes/user/getUserOrder.routes");
  const notificationRoutes = require("./routes/notification/notification.routes");
  const riderOrderRoute = require("./routes/rider/riderOrder.route");

  connectDB();

  // app.use(
  //   cors({
  //     origin: "http://localhost:5173",
  //     credentials: true,
  //   })
  // );
  const allowedOrigins = [
    "https://nagrow-client-demo.vercel.app",
    "http://localhost:5173",
    "http://localhost:8081",
  ];

  // CORS
  app.use(cors({
    origin: "*",
    credentials: true,
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));


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
  app.use("/api/restaurants", getRestaurantDish);
  app.use("/api/restaurants", getRestaurantDetails);
  app.use("/api/get/orders", restaurantOrderRoutes);
  app.use("/api/payment", paymentRoutes)
  app.use("/api/order/details", restaurantOrderByIdRoutes);

  app.use("/api/user", getUserOrderRoutes);

 app.use("/api/notifications", notificationRoutes);

 app.use("/api/rider", riderOrderRoute);

  module.exports = app;
