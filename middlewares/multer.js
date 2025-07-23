const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedType = /\.(jpeg|jpg|png|pdf)$/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedType.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allwoed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
