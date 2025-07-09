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
import { TemplateLibrary } from './TemplateLibrary';
import { ToolsPanel } from './ToolsPanel';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { CropDialog } from './CropDialog';
import { ExportDialog } from './ExportDialog';
import { ProjectManager } from './ProjectManager';
import { useMemeCreator } from '../hooks/useMemeCreator';
import { exportToImage } from '../lib/utils';
import { CROP_RATIOS } from '../lib/constants';
import { CanvasSettings } from '../types';

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
    addTextElement,
    addImageElement,
    updateElement,
    deleteElement,
    selectElement,
    duplicateElement,
    setCanvasSize,
    setCanvasBackground,
    exportProject,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useMemeCreator();

  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState('templates');
  const [activeRightTab, setActiveRightTab] = useState('properties');
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [projectManagerOpen, setProjectManagerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [zoom, setZoom] = useState(1);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
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

  const handleCanvasSizeChange = (width: number, height: number) => {
    setCanvasSize(width, height);
    showSnackbar('Canvas size updated', 'success');
  };

  const handleCanvasSettingsChange = (settings: CanvasSettings) => {
    setCanvasSize(settings.width, settings.height);
    setCanvasBackground(settings.backgroundColor);
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
    { icon: <AddIcon />, name: 'New Project', action: createNewProject },
    { icon: <SaveIcon />, name: 'Save', action: handleSave },
    { icon: <DownloadIcon />, name: 'Export', action: () => setExportDialogOpen(true) },
    { icon: <UploadIcon />, name: 'Upload Image', action: () => fileInputRef.current?.click() },
    { icon: <TextIcon />, name: 'Add Text', action: addTextElement },
    { icon: <CropIcon />, name: 'Crop', action: () => setCropDialogOpen(true) },
  ];

  const leftPanelTabs = [
    { id: 'templates', label: 'Templates', icon: <ImageIcon /> },
    { id: 'tools', label: 'Tools', icon: <PaletteIcon /> },
    { id: 'layers', label: 'Layers', icon: <LayersIcon /> },
  ];

  const rightPanelTabs = [
    { id: 'properties', label: 'Properties', icon: <SettingsIcon /> },
    { id: 'projects', label: 'Projects', icon: <EditIcon /> },
  ];

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
                sx={{ flex: 1 }}
              >
                {tab.label}
              </Button>
            ))}
          </Stack>
          
          <Divider sx={{ mb: 2 }} />
          
          {activeLeftTab === 'templates' && (
            <TemplateLibrary
              templates={templates}
              onSelectTemplate={handleTemplateSelect}
            />
          )}
          
          {activeLeftTab === 'tools' && (
            <ToolsPanel
              onAddText={addTextElement}
              onAddImage={() => fileInputRef.current?.click()}
              onCrop={() => setCropDialogOpen(true)}
              zoom={zoom}
              onZoomChange={setZoom}
            />
          )}
          
          {activeLeftTab === 'layers' && (
            <LayersPanel
              elements={currentProject?.elements || []}
              selectedElement={selectedElement}
              onSelectElement={selectElement}
              onDeleteElement={deleteElement}
              onDuplicateElement={duplicateElement}
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
              project={currentProject}
              selectedElement={selectedElement}
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
              selectedElement={selectedElement}
              canvasSettings={currentProject?.canvas || { width: 800, height: 600, backgroundColor: '#ffffff' }}
              onUpdateElement={updateElement}
              onUpdateCanvasSettings={handleCanvasSettingsChange}
            />
          )}
          
          {activeRightTab === 'projects' && (
            <ProjectManager
              currentProject={currentProject}
              onSave={handleSave}
              onNew={createNewProject}
              onExport={() => setExportDialogOpen(true)}
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
        canvasSettings={currentProject?.canvas}
        onApply={handleCanvasSizeChange}
      />
      
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
        project={currentProject}
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

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ position: 'fixed', top: 100, right: 16, zIndex: 9999 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
