import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

export const isCloudinaryConfigured = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'placeholder';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'placeholder',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder'
});

const storage = isCloudinaryConfigured
  ? new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'stayscape_properties',
      allowedFormats: ['jpeg', 'png', 'jpg', 'webp']
    }
  })
  : multer.memoryStorage(); // Fallback to memory storage so it doesn't crash submitting to Cloudinary

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max limit
});
export default cloudinary;
