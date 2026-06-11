import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protect } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';

const MAX_SIZE_MB = 2;

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'impact-reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation:  [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

const router = express.Router();
router.use(protect);

// POST /api/upload  →  { url: 'https://res.cloudinary.com/...' }
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file received' });
  res.json({ url: req.file.path });
});

// multer / cloudinary error handler
router.use((err, _req, res, _next) => {
  console.error('[upload error]', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: `File too large — maximum size is ${MAX_SIZE_MB} MB` });
  }
  const message = err.http_code
    ? `Cloudinary error ${err.http_code}: ${err.message}`
    : (err.message || 'Upload failed');
  res.status(400).json({ message });
});

export default router;
