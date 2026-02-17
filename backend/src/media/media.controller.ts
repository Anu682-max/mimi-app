/**
 * Media Controller
 * Зураг upload, resize, validation
 * Cloudinary эсвэл local файл системд хадгална
 */

import { Request, Response } from 'express';
import sharp from 'sharp';
import { isCloudinaryConfigured } from './cloudinary.config';

// Зөвшөөрөгдсөн MIME type-ууд
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Зураг upload хийх
export const uploadImage = (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No file uploaded' });
        }

        // MIME type шалгах
        if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
            });
        }

        // Файлын хэмжээ шалгах
        if (req.file.size > MAX_FILE_SIZE) {
            return res.status(400).json({
                status: 'error',
                message: 'File too large. Maximum size is 5MB.',
            });
        }

        let url: string;
        let publicId: string;

        if (isCloudinaryConfigured && req.file.path && req.file.path.startsWith('http')) {
            // Cloudinary upload - path нь URL байна
            url = req.file.path;
            publicId = req.file.filename;
        } else {
            // Local upload - static файл болгон буцаах
            const port = process.env.PORT || 3699;
            url = `http://localhost:${port}/uploads/${req.file.filename}`;
            publicId = req.file.filename;
        }

        return res.status(200).json({
            status: 'success',
            data: {
                url,
                public_id: publicId,
                format: req.file.mimetype,
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Upload failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Зураг resize хийх (buffer-ээс)
export async function resizeImage(
    buffer: Buffer,
    options: { width?: number; height?: number; quality?: number } = {}
): Promise<Buffer> {
    const { width = 1000, height, quality = 80 } = options;

    let transformer = sharp(buffer);
    const metadata = await transformer.metadata();

    if (metadata.width && metadata.width > width) {
        transformer = transformer.resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
        });
    }

    return transformer
        .webp({ quality })
        .toBuffer();
}

// Аватар зураг (thumbnail) үүсгэх
export async function createThumbnail(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
        .resize(200, 200, { fit: 'cover' })
        .webp({ quality: 70 })
        .toBuffer();
}
