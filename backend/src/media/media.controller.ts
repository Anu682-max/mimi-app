import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response) => {
    try {
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
        return res.status(500).json({ status: 'error', message: 'Upload failed' });
    }
};
