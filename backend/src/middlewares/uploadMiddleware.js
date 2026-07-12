const multer = require('multer');
const fs = require('fs');
const AppError = require('../utils/appError');

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary (keys loaded from env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure where and how files are stored
const storage = process.env.CLOUDINARY_CLOUD_NAME 
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'resume-genie/uploads',
        resource_type: 'raw', // Required for raw files like PDFs
        allowed_formats: ['pdf', 'docx'],
        format: async (req, file) => file.originalname.split('.').pop()
      }
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueSuffix);
      }
    });

// Allow PDF and DOCX files
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF and DOCX files are allowed.', 400), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
});

module.exports = upload;