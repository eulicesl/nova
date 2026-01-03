/**
 * Image Utilities
 * Handles image processing for vision model support
 */

import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

/**
 * Image attachment data structure
 */
export interface ImageAttachment {
  uri: string;
  base64?: string;
  mimeType: string;
  width?: number;
  height?: number;
  fileName?: string;
}

/**
 * Maximum image dimension for resizing
 * Larger images will be scaled down to prevent API issues
 */
const MAX_IMAGE_DIMENSION = 1024;

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Pick image from camera
 */
export async function pickImageFromCamera(): Promise<ImageAttachment | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    base64: true,
    exif: false
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    base64: asset.base64 || undefined,
    mimeType: asset.mimeType || 'image/jpeg',
    width: asset.width,
    height: asset.height,
    fileName: asset.fileName || `camera_${Date.now()}.jpg`
  };
}

/**
 * Pick image from gallery
 */
export async function pickImageFromGallery(): Promise<ImageAttachment | null> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    base64: true,
    exif: false
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    base64: asset.base64 || undefined,
    mimeType: asset.mimeType || 'image/jpeg',
    width: asset.width,
    height: asset.height,
    fileName: asset.fileName || `image_${Date.now()}.jpg`
  };
}

/**
 * Read image as base64 from URI
 */
export async function readImageAsBase64(uri: string): Promise<string | null> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64
    });
    return base64;
  } catch (error) {
    console.error('Failed to read image as base64:', error);
    return null;
  }
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromUri(uri: string): string {
  const extension = uri.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp'
  };
  return mimeTypes[extension || ''] || 'image/jpeg';
}

/**
 * Ensure image has base64 data
 */
export async function ensureBase64(image: ImageAttachment): Promise<ImageAttachment> {
  if (image.base64) {
    return image;
  }

  const base64 = await readImageAsBase64(image.uri);
  return {
    ...image,
    base64: base64 || undefined
  };
}

/**
 * Format image for Ollama API
 * Returns just the base64 string (without data URL prefix)
 */
export function formatImageForOllama(image: ImageAttachment): string | null {
  if (!image.base64) {
    return null;
  }

  // Remove data URL prefix if present
  const base64 = image.base64.replace(/^data:image\/\w+;base64,/, '');
  return base64;
}

/**
 * Create a data URL from base64 and mime type
 */
export function createDataUrl(base64: string, mimeType: string): string {
  // Remove any existing data URL prefix
  const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
  return `data:${mimeType};base64,${cleanBase64}`;
}

/**
 * Validate that an image is suitable for upload
 */
export function validateImage(image: ImageAttachment): { valid: boolean; error?: string } {
  if (!image.uri) {
    return { valid: false, error: 'No image URI provided' };
  }

  if (!image.base64) {
    return { valid: false, error: 'Image base64 data not available' };
  }

  // Check file size (base64 is ~33% larger than binary)
  const estimatedSize = (image.base64.length * 3) / 4;
  const maxSize = 20 * 1024 * 1024; // 20MB limit

  if (estimatedSize > maxSize) {
    return { valid: false, error: 'Image is too large (max 20MB)' };
  }

  return { valid: true };
}
