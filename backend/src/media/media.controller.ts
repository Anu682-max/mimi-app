import { Request, Response } from 'express';
import { isCloudinaryConfigured } from './cloudinary.config';

export const uploadImage = (req: Request, res: Response) => {
    try {
        // Check if Cloudinary is configured
        if (!isCloudinaryConfigured) {
            return res.status(503).json({ 
                status: 'error', 
                message: 'Image upload not configured. Please set CLOUDINARY_* environment variables.',
                hint: 'Get free account at https://cloudinary.com/ and add credentials to backend/.env'
            });
        }

        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No file uploaded' });
        }

        // Access file info provided by multer-storage-cloudinary
        const result = {
            url: req.file.path,
            public_id: req.file.filename,
            format: req.file.mimetype,
        };

        return res.status(200).json({
            status: 'success',
            data: result
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
