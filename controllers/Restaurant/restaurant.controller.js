const Restaurant = require("../../models/restaurant.model");
const cloudinary = require("../../utils/cloudinary");

const uploadToCloudinary = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "restaurantDocs",
        resource_type: "auto",
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

exports.sendVerificationReqRestaurants = async (req, res) => {
  try {
    const { restaurantId } = req.body;

    console.log("id:", restaurantId);

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const fileFields = ["license", "gst", "ownerId", "shopPhoto", "logo"];
    const documents = {};

    for (const field of fileFields) {
      if (req.files[field]) {
        const file = req.files[field][0];
        documents[`${field}Url`] = await uploadToCloudinary(
          file.buffer,
          `${Date.now()}-${field}-${restaurantId}`
        );
      }
    }

    //update the restaurant with docs and set status pending
    restaurant.documents = { ...restaurant.documents, ...documents };
    restaurant.verificationStatus = "pending";
    restaurant.rejectionReason = "";

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Verification request submitted successfully",
      documents: restaurant.documents,
    });
  } catch (err) {
    console.error("Verification Error: ", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getVerificationStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select("verificationStatus rejectionReason");
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}