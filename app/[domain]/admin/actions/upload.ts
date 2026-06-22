'use server'

import cloudinary from '@/lib/cloudinary';

export async function uploadVideoToCloudinary(formData: FormData) {
  const file = formData.get('file') as File;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder: 'marea-medios-uploads' },
      (error, result) => {
        if (error) reject(error);
        // Retornamos ambos valores
        resolve({ url: result?.secure_url, publicId: result?.public_id });
      }
    ).end(buffer);
  });
}