const Restaurant = require("../../models/restaurant.model");
const Rider = require("../../models/rider.model");


exports.getAllUnverifiedRestaurants = async (req, res) => {
  try {
    const unverifiedRestaurants = await Restaurant.find({
      isVerified: false,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: unverifiedRestaurants.length,
      data: unverifiedRestaurants,
    });
  } catch (err) {
    console.error("Error fetching unverified restaurants: ", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching unverified restaurants",
    });
  }
};

exports.getAllVerifiedRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isVerified: true })
      .select("-password")
      .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error fetching verified restaurants:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching verified restaurants",
    });
  }
};

exports.updateVerificationStatus = async (req, res) => {
  const { id } = req.params;
  const { action, rejectionReason } = req.body;

  try {
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "Resturant not found" });
    }

    if (action === "approve") {
      restaurant.isVerified = true;
      restaurant.verificationStatus = "verified";
      restaurant.rejectionReason = "";
    } else if (action === "reject") {
      if (!rejectionReason || rejectionReason.trim() === "") {
        return res
          .status(400)
          .json({ message: "Rejection reason is required" });
      }
      restaurant.isVerified = false;
      restaurant.verificationStatus = "rejected";
      restaurant.rejectionReason = rejectionReason;
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action. Use 'approve' or 'reject' " });
    }

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: `Restaurant ${action}d Successfully`,
      restaurant,
    });
  } catch (err) {
    console.error("Verification update error", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



exports.getAllUnverifiedRiders = async (req, res) => {
  try {
    const unverifiedRiders = await Rider.find({
      isVerified: false,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: unverifiedRiders.length,
      data: unverifiedRiders,
    });
  } catch (err) {
    console.error("Error fetching unverified riders: ", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching unverified riders",
    });
  }
};

exports.getAllVerifiedRiders = async (req, res) => {
  try {
    const riders = await Rider.find({ isVerified: true })
      .select("-password")
    //   .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: riders.length,
      data: riders,
    });
  } catch (error) {
    console.error("Error fetching verified riders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching verified riders",
    });
  }
};

exports.updateRiderVerificationStatus = async (req, res) => {
  const { id } = req.params;
  const { action, rejectionReason } = req.body;

  try {
    const rider = await Rider.findById(id);

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    if (action === "approve") {
      rider.isVerified = true;
      rider.verificationStatus = "verified";
      rider.rejectionReason = "";
    } else if (action === "reject") {
      if (!rejectionReason || rejectionReason.trim() === "") {
        return res
          .status(400)
          .json({ message: "Rejection reason is required" });
      }
      rider.isVerified = false;
      rider.verificationStatus = "rejected";
      rider.rejectionReason = rejectionReason;
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action. Use 'approve' or 'reject' " });
    }

    await rider.save();

    return res.status(200).json({
      success: true,
      message: `Rider ${action} Successfully`,
      rider,
    });
  } catch (err) {
    console.error("Verification update error", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
