import { MemeTemplate, MemeProject, CanvasSettings } from '../types';

const STORAGE_KEYS = {
  TEMPLATES: 'meme_templates',
  PROJECTS: 'meme_projects',
  SETTINGS: 'meme_settings',
};

export const storageService = {
  // Template management
  getTemplates: (): MemeTemplate[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return stored ? JSON.parse(stored) : [];
  },

  saveTemplate: (template: MemeTemplate): void => {
    if (typeof window === 'undefined') return;
    const templates = storageService.getTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  },

  deleteTemplate: (templateId: string): void => {
    if (typeof window === 'undefined') return;
    const templates = storageService.getTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
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
