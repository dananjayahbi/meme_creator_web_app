'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
  Chip,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Palette as PaletteIcon,
  FormatSize as SizeIcon,
  Rotate90DegreesCcw as RotateLeftIcon,
  Rotate90DegreesCw as RotateRightIcon,
  Opacity as OpacityIcon,
  AspectRatio as AspectRatioIcon,
  CenterFocusStrong as CenterIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import { CanvasElement, CanvasSettings } from '../types';
import { CROP_RATIOS } from '../lib/constants';

interface PropertiesPanelProps {
  selectedElement?: CanvasElement;
  canvasSettings: CanvasSettings;
  onUpdateElement: (element: CanvasElement) => void;
  onUpdateCanvasSettings: (settings: CanvasSettings) => void;
}

export function PropertiesPanel({
  selectedElement,
  canvasSettings,
  onUpdateElement,
  onUpdateCanvasSettings,
}: PropertiesPanelProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showCanvasBgColorPicker, setShowCanvasBgColorPicker] = useState(false);
  const [colorPickerType, setColorPickerType] = useState<'text' | 'background' | 'canvas'>('text');

  const handleElementUpdate = (property: string, value: any) => {
    if (!selectedElement) return;

    const updatedElement = {
      ...selectedElement,
      [property]: value,
    };
    onUpdateElement(updatedElement);
  };

  const handleElementDataUpdate = (property: string, value: any) => {
    if (!selectedElement) return;

    const updatedElement = {
      ...selectedElement,
      data: {
        ...selectedElement.data,
        [property]: value,
      },
    };
    onUpdateElement(updatedElement);
  };

  const handleCanvasUpdate = (property: string, value: any) => {
    const updatedSettings = {
      ...canvasSettings,
      [property]: value,
    };
    onUpdateCanvasSettings(updatedSettings);
  };

  const handleColorChange = (color: string) => {
    if (colorPickerType === 'text' && selectedElement) {
      handleElementDataUpdate('color', color);
    } else if (colorPickerType === 'background' && selectedElement) {
      handleElementDataUpdate('backgroundColor', color);
    } else if (colorPickerType === 'canvas') {
      handleCanvasUpdate('backgroundColor', color);
    }
  };

  const openColorPicker = (type: 'text' | 'background' | 'canvas') => {
    setColorPickerType(type);
    setShowColorPicker(true);
    setShowBgColorPicker(false);
    setShowCanvasBgColorPicker(false);
  };

  const getCurrentColor = () => {
    if (colorPickerType === 'text' && selectedElement) {
      return selectedElement.data?.color || '#000000';
    } else if (colorPickerType === 'background' && selectedElement) {
      return selectedElement.data?.backgroundColor || '#ffffff';
    } else if (colorPickerType === 'canvas') {
      return canvasSettings.backgroundColor || '#ffffff';
    }
    return '#000000';
  };

  const applyAspectRatio = (ratio: number, width: number, height: number) => {
    if (ratio === 0) return; // Custom ratio
    
    const newHeight = width / ratio;
    handleCanvasUpdate('width', width);
    handleCanvasUpdate('height', newHeight);
  };

  const centerElement = () => {
    if (!selectedElement) return;
    
    const centerX = (canvasSettings.width - selectedElement.width) / 2;
    const centerY = (canvasSettings.height - selectedElement.height) / 2;
    
    handleElementUpdate('x', centerX);
    handleElementUpdate('y', centerY);
  };

  const isTextElement = selectedElement?.type === 'text';
  const isImageElement = selectedElement?.type === 'image';
  const isShapeElement = selectedElement?.type === 'shape';

  return (
    <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Properties
      </Typography>

      {/* Canvas Properties */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Canvas Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Width"
                type="number"
                value={canvasSettings.width}
                onChange={(e) => handleCanvasUpdate('width', parseInt(e.target.value))}
                size="small"
                fullWidth
              />
              <TextField
                label="Height"
                type="number"
                value={canvasSettings.height}
                onChange={(e) => handleCanvasUpdate('height', parseInt(e.target.value))}
                size="small"
                fullWidth
              />
            </Stack>

            <FormControl size="small" fullWidth>
              <InputLabel>Aspect Ratio</InputLabel>
              <Select
                value=""
                label="Aspect Ratio"
                onChange={(e) => {
                  const ratio = CROP_RATIOS.find(r => r.name === e.target.value);
                  if (ratio) {
                    applyAspectRatio(ratio.ratio, ratio.width, ratio.height);
                  }
                }}
              >
                {CROP_RATIOS.map((ratio) => (
                  <MenuItem key={ratio.name} value={ratio.name}>
                    {ratio.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => openColorPicker('canvas')}
                startIcon={<PaletteIcon />}
                sx={{ mb: 1 }}
              >
                Canvas Background
              </Button>
              {showColorPicker && colorPickerType === 'canvas' && (
                <HexColorPicker
                  color={getCurrentColor()}
                  onChange={handleColorChange}
                />
              )}
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip
                label={`${canvasSettings.width} × ${canvasSettings.height}`}
                size="small"
                icon={<AspectRatioIcon />}
              />
              <Chip
                label={`${(canvasSettings.width / canvasSettings.height).toFixed(2)}:1`}
                size="small"
                variant="outlined"
              />
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Element Properties */}
      {selectedElement && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Element Properties</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {selectedElement?.type ? 
                  selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1) : 
                  'Element'} Element
              </Typography>

              {/* Position */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="X Position"
                  type="number"
                  value={Math.round(selectedElement.x)}
                  onChange={(e) => handleElementUpdate('x', parseInt(e.target.value))}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Y Position"
                  type="number"
                  value={Math.round(selectedElement.y)}
                  onChange={(e) => handleElementUpdate('y', parseInt(e.target.value))}
                  size="small"
                  fullWidth
                />
              </Stack>

              {/* Size */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Width"
                  type="number"
                  value={Math.round(selectedElement.width)}
                  onChange={(e) => handleElementUpdate('width', parseInt(e.target.value))}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Height"
                  type="number"
                  value={Math.round(selectedElement.height)}
                  onChange={(e) => handleElementUpdate('height', parseInt(e.target.value))}
                  size="small"
                  fullWidth
                />
              </Stack>

              {/* Quick Actions */}
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={centerElement}
                  startIcon={<CenterIcon />}
                >
                  Center
                </Button>
                <Tooltip title="Rotate -90°">
                  <IconButton
                    size="small"
                    onClick={() => handleElementUpdate('rotation', (selectedElement.rotation || 0) - 90)}
                  >
                    <RotateLeftIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rotate +90°">
                  <IconButton
                    size="small"
                    onClick={() => handleElementUpdate('rotation', (selectedElement.rotation || 0) + 90)}
                  >
                    <RotateRightIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Rotation */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Rotation: {selectedElement.rotation || 0}°
                </Typography>
                <Slider
                  value={selectedElement.rotation || 0}
                  onChange={(e, value) => handleElementUpdate('rotation', value)}
                  min={-180}
                  max={180}
                  valueLabelDisplay="auto"
                  size="small"
                />
              </Box>

              {/* Opacity */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Opacity: {Math.round((selectedElement.opacity || 1) * 100)}%
                </Typography>
                <Slider
                  value={(selectedElement.opacity || 1) * 100}
                  onChange={(e, value) => handleElementUpdate('opacity', (value as number) / 100)}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                  size="small"
                />
              </Box>

              {/* Element-specific properties */}
              {isTextElement && (
                <>
                  <Divider />
                  <Typography variant="body2" fontWeight="bold">
                    Text Properties
                  </Typography>
                  
                  <TextField
                    label="Text Content"
                    value={selectedElement.data?.text || ''}
                    onChange={(e) => handleElementDataUpdate('text', e.target.value)}
                    multiline
                    rows={2}
                    size="small"
                    fullWidth
                  />

                  <TextField
                    label="Font Size"
                    type="number"
                    value={selectedElement.data?.fontSize || 16}
                    onChange={(e) => handleElementDataUpdate('fontSize', parseInt(e.target.value))}
                    size="small"
                    fullWidth
                  />

                  <FormControl size="small" fullWidth>
                    <InputLabel>Font Family</InputLabel>
                    <Select
                      value={selectedElement.data?.fontFamily || 'Arial'}
                      label="Font Family"
                      onChange={(e) => handleElementDataUpdate('fontFamily', e.target.value)}
                    >
                      <MenuItem value="Arial">Arial</MenuItem>
                      <MenuItem value="Impact">Impact</MenuItem>
                      <MenuItem value="Helvetica">Helvetica</MenuItem>
                      <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                      <MenuItem value="Georgia">Georgia</MenuItem>
                      <MenuItem value="Verdana">Verdana</MenuItem>
                      <MenuItem value="Comic Sans MS">Comic Sans MS</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>Text Align</InputLabel>
                    <Select
                      value={selectedElement.data?.textAlign || 'center'}
                      label="Text Align"
                      onChange={(e) => handleElementDataUpdate('textAlign', e.target.value)}
                    >
                      <MenuItem value="left">Left</MenuItem>
                      <MenuItem value="center">Center</MenuItem>
                      <MenuItem value="right">Right</MenuItem>
                    </Select>
                  </FormControl>

                  <Stack direction="row" spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedElement.data?.fontWeight === 'bold'}
                          onChange={(e) => handleElementDataUpdate('fontWeight', e.target.checked ? 'bold' : 'normal')}
                        />
                      }
                      label="Bold"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedElement.data?.fontStyle === 'italic'}
                          onChange={(e) => handleElementDataUpdate('fontStyle', e.target.checked ? 'italic' : 'normal')}
                        />
                      }
                      label="Italic"
                    />
                  </Stack>

                  <Stack spacing={1}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => openColorPicker('text')}
                      startIcon={<PaletteIcon />}
                    >
                      Text Color
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => openColorPicker('background')}
                      startIcon={<PaletteIcon />}
                    >
                      Background Color
                    </Button>
                  </Stack>

                  {showColorPicker && (colorPickerType === 'text' || colorPickerType === 'background') && (
                    <HexColorPicker
                      color={getCurrentColor()}
                      onChange={handleColorChange}
                    />
                  )}
                </>
              )}

              {isImageElement && (
                <>
                  <Divider />
                  <Typography variant="body2" fontWeight="bold">
                    Image Properties
                  </Typography>
                  
                  <TextField
                    label="Alt Text"
                    value={selectedElement.data?.alt || ''}
                    onChange={(e) => handleElementDataUpdate('alt', e.target.value)}
                    size="small"
                    fullWidth
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedElement.data?.maintainAspectRatio !== false}
                        onChange={(e) => handleElementDataUpdate('maintainAspectRatio', e.target.checked)}
                      />
                    }
                    label="Maintain Aspect Ratio"
                  />
                </>
              )}

              {isShapeElement && (
                <>
                  <Divider />
                  <Typography variant="body2" fontWeight="bold">
                    Shape Properties
                  </Typography>
                  
                  <FormControl size="small" fullWidth>
                    <InputLabel>Shape Type</InputLabel>
                    <Select
                      value={selectedElement.data?.shape || 'circle'}
                      label="Shape Type"
                      onChange={(e) => handleElementDataUpdate('shape', e.target.value)}
                    >
                      <MenuItem value="circle">Circle</MenuItem>
                      <MenuItem value="square">Square</MenuItem>
                      <MenuItem value="star">Star</MenuItem>
                      <MenuItem value="heart">Heart</MenuItem>
                      <MenuItem value="arrow">Arrow</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => openColorPicker('background')}
                    startIcon={<PaletteIcon />}
                  >
                    Fill Color
                  </Button>

                  {showColorPicker && colorPickerType === 'background' && (
                    <HexColorPicker
                      color={getCurrentColor()}
                      onChange={handleColorChange}
                    />
                  )}
                </>
              )}

              {/* Common Properties */}
              <Divider />
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedElement.data?.visible !== false}
                    onChange={(e) => handleElementDataUpdate('visible', e.target.checked)}
                  />
                }
                label="Visible"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedElement.data?.locked === true}
                    onChange={(e) => handleElementDataUpdate('locked', e.target.checked)}
                  />
                }
                label="Locked"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      {!selectedElement && (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <SettingsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Select an element to view its properties
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
