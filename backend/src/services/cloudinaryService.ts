import fs from 'fs';
import path from 'path';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

export interface UploadedFileResponse {
  url: string;
  filename: string;
  publicId: string;
}

export const uploadToCloudinary = async (file: Express.Multer.File): Promise<UploadedFileResponse> => {
  if (isCloudinaryConfigured) {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'issue-tracker' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });
      return {
        url: result.secure_url,
        filename: file.originalname,
        publicId: result.public_id,
      };
    } catch (err: any) {
      console.warn('⚠️ Cloudinary stream upload failed. Falling back to local upload.', err.message);
    }
  }

  // Fallback to storing locally in /uploads
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.originalname}`;
  const destPath = path.join(LOCAL_UPLOAD_DIR, uniqueName);
  
  fs.writeFileSync(destPath, file.buffer);

  // Return local URL, using an endpoint on the backend
  return {
    url: `/uploads/${uniqueName}`,
    filename: file.originalname,
    publicId: uniqueName, // we use unique local filename as publicId
  };
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (isCloudinaryConfigured && !publicId.startsWith('uploads-') && publicId.includes('/')) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return;
    } catch (err: any) {
      console.warn('⚠️ Cloudinary delete failed:', err.message);
    }
  }

  // Attempt local file deletion if it exists
  const filePath = path.join(LOCAL_UPLOAD_DIR, publicId);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e: any) {
      console.warn('⚠️ Local file delete failed:', e.message);
    }
  }
};
