import sharp from 'sharp';

export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 800,
      height: metadata.height || 600,
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: 800, height: 600 };
  }
}
