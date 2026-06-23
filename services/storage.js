import { storage, STORAGE_BUCKET_ID, ID } from '@/lib/appwrite';

// UPLOAD IMAGE
export async function uploadImage(file, userId) {
  try {
    console.log('Uploading image for user:', userId);

    const fileId = ID.unique();
    const extension = file.name.split('.').pop();
    const fileName = `${fileId}.${extension}`;

    const result = await storage.createFile(
      STORAGE_BUCKET_ID,
      fileId,
      file
    );

    const imageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/view?project=69995d8000271ae62a8c`;

    console.log('Image uploaded successfully:', imageUrl);

    // ✅ IMPORTANT: return structured response
    return {
      success: true,
      imageUrl,
      imageId: fileId
    };

  } catch (error) {
    console.error('Error uploading image:', error);

    return {
      success: false,
      error: error.message
    };
  }
}


// DELETE IMAGE
export async function deleteImage(fileId) {
  try {
    await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
    console.log('Image deleted successfully:', fileId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
}


// GET IMAGE URL
export function getImageUrl(fileId) {
  return `https://fra.cloud.appwrite.io/v1/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/view?project=69995d8000271ae62a8c`;
}


// PREVIEW IMAGE
export function previewImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}