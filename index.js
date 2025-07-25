const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const connectDB = require("./db/db");

connectDB();

app.get("/", (req, res) => {
  res.send("this is home route");
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
