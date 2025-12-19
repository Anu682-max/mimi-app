import { Router } from 'express';
import multer from 'multer';
import { storage } from './cloudinary.config';
import { uploadImage } from './media.controller';

const router = Router();

// Initialize multer with Cloudinary storage
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/v1/media/upload
router.post('/upload', upload.single('image'), uploadImage);

export default router;
