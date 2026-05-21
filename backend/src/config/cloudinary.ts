import { v2 as cloudinary } from 'cloudinary';

export let isCloudinaryConfigured = false;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  isCloudinaryConfigured = true;
  console.log('Cloudinary configured successfully.');
} else {
  console.log('Cloudinary keys missing. Falling back to local file attachment uploads.');
}

export default cloudinary;
