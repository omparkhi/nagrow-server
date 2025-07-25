const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    ownername: {
      type: String,
    },

    phone: {
      type: Number,
      match: /^[6-9]\d{9}$/,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    password: {
      type: String,
      required: true,
    },

    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },

    cuisine: {
      type: [String],
      default: [],
    },

    // rating: {
    //   type: Number,
    //   default: 0,
    //   min: 1,
    //   max: 5,
    // },

    isOpen: {
      type: Boolean,
      default: true,
    },

    documents: {
      licenseUrl: { type: String },
      gstUrl: { type: String },
      ownerIdUrl: { type: String },
      shopPhotoUrl: { type: String },
      logoUrl: { type: String },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["not_submitted", "pending", "verified", "rejected"],
      default: "not_submitted",
    },

    rejectionReason: {
      type: String,
    },

    deliveryTimeEstimate: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
