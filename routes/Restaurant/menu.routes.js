const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/multer");
const menuItemsController = require("../../controllers/Restaurant/menu.controller");

router.post(
  "/menu/add",
  upload.single("image"),
  menuItemsController.addMenuItems
);

router.get("/menu/:restaurantId", menuItemsController.getMenuItems);

router.post = module.exports = router;
