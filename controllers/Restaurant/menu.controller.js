const MenuItems = require("../../models/menuItems.model");

const cloudinary = require("../../utils/cloudinary");

const uploadToCloudinary = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "menuItems",
        resource_type: "image",
        public_id: fileName,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

exports.addMenuItems = async (req, res) => {
  const { restaurantId, name, description, price, category, isAvailable } =
    req.body;

  try {
    if (
      !restaurantId ||
      !name ||
      !description ||
      !price ||
      !category ||
      !isAvailable
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    //uplaod image to cloudinary
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadToCloudinary(
        req.file.buffer,
        `${Date.now()}-${name}`
      );
    }

    // create menu item document

    const newMenuItem = new MenuItems({
      restaurantId,
      name,
      description,
      price,
      image: imageUrl,
      category,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    await newMenuItem.save();

    res.status(201).json({
      success: true,
      message: "Menu item added successfully",
      menuItem: newMenuItem,
    });
  } catch (err) {
    console.error("Error adding menu item:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getMenuItems = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const menuItem = await MenuItems.find({ restaurantId });
    res.status(200).json({ success: true, menuItem });
  } catch (err) {
    console.error("Error  fetching menu items: ", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateMenuItems = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedItem = await MenuItems.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      menuItem: updatedItem,
    });
  } catch (err) {
    console.error("Error updating menu item:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};
