import html2canvas from 'html2canvas';

export const exportToImage = async (element: HTMLElement, filename: string = 'meme'): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      useCORS: true,
      scale: 2,
    });
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL();
    link.click();
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
