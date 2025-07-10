'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Alert,
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Palette as PaletteIcon,
  Layers as LayersIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Crop as CropIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Menu as MenuIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as ExitFullscreenIcon,
} from '@mui/icons-material';
import { Canvas } from './Canvas';
import { TemplateManager } from './TemplateManager';
import { ToolsPanel } from './ToolsPanel';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { CropDialog } from './CropDialog';
import { ExportDialog } from './ExportDialog';
import { ProjectManager } from './ProjectManager';
import { useMemeCreator } from '../hooks/useMemeCreator';
import { exportToImage } from '../lib/utils';
import { CROP_RATIOS } from '../lib/constants';
import { CanvasSettings, CanvasElement, MemeProject, MemeTemplate } from '../types';

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: any;
}

interface ExportOptions {
  format: 'png' | 'jpg' | 'webp' | 'svg';
  quality: number;
  width: number;
  height: number;
  scale: number;
}

const DRAWER_WIDTH = 300;

export function MemeCreator() {
  const {
    currentProject,
    templates,
    selectedElement,
    isLoading,
    error,
    createNewProject,
    saveProject,
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
    setCanvasSize,
    setCanvasBackground,
    updateCanvasSettings,
    exportProject,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useMemeCreator();

  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState('tools');
  const [activeRightTab, setActiveRightTab] = useState('properties');
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [projectManagerOpen, setProjectManagerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [zoom, setZoom] = useState(1);
  const [newMemeConfirmOpen, setNewMemeConfirmOpen] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleNewMeme = () => {
    // Check if there's work to save
    if (currentProject && currentProject.elements.length > 0) {
      setNewMemeConfirmOpen(true);
    } else {
      createNewProject();
      showSnackbar('New meme project created!', 'success');
    }
  };

  const confirmNewMeme = () => {
    createNewProject();
    setNewMemeConfirmOpen(false);
    showSnackbar('New meme project created!', 'success');
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    
    try {
      await exportToImage(canvasRef.current, currentProject?.name || 'meme');
      showSnackbar('Meme exported successfully!', 'success');
    } catch (error) {
      showSnackbar('Error exporting meme', 'error');
    }
  };

  const handleSave = async () => {
    try {
      await saveProject();
      showSnackbar('Project saved successfully!', 'success');
    } catch (error) {
      showSnackbar('Error saving project', 'error');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        addImageElement(result);
        showSnackbar('Image added to canvas', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateSelect = (template: any) => {
    loadTemplate(template);
    showSnackbar(`Template "${template.name}" loaded`, 'success');
  };

  const handleTemplateSave = async (template: MemeTemplate) => {
    try {
      // Save the template using the storage service directly
      const { storageService } = await import('../lib/storage');
      await storageService.saveTemplate(template);
      showSnackbar(`Template "${template.name}" saved successfully!`, 'success');
    } catch (error) {
      showSnackbar('Error saving template', 'error');
    }
  };

  const handleTemplateDelete = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      showSnackbar('Template deleted successfully!', 'success');
    } catch (error) {
      showSnackbar('Error deleting template', 'error');
    }
  };

  const handleCanvasSizeChange = (width: number, height: number) => {
    setCanvasSize(width, height);
    showSnackbar('Canvas size updated', 'success');
  };

  const handleCanvasSettingsChange = (settings: CanvasSettings) => {
    // Use the combined update function to avoid race conditions
    updateCanvasSettings(settings);
    showSnackbar('Canvas settings updated', 'success');
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const speedDialActions = [
    { icon: <AddIcon />, name: 'New Meme', action: handleNewMeme },
    { icon: <SaveIcon />, name: 'Save', action: handleSave },
    { icon: <DownloadIcon />, name: 'Export', action: () => setExportDialogOpen(true) },
    { icon: <UploadIcon />, name: 'Upload Image', action: () => fileInputRef.current?.click() },
    { icon: <TextIcon />, name: 'Add Text', action: addTextElement },
    { icon: <CropIcon />, name: 'Crop', action: () => setCropDialogOpen(true) },
  ];

  const leftPanelTabs = [
    { id: 'tools', label: 'Tools', icon: <PaletteIcon /> },
    { id: 'layers', label: 'Layers', icon: <LayersIcon /> },
  ];

  const rightPanelTabs = [
    { id: 'properties', label: 'Properties', icon: <SettingsIcon /> },
    { id: 'projects', label: 'Projects', icon: <EditIcon /> },
  ];

  // Refresh templates when template manager opens
  useEffect(() => {
    if (templateManagerOpen) {
      refreshTemplates();
    }
  }, [templateManagerOpen, refreshTemplates]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setLeftDrawerOpen(!leftDrawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Meme Creator Pro
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleNewMeme}
              sx={{ 
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              New Meme
            </Button>
            <Button
              color="inherit"
              startIcon={<ImageIcon />}
              onClick={() => setTemplateManagerOpen(true)}
              sx={{ 
                '& .MuiButton-startIcon': {
                  marginRight: 1
                }
              }}
            >
              Templates
            </Button>
            <Button
              color="inherit"
              startIcon={<UndoIcon />}
              onClick={undo}
              disabled={!canUndo}
            >
              Undo
            </Button>
            <Button
              color="inherit"
              startIcon={<RedoIcon />}
              onClick={redo}
              disabled={!canRedo}
            >
              Redo
            </Button>
            <Button
              color="inherit"
              startIcon={<ZoomOutIcon />}
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
            >
              {Math.round(zoom * 100)}%
            </Button>
            <Button
              color="inherit"
              startIcon={<ZoomInIcon />}
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            >
              Zoom
            </Button>
            <Button
              color="inherit"
              startIcon={isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
          </Stack>

          <IconButton
            color="inherit"
            onClick={() => setRightDrawerOpen(!rightDrawerOpen)}
            sx={{ ml: 1 }}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Left Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={leftDrawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            mt: 8,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {leftPanelTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeLeftTab === tab.id ? 'contained' : 'outlined'}
                size="small"
                startIcon={tab.icon}
                onClick={() => setActiveLeftTab(tab.id)}
                sx={{ 
                  flex: 1, 
                  minWidth: 0,
                  '& .MuiButton-startIcon': {
                    marginRight: 0.5
                  }
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Stack>
          
          <Divider sx={{ mb: 2 }} />
          
          {activeLeftTab === 'tools' && (
            <ToolsPanel
              selectedElement={selectedElement || undefined}
              onUpdateElement={updateElement}
              onAddText={addTextElement}
              onAddImage={() => fileInputRef.current?.click()}
              onAddShape={addShapeElement}
              onDeleteElement={() => selectedElement && deleteElement(selectedElement.id)}
              onDuplicateElement={() => selectedElement && duplicateElement(selectedElement.id)}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          )}
          
          {activeLeftTab === 'layers' && (
            <LayersPanel
              elements={currentProject?.elements || []}
              selectedElement={selectedElement || undefined}
              onSelectElement={selectElement}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
              onDuplicateElement={duplicateElement}
              onReorderElements={(elements: CanvasElement[]) => {
                // TODO: Implement layer reordering
                console.log('Reorder elements:', elements);
              }}
            />
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: leftDrawerOpen ? 0 : `-${DRAWER_WIDTH}px`,
          mr: rightDrawerOpen ? 0 : `-${DRAWER_WIDTH}px`,
          transition: 'margin 0.2s',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(45deg, #1a1a1a, #2d2d2d)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box ref={canvasRef} sx={{ transform: `scale(${zoom})` }}>
            <Canvas
              project={currentProject || undefined}
              selectedElement={selectedElement || undefined}
              onSelectElement={selectElement}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
            />
          </Box>
        </Paper>
      </Box>

      {/* Right Drawer */}
      <Drawer
        variant="persistent"
        anchor="right"
        open={rightDrawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            mt: 8,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {rightPanelTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeRightTab === tab.id ? 'contained' : 'outlined'}
                size="small"
                startIcon={tab.icon}
                onClick={() => setActiveRightTab(tab.id)}
                sx={{ flex: 1 }}
              >
                {tab.label}
              </Button>
            ))}
          </Stack>
          
          <Divider sx={{ mb: 2 }} />
          
          {activeRightTab === 'properties' && (
            <PropertiesPanel
              selectedElement={selectedElement || undefined}
              canvasSettings={currentProject?.canvas || { width: 800, height: 600, backgroundColor: '#ffffff' }}
              onUpdateElement={updateElement}
              onUpdateCanvasSettings={handleCanvasSettingsChange}
            />
          )}
          
          {activeRightTab === 'projects' && (
            <ProjectManager
              open={true}
              onClose={() => setActiveRightTab('properties')}
              onLoadProject={(project: MemeProject) => {
                // TODO: Implement project loading
                console.log('Load project:', project);
              }}
              onNewProject={createNewProject}
              currentProject={currentProject || undefined}
            />
          )}
        </Box>
      </Drawer>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>

      {/* Dialogs */}
      <CropDialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        onCrop={(cropData: CropData) => {
          if (cropData.aspectRatio) {
            const { width, height } = cropData.aspectRatio;
            setCanvasSize(width, height);
            showSnackbar('Canvas size updated to ' + width + 'x' + height, 'success');
          }
          setCropDialogOpen(false);
        }}
        currentWidth={currentProject?.canvas?.width || 800}
        currentHeight={currentProject?.canvas?.height || 600}
      />
      
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={async (exportOptions: ExportOptions) => {
          // TODO: Implement export with options
          console.log('Export options:', exportOptions);
          await handleExport();
        }}
        canvasWidth={currentProject?.canvas?.width || 800}
        canvasHeight={currentProject?.canvas?.height || 600}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Template Manager */}
      <TemplateManager
        open={templateManagerOpen}
        onClose={() => setTemplateManagerOpen(false)}
        templates={templates}
        onSelectTemplate={handleTemplateSelect}
        onUploadTemplate={uploadTemplate}
        onDeleteTemplate={deleteTemplate}
        isLoading={isLoading}
      />

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ position: 'fixed', top: 100, right: 16, zIndex: 9999 }}>
          {error}
        </Alert>
      )}

      {/* New Meme Confirmation Dialog */}
      <Dialog
        open={newMemeConfirmOpen}
        onClose={() => setNewMemeConfirmOpen(false)}
        aria-labelledby="new-meme-dialog-title"
        aria-describedby="new-meme-dialog-description"
      >
        <DialogTitle id="new-meme-dialog-title">
          Create New Meme?
        </DialogTitle>
        <DialogContent>
          <Typography id="new-meme-dialog-description">
            You have unsaved changes. Creating a new meme will clear your current work. 
            Do you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewMemeConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmNewMeme} color="primary" variant="contained">
            Create New Meme
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
