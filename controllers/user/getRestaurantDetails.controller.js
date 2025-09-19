const Restaurant = require("../../models/restaurant.model");
const MenuItems = require("../../models/menuItems.model");

// restaurant details for user(customer)
exports.getRestaurantDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the restaurant
    const restaurant = await Restaurant.findById(id).lean();
    if (!restaurant) {
      return res
        .status(400)
        .json({ success: false, message: "Restaurant not found" });
    }

    // 2. Find menu items of this restaurant
    const menuItems = await MenuItems.find({
      restaurantId: id,
      isAvailable: true,
    })
      .select("name description price image category")
      .lean();

    // 3. Group menu items by category (for Swiggy/Zomato style menus)
    const groupedMenu = {};
    menuItems.forEach((item) => {
      if (!groupedMenu[item.category]) groupedMenu[item.category] = [];
      groupedMenu[item.category].push(item);
    });

    // 4. Respond with restaurant + menu
    res.status(200).json({
      success: true,
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
        deliveryTime: restaurant.deliveryTime,
        image: restaurant.image,
      },
      menu: groupedMenu,
    });
  } catch (err) {
    console.log("Error fetching restaurant details", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
