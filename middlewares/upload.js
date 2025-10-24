import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadPath = "public/uploads/";
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, uniqueName);
  },
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  if (allowedTypes.test(ext) && allowedTypes.test(mime)) cb(null, true);
  else cb(new Error("Only image files are allowed!"));
};

// Multer instance with limits
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Section-wise fields (according to admin panel form)
export const uploadFields = upload.fields([
  { name: "images", maxCount: 6 },           // multiple main images
  { name: "descriptionImage", maxCount: 1 }, // Description section
  { name: "ingredientsImage", maxCount: 1 }, // Star Ingredients section
  { name: "howToUseImage", maxCount: 1 },    // How To Use section
  { name: "suitableForImage", maxCount: 1 }, // Suitable For section
  { name: "benefitsImage", maxCount: 1 },    // Benefits section
]);

// Middleware to format uploaded files paths for frontend
export const formatUploadedFiles = (req, res, next) => {
  if (!req.files) return next();

  const fileFields = [
    "images",
    "descriptionImage",
    "ingredientsImage",
    "howToUseImage",
    "suitableForImage",
    "benefitsImage",
  ];

  fileFields.forEach(field => {
    if (req.files[field]) {
      req.files[field] = req.files[field].map(f => `/uploads/${f.filename}`);
    }
  });

  next();
};

export default upload;
