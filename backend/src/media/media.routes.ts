/**
 * Media Routes
 * Зураг upload - Cloudinary эсвэл local fallback
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storage, isCloudinaryConfigured } from './cloudinary.config';
import { uploadImage } from './media.controller';

const router = Router();

// Local upload хавтас бэлдэх
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Local storage тохиргоо (Cloudinary байхгүй үед)
const localStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `photo-${uniqueSuffix}${ext}`);
    },
});

// Cloudinary эсвэл local storage сонгох
const upload = isCloudinaryConfigured && storage
    ? multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })
    : multer({ storage: localStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/v1/media/upload
router.post('/upload', upload.single('image'), uploadImage);

export default router;
