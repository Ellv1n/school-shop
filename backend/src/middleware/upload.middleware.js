const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (/jpeg|jpg|png|gif|webp/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Yalnız şəkil faylları qəbul edilir.'));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
