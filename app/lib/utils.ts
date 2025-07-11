import html2canvas from 'html2canvas';

export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp' | 'svg';
  quality: number;
  width: number;
  height: number;
  scale: number;
  filename: string;
  backgroundColor: string;
  includeTransparency: boolean;
  returnDataUrl?: boolean;
}

export const exportToImage = async (
  element: HTMLElement, 
  options: Partial<ExportOptions> = {}
): Promise<string | null> => {
  try {
    const {
      filename = 'meme',
      format = 'png',
      quality = 0.9,
      scale = 2,
      width,
      height,
      backgroundColor = null,
      includeTransparency = true,
      returnDataUrl = false
    } = options;
    
    // Configure canvas options based on format
    const canvasOptions = {
      backgroundColor: includeTransparency ? null : (backgroundColor || '#ffffff'),
      useCORS: true,
      scale,
      logging: false,
      allowTaint: true,
      width,
      height
    };
    
    const canvas = await html2canvas(element, canvasOptions);
    
    // Apply resize if needed
    let finalCanvas = canvas;
    if (width && height && (width !== canvas.width || height !== canvas.height)) {
      finalCanvas = document.createElement('canvas');
      finalCanvas.width = width;
      finalCanvas.height = height;
      const ctx = finalCanvas.getContext('2d');
      if (ctx) {
        if (!includeTransparency && backgroundColor) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height);
      }
    }
    
    let dataUrl: string;
    
    if (format === 'jpg' || format === 'webp') {
      dataUrl = finalCanvas.toDataURL(`image/${format}`, quality / 100); // Quality is 0-1
    } else {
      // PNG format
      dataUrl = finalCanvas.toDataURL('image/png');
    }
    
    // If just returning the dataURL
    if (returnDataUrl) {
      return dataUrl;
    }
    
    // Download the image
    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = dataUrl;
    link.click();
    
    return dataUrl;
  } catch (error) {
    console.error('Error exporting image:', error);
    throw error;
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const resizeImage = (
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const { width, height } = img;
  const ratio = Math.min(maxWidth / width, maxHeight / height);
  
  return {
    width: width * ratio,
    height: height * ratio,
  };
};

export const downloadFile = (content: string, filename: string, type: string = 'text/plain'): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
