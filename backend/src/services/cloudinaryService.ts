import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';

export interface UploadedFileResponse {
  url: string;
  filename: string;
  publicId: string;
}

export const uploadToCloudinary = async (file: Express.Multer.File): Promise<UploadedFileResponse> => {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Please set up CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }

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
    throw new Error(`Cloudinary upload failed: ${err.message}`);
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Cannot delete file.');
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err: any) {
    throw new Error(`Cloudinary deletion failed: ${err.message}`);
  }
};
