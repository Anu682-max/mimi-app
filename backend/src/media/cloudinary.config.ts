import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
// Note: If keys are missing, it will default to empty/undefined which might cause errors on upload
// but we handle errors in the controller.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'indate-uploads',
            allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
            public_id: `upload-${Date.now()}-${Math.round(Math.random() * 1000)}`,
            // @ts-ignore - Cloudinary specific param
            transformation: [{ width: 1000, margin: "auto", crop: "limit" }]
        };
    },
});

export default cloudinary;
