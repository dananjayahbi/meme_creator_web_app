export interface MemeTemplate {
  id: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  textBoxes: TextBox[];
  createdAt: Date;
}

export interface TextBox {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  rotation: number;
  opacity: number;
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface CropRatio {
  name: string;
  ratio: number;
  width: number;
  height: number;
}

export interface MemeProject {
  id: string;
  name: string;
  template?: MemeTemplate;
  canvas: CanvasSettings;
  elements: CanvasElement[];
  groups?: LayerGroup[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  data: any;
}

export interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
}

export interface LayerItem {
  id: string;
  name: string;
  type: 'text' | 'image' | 'shape';
  visible: boolean;
  locked: boolean;
  order: number;
}

export interface LayerGroup {
  id: string;
  name: string;
  expanded: boolean;
  elements: string[]; // Element IDs
}
