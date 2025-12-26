import { Router } from 'express';
import multer from 'multer';
import { storage, isCloudinaryConfigured } from './cloudinary.config';
import { uploadImage } from './media.controller';

const router = Router();

// Initialize multer with Cloudinary storage only if configured
const upload = storage 
    ? multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    })
    : multer(); // Dummy multer instance

// POST /api/v1/media/upload
router.post('/upload', (req, res, next) => {
    // Check configuration before attempting upload
    if (!isCloudinaryConfigured) {
        return res.status(503).json({ 
            status: 'error', 
            message: 'Image upload not configured. Please set CLOUDINARY_* environment variables.',
            hint: 'Get free account at https://cloudinary.com/ and add credentials to backend/.env'
        });
    }
    
    // Proceed with upload if configured
    upload.single('image')(req, res, next);
}, uploadImage);

export default router;
