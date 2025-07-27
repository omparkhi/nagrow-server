const Rider = require("../../models/rider.model");
const cloudinary = require("../../utils/cloudinary");

const uploadToCloudinary = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "riderDocs",
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

exports.sendVerificationRequest = async (req, res) => {
  try {
    const { riderId } = req.body;
    const rider = await Rider.findById(riderId);

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    const fields = ["license", "idProof", "profilePhoto"];
    const documents = {};

    for (const field of fields) {
      if (req.files[field]) {
        const file = req.files[field][0];
        documents[`${field}Url`] = await uploadToCloudinary(
          file.buffer,
          `${Date.now()}-${field}`
        );
      }
    }

    rider.documents = {
      ...rider.documents,
      licenseUrl: documents.licenseUrl,
      aadharUrl: documents.idProofUrl,
      photoUrl: documents.profilePhotoUrl,
    };

    rider.verificationStatus = "pending";
    await rider.save();

    res.status(200).json({
      success: true,
      message: "Verification documents uploaded successfully",
      documents,
    });
  } catch (err) {
    console.error("Rider sending Verification req Error: ", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
