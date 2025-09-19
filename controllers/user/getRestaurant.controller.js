const Restaurant = require("../../models/restaurant.model");
const MenuItems = require("../../models/menuItems.model");

exports.getRestaurantWithFeaturedDish = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isOpen: true }).lean();
    const restaurantsWithDash = await Promise.all(
      restaurants.map(async (rest) => {
        const menuItems = await MenuItems.findOne({
          restaurantId: rest._id,
        }).sort({ createdAt: 1 });
        return { ...rest, featuredDish: menuItems || null };
      })
    );
    res.status(200).json({ success: true, restaurants: restaurantsWithDash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
