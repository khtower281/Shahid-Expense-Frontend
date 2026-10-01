import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf'
];

export const validateReceiptFile = (file) => {
  if (!file) return 'No file selected';
  if (!ALLOWED_MIME.includes(file.type)) {
    return 'Only JPG, PNG, WEBP, GIF images or PDF files are allowed';
  }
  if (file.size > MAX_BYTES) {
    return 'File size must be under 5 MB';
  }
  return null;
};

/**
 * Upload a file to Cloudinary using an unsigned preset.
 * @param {File} file
 * @param {(percent:number)=>void} [onProgress]
 * @returns {Promise<{ url: string; publicId: string; format: string }>}
 */
export const uploadToCloudinary = async (file, onProgress) => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  /* Using /auto/upload so it handles both images and PDFs */
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  const { data } = await axios.post(endpoint, formData, {
    onUploadProgress: (e) => {
      if (!onProgress || !e.total) return;
      onProgress(Math.round((e.loaded * 100) / e.total));
    }
  });

  return {
    url: data.secure_url,
    publicId: data.public_id,
    format: data.format
  };
};