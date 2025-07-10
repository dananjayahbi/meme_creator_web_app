import { MemeTemplate, MemeProject, CanvasSettings } from '../types';

const STORAGE_KEYS = {
  TEMPLATES: 'meme_templates',
  PROJECTS: 'meme_projects',
  SETTINGS: 'meme_settings',
};

export const storageService = {
  // Template management - now uses API
  getTemplates: async (): Promise<MemeTemplate[]> => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      return data.templates || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  saveTemplate: async (template: MemeTemplate): Promise<void> => {
    // This is now handled by uploadTemplate for new templates
    // For existing templates, we update metadata only
    if (typeof window === 'undefined') return;
    const templates = await storageService.getTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      // Update existing template metadata
      templates[existingIndex] = template;
      localStorage.setItem(STORAGE_KEYS.TEMPLATES + '_cache', JSON.stringify(templates));
    }
  },

  uploadTemplate: async (file: File, name: string, width: number, height: number): Promise<MemeTemplate> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('width', width.toString());
    formData.append('height', height.toString());
    
    const response = await fetch('/api/templates', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload template');
    }
    
    const data = await response.json();
    return data.template;
  },

  deleteTemplate: async (templateId: string): Promise<void> => {
    const response = await fetch(`/api/templates?id=${templateId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete template');
    }
  },

  // Project management
  getProjects: (): MemeProject[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return stored ? JSON.parse(stored) : [];
  },

  saveProject: (project: MemeProject): void => {
    if (typeof window === 'undefined') return;
    const projects = storageService.getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...project, updatedAt: new Date() };
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  deleteProject: (projectId: string): void => {
    if (typeof window === 'undefined') return;
    const projects = storageService.getProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
  },

  // Settings management
  getSettings: (): any => {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : {};
  },

  saveSettings: (settings: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
};
