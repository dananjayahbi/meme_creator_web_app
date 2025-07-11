'use client';

import { useState, useEffect, useCallback } from 'react';
import { MemeProject, MemeTemplate, CanvasElement, LayerGroup, CanvasSettings } from '../types';
import { storageService } from '../lib/storage';
import { generateId } from '../lib/utils';
import { DEFAULT_CANVAS_SETTINGS, DEFAULT_TEXT_STYLE } from '../lib/constants';

interface UseMemeCreatorReturn {
  currentProject: MemeProject | null;
  templates: MemeTemplate[];
  selectedElement: CanvasElement | null;
  isLoading: boolean;
  error: string | null;
  history: MemeProject[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  
  // Project management
  createNewProject: () => void;
  saveProject: () => Promise<void>;
  loadProject: (projectIdOrObject: string | MemeProject) => void;
  deleteProject: (projectId: string) => void;
  
  // Template management
  loadTemplate: (template: MemeTemplate) => void;
  saveAsTemplate: (name: string) => Promise<void>;
  saveTemplate: (template: MemeTemplate) => Promise<void>;
  uploadTemplate: (file: File, name: string, width: number, height: number) => Promise<MemeTemplate>;
  deleteTemplate: (templateId: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;
  
  // Element management
  addTextElement: () => void;
  addImageElement: (src: string) => void;
  addShapeElement: (shape: string) => void;
  updateElement: (element: CanvasElement, addToHistoryFlag?: boolean) => void;
  deleteElement: (elementId: string) => void;
  selectElement: (element: CanvasElement) => void;
  duplicateElement: (elementId: string) => void;
  reorderElements: (elements: CanvasElement[]) => void;
  
  // Group management
  createGroup: (elementIds: string[], name?: string) => void;
  updateGroup: (groupId: string, updates: Partial<LayerGroup>) => void;
  deleteGroup: (groupId: string) => void;
  addToGroup: (groupId: string, elementIds: string[]) => void;
  removeFromGroup: (elementId: string) => void;
  reorderElementsInGroup: (groupId: string, elementIds: string[]) => void;
  
  // Canvas management
  setCanvasSize: (width: number, height: number) => void;
  setCanvasBackground: (color: string) => void;
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  
  // History management
  undo: () => void;
  redo: () => void;
  
  // Export
  exportProject: () => any;

  // Manual save management
  saveToMyMemes: (customName?: string) => void;
  updateCurrentMeme: () => void;
  isCurrentMemeInCollection: boolean;
  getCurrentMemeStatus: () => 'new' | 'saved' | 'modified';
}

export function useMemeCreator(): UseMemeCreatorReturn {
  const [currentProject, setCurrentProject] = useState<MemeProject | null>(null);
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<MemeProject[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [savedMemeId, setSavedMemeId] = useState<string | null>(null); // Track if current project is saved
  const [lastSavedState, setLastSavedState] = useState<string | null>(null); // Track changes

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Add to history
  const addToHistory = useCallback((project: MemeProject) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ ...project });
      return newHistory.slice(-50); // Keep only last 50 states
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Create new project
  const createNewProject = useCallback(() => {
    const newProject: MemeProject = {
      id: generateId(),
      name: `Untitled Project ${Date.now()}`,
      canvas: { ...DEFAULT_CANVAS_SETTINGS },
      elements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setCurrentProject(newProject);
    setSelectedElement(null);
    setHistory([newProject]);
    setHistoryIndex(0);
    
    // Reset saved state
    setSavedMemeId(null);
    setLastSavedState(null);
  }, []);

  // Auto-save current project to localStorage
  useEffect(() => {
    if (currentProject) {
      const saveTimer = setTimeout(() => {
        localStorage.setItem('currentProject', JSON.stringify(currentProject));
      }, 1000); // Auto-save after 1 second of inactivity

      return () => clearTimeout(saveTimer);
    }
  }, [currentProject]);

  // Load templates and restore project on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const loadedTemplates = await storageService.getTemplates();
        setTemplates(loadedTemplates);
        
        // Try to restore the last project from localStorage
        const savedProject = localStorage.getItem('currentProject');
        if (savedProject) {
          try {
            const parsedProject = JSON.parse(savedProject);
            setCurrentProject(parsedProject);
            setHistory([parsedProject]);
            setHistoryIndex(0);
          } catch (e) {
            console.error('Failed to restore project:', e);
            createNewProject();
          }
        } else {
          createNewProject();
        }
      } catch (err) {
        setError('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTemplates();
  }, [createNewProject]);

  // Save project
  const saveProject = useCallback(async () => {
    if (!currentProject) return;
    
    try {
      setIsLoading(true);
      const updatedProject = {
        ...currentProject,
        updatedAt: new Date(),
      };
      
      await storageService.saveProject(updatedProject);
      setCurrentProject(updatedProject);
      setError(null);
    } catch (err) {
      setError('Failed to save project');
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  // Load project
  const loadProject = useCallback((projectIdOrObject: string | MemeProject) => {
    try {
      let projectToLoad: MemeProject | null = null;
      
      if (typeof projectIdOrObject === 'string') {
        const projects = storageService.getProjects();
        projectToLoad = projects.find(p => p.id === projectIdOrObject) || null;
      } else {
        projectToLoad = projectIdOrObject;
      }
      
      if (projectToLoad) {
        setCurrentProject(projectToLoad);
        setSelectedElement(null);
        setHistory([projectToLoad]);
        setHistoryIndex(0);
        
        // Mark as saved since we loaded it from the collection
        setSavedMemeId(projectToLoad.id);
        setLastSavedState(JSON.stringify(projectToLoad));
      }
    } catch (err) {
      setError('Failed to load project');
    }
  }, []);

  // Delete project
  const deleteProject = useCallback((projectId: string) => {
    try {
      storageService.deleteProject(projectId);
      if (currentProject?.id === projectId) {
        createNewProject();
      }
    } catch (err) {
      setError('Failed to delete project');
    }
  }, [currentProject, createNewProject]);

  // Load template - adjusts canvas to template size
  const loadTemplate = useCallback((template: MemeTemplate) => {
    if (!currentProject) return;
    
    // Create background image element that matches template exactly
    const backgroundElement: CanvasElement = {
      id: generateId(),
      type: 'image',
      x: 0,
      y: 0,
      width: template.width,
      height: template.height,
      rotation: 0,
      opacity: 1,
      data: { 
        src: template.imageUrl,
        isBackground: true // Mark as background template
      },
    };

    // Create text elements from template
    const textElements = template.textBoxes.map(textBox => ({
      id: generateId(),
      type: 'text' as const,
      x: textBox.x,
      y: textBox.y,
      width: textBox.width,
      height: textBox.height,
      rotation: textBox.rotation || 0,
      opacity: textBox.opacity || 1,
      data: {
        text: textBox.text,
        fontSize: textBox.fontSize,
        fontFamily: textBox.fontFamily,
        color: textBox.color,
        backgroundColor: textBox.backgroundColor,
        textAlign: textBox.textAlign,
        fontWeight: textBox.fontWeight,
        fontStyle: textBox.fontStyle,
        borderColor: textBox.borderColor,
        borderWidth: textBox.borderWidth,
      },
    }));
    
    const updatedProject: MemeProject = {
      ...currentProject,
      template,
      canvas: {
        width: template.width,
        height: template.height,
        backgroundColor: '#ffffff',
      },
      elements: [backgroundElement, ...textElements],
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
    setSelectedElement(null);
  }, [currentProject, addToHistory]);

  // Save as template
  const saveAsTemplate = useCallback(async (name: string) => {
    if (!currentProject) return;
    
    try {
      const template: MemeTemplate = {
        id: generateId(),
        name,
        imageUrl: '', // Would need to generate from canvas
        width: currentProject.canvas.width,
        height: currentProject.canvas.height,
        textBoxes: currentProject.elements
          .filter(el => el.type === 'text')
          .map(el => ({
            id: generateId(),
            text: el.data.text || '',
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            fontSize: el.data.fontSize || DEFAULT_TEXT_STYLE.fontSize,
            fontFamily: el.data.fontFamily || DEFAULT_TEXT_STYLE.fontFamily,
            color: el.data.color || DEFAULT_TEXT_STYLE.color,
            backgroundColor: el.data.backgroundColor || DEFAULT_TEXT_STYLE.backgroundColor,
            borderColor: el.data.borderColor || DEFAULT_TEXT_STYLE.borderColor,
            borderWidth: el.data.borderWidth || DEFAULT_TEXT_STYLE.borderWidth,
            textAlign: el.data.textAlign || DEFAULT_TEXT_STYLE.textAlign,
            fontWeight: el.data.fontWeight || DEFAULT_TEXT_STYLE.fontWeight,
            fontStyle: el.data.fontStyle || DEFAULT_TEXT_STYLE.fontStyle,
            rotation: el.rotation,
            opacity: el.opacity,
          })),
        createdAt: new Date(),
      };
      
      await storageService.saveTemplate(template);
      setTemplates(prev => [...prev, template]);
    } catch (err) {
      setError('Failed to save template');
    }
  }, [currentProject]);

  // Save template directly
  const saveTemplate = useCallback(async (template: MemeTemplate) => {
    try {
      await storageService.saveTemplate(template);
      setTemplates(prev => [...prev, template]);
    } catch (error) {
      console.error('Failed to save template:', error);
      setError('Failed to save template');
    }
  }, []);

  // Upload template
  const uploadTemplate = useCallback(async (file: File, name: string, width: number, height: number): Promise<MemeTemplate> => {
    try {
      const template = await storageService.uploadTemplate(file, name, width, height);
      setTemplates(prev => [...prev, template]);
      return template;
    } catch (error) {
      console.error('Failed to upload template:', error);
      setError('Failed to upload template');
      throw error;
    }
  }, []);

  // Delete template
  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      await storageService.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (err) {
      setError('Failed to delete template');
    }
  }, []);

  // Refresh templates
  const refreshTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedTemplates = await storageService.getTemplates();
      setTemplates(loadedTemplates);
    } catch (err) {
      setError('Failed to refresh templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add text element
  const addTextElement = useCallback(() => {
    if (!currentProject) return;
    
    const newElement: CanvasElement = {
      id: generateId(),
      type: 'text',
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 1,
      data: {
        text: 'Your text here',
        ...DEFAULT_TEXT_STYLE,
      },
    };
    
    const updatedProject = {
      ...currentProject,
      elements: [...currentProject.elements, newElement],
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
    setSelectedElement(newElement);
  }, [currentProject, addToHistory]);

  // Add image element with original dimensions
  const addImageElement = useCallback((src: string) => {
    if (!currentProject) return;
    
    // Create a temporary image to get original dimensions
    const img = new Image();
    img.onload = () => {
      // Calculate the next image layer number
      const imageElements = currentProject.elements.filter(el => el.type === 'image');
      const nextImageNumber = imageElements.length + 1;
      
      const newElement: CanvasElement = {
        id: generateId(),
        type: 'image',
        x: 50,
        y: 50,
        width: img.naturalWidth,
        height: img.naturalHeight,
        rotation: 0,
        opacity: 1,
        data: { 
          src,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          resizable: true,
          name: `Image Layer ${nextImageNumber}`
        },
      };
      
      const updatedProject = {
        ...currentProject,
        elements: [...currentProject.elements, newElement],
        updatedAt: new Date(),
      };
      
      setCurrentProject(updatedProject);
      addToHistory(updatedProject);
      setSelectedElement(newElement);
    };
    
    img.onerror = () => {
      // Fallback to default size if image fails to load
      const newElement: CanvasElement = {
        id: generateId(),
        type: 'image',
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 1,
        data: { 
          src,
          resizable: true
        },
      };
      
      const updatedProject = {
        ...currentProject,
        elements: [...currentProject.elements, newElement],
        updatedAt: new Date(),
      };
      
      setCurrentProject(updatedProject);
      addToHistory(updatedProject);
      setSelectedElement(newElement);
    };
    
    img.src = src;
  }, [currentProject, addToHistory]);

  // Add shape element
  const addShapeElement = useCallback((shape: string) => {
    if (!currentProject) return;
    
    const newElement: CanvasElement = {
      id: generateId(),
      type: 'shape',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      data: {
        shape,
        backgroundColor: '#1976d2',
        borderColor: '#000000',
        borderWidth: 0,
        borderRadius: shape === 'circle' ? '50%' : '0px',
      },
    };
    
    const updatedProject = {
      ...currentProject,
      elements: [...currentProject.elements, newElement],
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
    setSelectedElement(newElement);
  }, [currentProject, addToHistory]);

  // Update element
  const updateElement = useCallback((updatedElement: CanvasElement, addToHistoryFlag?: boolean) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      elements: currentProject.elements.map(el =>
        el.id === updatedElement.id ? updatedElement : el
      ),
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    if (selectedElement?.id === updatedElement.id) {
      setSelectedElement(updatedElement);
    }
    
    // Add to history if flag is true
    if (addToHistoryFlag) {
      addToHistory(updatedProject);
    }
  }, [currentProject, selectedElement, addToHistory]);

  // Delete element
  const deleteElement = useCallback((elementId: string) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      elements: currentProject.elements.filter(el => el.id !== elementId),
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
    
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  }, [currentProject, selectedElement, addToHistory]);

  // Select element
  const selectElement = useCallback((element: CanvasElement) => {
    setSelectedElement(element);
  }, []);

  // Duplicate element
  const duplicateElement = useCallback((elementId: string) => {
    if (!currentProject) return;
    
    const originalElement = currentProject.elements.find(el => el.id === elementId);
    if (!originalElement) return;
    
    const duplicatedElement: CanvasElement = {
      ...originalElement,
      id: generateId(),
      x: originalElement.x + 20,
      y: originalElement.y + 20,
    };
    
    const updatedProject = {
      ...currentProject,
      elements: [...currentProject.elements, duplicatedElement],
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
    setSelectedElement(duplicatedElement);
  }, [currentProject, addToHistory]);

  // Reorder elements
  const reorderElements = useCallback((elements: CanvasElement[]) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      elements: elements,
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
  }, [currentProject, addToHistory]);

  // Group management
  const createGroup = useCallback((elementIds: string[], name?: string) => {
    if (!currentProject) return;
    
    const newGroup: LayerGroup = {
      id: generateId(),
      name: name || 'New Group',
      expanded: true,
      elements: elementIds,
    };
    
    const updatedProject = {
      ...currentProject,
      groups: [...(currentProject.groups || []), newGroup],
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
  }, [currentProject, addToHistory]);

  const updateGroup = useCallback((groupId: string, updates: Partial<LayerGroup>) => {
    if (!currentProject || !currentProject.groups) return;
    
    const updatedProject = {
      ...currentProject,
      groups: currentProject.groups.map(group => 
        group.id === groupId ? { ...group, ...updates } : group
      ),
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
  }, [currentProject, addToHistory]);

  const deleteGroup = useCallback((groupId: string) => {
    if (!currentProject || !currentProject.groups) return;
    
    const updatedProject = {
      ...currentProject,
      groups: currentProject.groups.filter(group => group.id !== groupId),
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
  }, [currentProject, addToHistory]);

  const addToGroup = useCallback((groupId: string, elementIds: string[]) => {
    if (!currentProject || !currentProject.groups) return;
    
    const updatedProject = {
      ...currentProject,
      groups: currentProject.groups.map(group => 
        group.id === groupId 
          ? { ...group, elements: [...group.elements, ...elementIds] }
          : group
      ),
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
  }, [currentProject, addToHistory]);

  const removeFromGroup = useCallback((elementId: string) => {
    if (!currentProject || !currentProject.groups) return;
    
    const updatedProject = {
      ...currentProject,
      groups: currentProject.groups.map(group => ({
        ...group,
        elements: group.elements.filter(id => id !== elementId)
      })),
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
  }, [currentProject, addToHistory]);

  const reorderElementsInGroup = useCallback((groupId: string, elementIds: string[]) => {
    if (!currentProject || !currentProject.groups) return;
    
    const updatedProject = {
      ...currentProject,
      groups: currentProject.groups.map(group => 
        group.id === groupId 
          ? { ...group, elements: elementIds }
          : group
      ),
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
  }, [currentProject, addToHistory]);

  // Set canvas size
  const setCanvasSize = useCallback((width: number, height: number) => {
    if (!currentProject) return;
    
    // Ensure valid dimensions
    const validWidth = Math.max(100, Math.min(5000, width));
    const validHeight = Math.max(100, Math.min(5000, height));
    
    const updatedProject = {
      ...currentProject,
      canvas: {
        ...currentProject.canvas,
        width: validWidth,
        height: validHeight,
      },
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
  }, [currentProject, addToHistory]);

  // Set canvas background
  const setCanvasBackground = useCallback((color: string) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      canvas: {
        ...currentProject.canvas,
        backgroundColor: color,
      },
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
  }, [currentProject, addToHistory]);

  // Update canvas settings (combined function)
  const updateCanvasSettings = useCallback((settings: Partial<CanvasSettings>) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      canvas: {
        ...currentProject.canvas,
        ...settings,
      },
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    addToHistory(updatedProject);
  }, [currentProject, addToHistory]);

  // Undo
  const undo = useCallback(() => {
    if (!canUndo) return;
    
    const newIndex = historyIndex - 1;
    const previousProject = history[newIndex];
    
    setCurrentProject(previousProject);
    setHistoryIndex(newIndex);
    setSelectedElement(null);
  }, [canUndo, historyIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (!canRedo) return;
    
    const newIndex = historyIndex + 1;
    const nextProject = history[newIndex];
    
    setCurrentProject(nextProject);
    setHistoryIndex(newIndex);
    setSelectedElement(null);
  }, [canRedo, historyIndex, history]);

  // Export project
  const exportProject = useCallback(() => {
    return currentProject;
  }, [currentProject]);

  // Manual save management functions
  const saveToMyMemes = useCallback((customName?: string) => {
    if (!currentProject) return;
    
    const nameToUse = customName || currentProject.name;
    const projectToSave = {
      ...currentProject,
      name: nameToUse,
      updatedAt: new Date(),
    };
    
    // Save to storage
    storageService.saveProject(projectToSave);
    
    // Mark as saved
    setSavedMemeId(projectToSave.id);
    setLastSavedState(JSON.stringify(projectToSave));
    
    // Update current project name if changed
    if (customName && customName !== currentProject.name) {
      setCurrentProject(projectToSave);
    }
  }, [currentProject]);
  
  const updateCurrentMeme = useCallback(() => {
    if (!currentProject || !savedMemeId) return;
    
    const updatedProject = {
      ...currentProject,
      updatedAt: new Date(),
    };
    
    // Update in storage
    storageService.saveProject(updatedProject);
    
    // Update saved state
    setLastSavedState(JSON.stringify(updatedProject));
  }, [currentProject, savedMemeId]);
  
  const isCurrentMemeInCollection = Boolean(savedMemeId && currentProject?.id === savedMemeId);
  
  const getCurrentMemeStatus = useCallback((): 'new' | 'saved' | 'modified' => {
    if (!currentProject) return 'new';
    
    const currentState = JSON.stringify(currentProject);
    
    if (!savedMemeId) return 'new';
    if (currentState === lastSavedState) return 'saved';
    return 'modified';
  }, [currentProject, savedMemeId, lastSavedState]);

  return {
    currentProject,
    templates,
    selectedElement,
    isLoading,
    error,
    history,
    historyIndex,
    canUndo,
    canRedo,
    
    createNewProject,
    saveProject,
    loadProject,
    deleteProject,
    
    loadTemplate,
    saveAsTemplate,
    saveTemplate,
    uploadTemplate,
    deleteTemplate,
    refreshTemplates,
    
    addTextElement,
    addImageElement,
    addShapeElement,
    updateElement,
    deleteElement,
    selectElement,
    duplicateElement,
    reorderElements,
    
    createGroup,
    updateGroup,
    deleteGroup,
    addToGroup,
    removeFromGroup,
    reorderElementsInGroup,
    
    setCanvasSize,
    setCanvasBackground,
    updateCanvasSettings,
    
    undo,
    redo,
    
    exportProject,

    // Manual save management
    saveToMyMemes,
    updateCurrentMeme,
    isCurrentMemeInCollection,
    getCurrentMemeStatus,
  };
}
