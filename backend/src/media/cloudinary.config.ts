import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Check if Cloudinary is configured
const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name-here' &&
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_KEY !== 'your-api-key-here' &&
    process.env.CLOUDINARY_API_SECRET && 
    process.env.CLOUDINARY_API_SECRET !== 'your-api-secret-here';

// Configure Cloudinary only if credentials are provided
if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('✅ Cloudinary configured successfully');
} else {
    console.warn('⚠️  Cloudinary NOT configured - Set CLOUDINARY_* env variables in .env file');
    console.warn('📝 Get free account at https://cloudinary.com/');
}

export const storage = isCloudinaryConfigured 
    ? new CloudinaryStorage({
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
    })
    : null;

export { isCloudinaryConfigured };
export default cloudinary;
