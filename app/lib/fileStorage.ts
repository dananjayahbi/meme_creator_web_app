'use client';

import { MemeTemplate, MemeProject } from '../types';

export interface FileStorageService {
  // Template storage
  saveTemplate: (template: MemeTemplate, imageFile?: File) => Promise<void>;
  getTemplates: () => Promise<MemeTemplate[]>;
  deleteTemplate: (templateId: string) => Promise<void>;
  
  // Project storage
  saveProject: (project: MemeProject, imageFile?: File) => Promise<void>;
  getProjects: () => Promise<MemeProject[]>;
  deleteProject: (projectId: string) => Promise<void>;
  
  // Image storage
  saveImage: (file: File, type: 'template' | 'project' | 'export') => Promise<string>;
  deleteImage: (imageUrl: string) => Promise<void>;
}

class LocalFileStorageService implements FileStorageService {
  private readonly TEMPLATES_KEY = 'meme_creator_templates';
  private readonly PROJECTS_KEY = 'meme_creator_projects';
  private readonly IMAGES_KEY = 'meme_creator_images';

  // Convert File to base64 data URL for local storage
  private async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Store image and return URL
  async saveImage(file: File, type: 'template' | 'project' | 'export'): Promise<string> {
    try {
      const dataUrl = await this.fileToDataUrl(file);
      const imageId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get existing images
      const existingImages = JSON.parse(localStorage.getItem(this.IMAGES_KEY) || '{}');
      
      // Store image
      existingImages[imageId] = {
        dataUrl,
        type,
        filename: file.name,
        size: file.size,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem(this.IMAGES_KEY, JSON.stringify(existingImages));
      
      return imageId;
    } catch (error) {
      console.error('Failed to save image:', error);
      throw new Error('Failed to save image');
    }
  }

  // Get image URL by ID
  private getImageUrl(imageId: string): string {
    try {
      const images = JSON.parse(localStorage.getItem(this.IMAGES_KEY) || '{}');
      return images[imageId]?.dataUrl || '';
    } catch {
      return '';
    }
  }

  // Delete image
  async deleteImage(imageId: string): Promise<void> {
    try {
      const images = JSON.parse(localStorage.getItem(this.IMAGES_KEY) || '{}');
      delete images[imageId];
      localStorage.setItem(this.IMAGES_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }

  // Template operations
  async saveTemplate(template: MemeTemplate, imageFile?: File): Promise<void> {
    try {
      let imageUrl = template.imageUrl;
      
      if (imageFile) {
        const imageId = await this.saveImage(imageFile, 'template');
        imageUrl = this.getImageUrl(imageId);
      }

      const templates = await this.getTemplates();
      const existingIndex = templates.findIndex(t => t.id === template.id);
      
      const updatedTemplate = { ...template, imageUrl };
      
      if (existingIndex >= 0) {
        templates[existingIndex] = updatedTemplate;
      } else {
        templates.push(updatedTemplate);
      }

      localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save template:', error);
      throw new Error('Failed to save template');
    }
  }

  async getTemplates(): Promise<MemeTemplate[]> {
    try {
      const templates = JSON.parse(localStorage.getItem(this.TEMPLATES_KEY) || '[]');
      
      // Update image URLs from stored images
      return templates.map((template: MemeTemplate) => ({
        ...template,
        imageUrl: template.imageUrl.startsWith('template_') 
          ? this.getImageUrl(template.imageUrl) 
          : template.imageUrl
      }));
    } catch (error) {
      console.error('Failed to get templates:', error);
      return [];
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const templates = await this.getTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (template && template.imageUrl.startsWith('template_')) {
        await this.deleteImage(template.imageUrl);
      }
      
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw new Error('Failed to delete template');
    }
  }

  // Project operations
  async saveProject(project: MemeProject, imageFile?: File): Promise<void> {
    try {
      let exportImageUrl = '';
      
      if (imageFile) {
        const imageId = await this.saveImage(imageFile, 'project');
        exportImageUrl = this.getImageUrl(imageId);
      }

      const projects = await this.getProjects();
      const existingIndex = projects.findIndex(p => p.id === project.id);
      
      const updatedProject = { 
        ...project, 
        ...(exportImageUrl && { exportImageUrl }),
        updatedAt: new Date()
      };
      
      if (existingIndex >= 0) {
        projects[existingIndex] = updatedProject;
      } else {
        projects.push(updatedProject);
      }

      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('Failed to save project');
    }
  }

  async getProjects(): Promise<MemeProject[]> {
    try {
      return JSON.parse(localStorage.getItem(this.PROJECTS_KEY) || '[]');
    } catch (error) {
      console.error('Failed to get projects:', error);
      return [];
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const projects = await this.getProjects();
      const updatedProjects = projects.filter(p => p.id !== projectId);
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw new Error('Failed to delete project');
    }
  }
}

// Singleton instance
export const fileStorageService = new LocalFileStorageService();
