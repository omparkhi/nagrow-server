const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/multer");

const riderController = require("../../controllers/rider/rider.controller");

const multiUpload = upload.fields([
  { name: "license", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 },
]);

router.post(
  "/send-verify-req/rider",
  multiUpload,
  riderController.sendVerificationRequest
);

router.get(
  "/get-verification-status/:riderId",
  riderController.getVerificationStatus
);

module.exports = router;
