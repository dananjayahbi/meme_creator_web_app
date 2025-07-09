import { CropRatio } from '../types';

export const CROP_RATIOS: CropRatio[] = [
  { name: 'Custom', ratio: 0, width: 800, height: 600 },
  { name: 'Square (1:1)', ratio: 1, width: 800, height: 800 },
  { name: 'Facebook Post (1.91:1)', ratio: 1.91, width: 1200, height: 628 },
  { name: 'Instagram Post (1:1)', ratio: 1, width: 1080, height: 1080 },
  { name: 'Instagram Story (9:16)', ratio: 0.5625, width: 1080, height: 1920 },
  { name: 'Twitter Post (16:9)', ratio: 1.78, width: 1200, height: 675 },
  { name: 'LinkedIn Post (1.91:1)', ratio: 1.91, width: 1200, height: 628 },
  { name: 'YouTube Thumbnail (16:9)', ratio: 1.78, width: 1280, height: 720 },
  { name: 'Pinterest Pin (2:3)', ratio: 0.67, width: 1000, height: 1500 },
  { name: 'TikTok Video (9:16)', ratio: 0.5625, width: 1080, height: 1920 },
];

export const DEFAULT_CANVAS_SETTINGS = {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
};

export const DEFAULT_TEXT_STYLE = {
  fontSize: 32,
  fontFamily: 'Arial',
  color: '#000000',
  backgroundColor: 'transparent',
  borderColor: '#000000',
  borderWidth: 0,
  textAlign: 'center' as const,
  fontWeight: 'bold' as const,
  fontStyle: 'normal' as const,
  rotation: 0,
  opacity: 1,
};

export const POPULAR_FONTS = [
  'Arial',
  'Impact',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Comic Sans MS',
  'Trebuchet MS',
  'Courier New',
  'Lucida Console',
];
