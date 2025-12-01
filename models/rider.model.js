const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: Number,
      match: /^[6-9]\d{9}$/,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    assignedOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    isOnline: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: false },
    lastActive: { type: Date },

    documents: {
      aadharUrl: { type: String },
      licenseUrl: { type: String },
      photoUrl: { type: String },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
    },
    currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

riderSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Rider", riderSchema);
