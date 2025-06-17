import { v2 as cloudinary } from 'cloudinary';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME) {
	throw new Error('CLOUDINARY_CLOUD_NAME is not defined in environment variables.');
}

if (!CLOUDINARY_API_KEY) {
	throw new Error('CLOUDINARY_API_KEY is not defined in environment variables.');
}

if (!CLOUDINARY_API_SECRET) {
	throw new Error('CLOUDINARY_API_SECRET is not defined in environment variables.');
}

cloudinary.config({
	cloud_name: CLOUDINARY_CLOUD_NAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
});

export { cloudinary as cloudinaryConfig };
