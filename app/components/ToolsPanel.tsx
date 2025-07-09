'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  ButtonGroup,
  Divider,
  Slider,
  TextField,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  TextFields as TextIcon,
  Image as ImageIcon,
  Crop as CropIcon,
  Brush as BrushIcon,
  ColorLens as ColorIcon,
  FormatSize as FontSizeIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignRight as AlignRightIcon,
  Rotate90DegreesCcw as RotateLeftIcon,
  Rotate90DegreesCw as RotateRightIcon,
  Opacity as OpacityIcon,
  ExpandMore as ExpandMoreIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Layers as LayersIcon,
  Circle as CircleIcon,
  CropSquare as SquareIcon,
  Star as StarIcon,
  Favorite as HeartIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import { CanvasElement } from '../types';
import { POPULAR_FONTS } from '../lib/constants';

interface ToolsPanelProps {
  selectedElement?: CanvasElement;
  onUpdateElement: (element: CanvasElement) => void;
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: (shape: string) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function ToolsPanel({
  selectedElement,
  onUpdateElement,
  onAddText,
  onAddImage,
  onAddShape,
  onDeleteElement,
  onDuplicateElement,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolsPanelProps) {
  const [currentTool, setCurrentTool] = useState('select');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentBgColor, setCurrentBgColor] = useState('#ffffff');

  const tools = [
    { value: 'select', label: 'Select', icon: <LayersIcon /> },
    { value: 'text', label: 'Text', icon: <TextIcon /> },
    { value: 'image', label: 'Image', icon: <ImageIcon /> },
    { value: 'shape', label: 'Shape', icon: <CircleIcon /> },
    { value: 'crop', label: 'Crop', icon: <CropIcon /> },
  ];

  const shapes = [
    { value: 'circle', label: 'Circle', icon: <CircleIcon /> },
    { value: 'square', label: 'Square', icon: <SquareIcon /> },
    { value: 'star', label: 'Star', icon: <StarIcon /> },
    { value: 'heart', label: 'Heart', icon: <HeartIcon /> },
    { value: 'arrow', label: 'Arrow', icon: <ArrowIcon /> },
  ];

  const handleToolChange = (event: React.MouseEvent<HTMLElement>, newTool: string) => {
    if (newTool) {
      setCurrentTool(newTool);
      
      switch (newTool) {
        case 'text':
          onAddText();
          break;
        case 'image':
          onAddImage();
          break;
        default:
          break;
      }
    }
  };

  const handleTextChange = (property: string, value: any) => {
    if (selectedElement && selectedElement.type === 'text') {
      const updatedElement = {
        ...selectedElement,
        data: {
          ...selectedElement.data,
          [property]: value,
        },
      };
      onUpdateElement(updatedElement);
    }
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (selectedElement && selectedElement.type === 'text') {
      handleTextChange('color', color);
    }
  };

  const handleBgColorChange = (color: string) => {
    setCurrentBgColor(color);
    if (selectedElement && selectedElement.type === 'text') {
      handleTextChange('backgroundColor', color);
    }
  };

  const handleOpacityChange = (event: Event, newValue: number | number[]) => {
    if (selectedElement) {
      const updatedElement = {
        ...selectedElement,
        opacity: (newValue as number) / 100,
      };
      onUpdateElement(updatedElement);
    }
  };

  const handleRotationChange = (event: Event, newValue: number | number[]) => {
    if (selectedElement) {
      const updatedElement = {
        ...selectedElement,
        rotation: newValue as number,
      };
      onUpdateElement(updatedElement);
    }
  };

  const isTextSelected = selectedElement?.type === 'text';
  const textData = isTextSelected ? selectedElement.data : {};

  return (
    <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Tools
      </Typography>

      {/* Main Tools */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Tools
        </Typography>
        <ToggleButtonGroup
          value={currentTool}
          exclusive
          onChange={handleToolChange}
          aria-label="tools"
          orientation="vertical"
          fullWidth
        >
          {tools.map((tool) => (
            <ToggleButton key={tool.value} value={tool.value} sx={{ justifyContent: 'flex-start' }}>
              {tool.icon}
              <Typography sx={{ ml: 1 }}>{tool.label}</Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      {/* History Actions */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          History
        </Typography>
        <ButtonGroup fullWidth>
          <Button
            startIcon={<UndoIcon />}
            onClick={onUndo}
            disabled={!canUndo}
          >
            Undo
          </Button>
          <Button
            startIcon={<RedoIcon />}
            onClick={onRedo}
            disabled={!canRedo}
          >
            Redo
          </Button>
        </ButtonGroup>
      </Paper>

      {/* Element Actions */}
      {selectedElement && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Element Actions
          </Typography>
          <ButtonGroup fullWidth>
            <Button
              startIcon={<DuplicateIcon />}
              onClick={onDuplicateElement}
            >
              Duplicate
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              onClick={onDeleteElement}
              color="error"
            >
              Delete
            </Button>
          </ButtonGroup>
        </Paper>
      )}

      {/* Shapes */}
      {currentTool === 'shape' && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Shapes
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {shapes.map((shape) => (
              <Tooltip key={shape.value} title={shape.label}>
                <IconButton
                  onClick={() => onAddShape(shape.value)}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  {shape.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Text Properties */}
      {isTextSelected && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Text Properties</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  label="Text Content"
                  value={textData.text || ''}
                  onChange={(e) => handleTextChange('text', e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                />

                <TextField
                  select
                  label="Font Family"
                  value={textData.fontFamily || 'Arial'}
                  onChange={(e) => handleTextChange('fontFamily', e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  fullWidth
                >
                  {POPULAR_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </TextField>

                <Box>
                  <Typography variant="body2" gutterBottom>
                    Font Size: {textData.fontSize || 16}px
                  </Typography>
                  <Slider
                    value={textData.fontSize || 16}
                    onChange={(e, value) => handleTextChange('fontSize', value)}
                    min={8}
                    max={72}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <ButtonGroup fullWidth>
                  <Button
                    variant={textData.fontWeight === 'bold' ? 'contained' : 'outlined'}
                    onClick={() => handleTextChange('fontWeight', 
                      textData.fontWeight === 'bold' ? 'normal' : 'bold')}
                  >
                    <BoldIcon />
                  </Button>
                  <Button
                    variant={textData.fontStyle === 'italic' ? 'contained' : 'outlined'}
                    onClick={() => handleTextChange('fontStyle', 
                      textData.fontStyle === 'italic' ? 'normal' : 'italic')}
                  >
                    <ItalicIcon />
                  </Button>
                </ButtonGroup>

                <ButtonGroup fullWidth>
                  <Button
                    variant={textData.textAlign === 'left' ? 'contained' : 'outlined'}
                    onClick={() => handleTextChange('textAlign', 'left')}
                  >
                    <AlignLeftIcon />
                  </Button>
                  <Button
                    variant={textData.textAlign === 'center' ? 'contained' : 'outlined'}
                    onClick={() => handleTextChange('textAlign', 'center')}
                  >
                    <AlignCenterIcon />
                  </Button>
                  <Button
                    variant={textData.textAlign === 'right' ? 'contained' : 'outlined'}
                    onClick={() => handleTextChange('textAlign', 'right')}
                  >
                    <AlignRightIcon />
                  </Button>
                </ButtonGroup>

                <Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    sx={{ mb: 1 }}
                  >
                    <ColorIcon sx={{ mr: 1 }} />
                    Text Color
                  </Button>
                  {showColorPicker && (
                    <HexColorPicker
                      color={textData.color || '#000000'}
                      onChange={handleColorChange}
                    />
                  )}
                </Box>

                <Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                    sx={{ mb: 1 }}
                  >
                    <BrushIcon sx={{ mr: 1 }} />
                    Background Color
                  </Button>
                  {showBgColorPicker && (
                    <HexColorPicker
                      color={textData.backgroundColor || '#ffffff'}
                      onChange={handleBgColorChange}
                    />
                  )}
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </>
      )}

      {/* Transform Properties */}
      {selectedElement && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Transform</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Opacity: {Math.round((selectedElement.opacity || 1) * 100)}%
                </Typography>
                <Slider
                  value={(selectedElement.opacity || 1) * 100}
                  onChange={handleOpacityChange}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Rotation: {selectedElement.rotation || 0}°
                </Typography>
                <Slider
                  value={selectedElement.rotation || 0}
                  onChange={handleRotationChange}
                  min={-180}
                  max={180}
                  valueLabelDisplay="auto"
                />
              </Box>

              <ButtonGroup fullWidth>
                <Button
                  startIcon={<RotateLeftIcon />}
                  onClick={() => handleRotationChange(null as any, (selectedElement.rotation || 0) - 90)}
                >
                  -90°
                </Button>
                <Button
                  startIcon={<RotateRightIcon />}
                  onClick={() => handleRotationChange(null as any, (selectedElement.rotation || 0) + 90)}
                >
                  +90°
                </Button>
              </ButtonGroup>
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}
