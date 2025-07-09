'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Crop as CropIcon,
  AspectRatio as AspectRatioIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
} from '@mui/icons-material';
import { CROP_RATIOS } from '../lib/constants';
import { CropRatio } from '../types';

interface CropDialogProps {
  open: boolean;
  onClose: () => void;
  onCrop: (cropData: CropData) => void;
  currentWidth: number;
  currentHeight: number;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: CropRatio;
}

export function CropDialog({
  open,
  onClose,
  onCrop,
  currentWidth,
  currentHeight,
}: CropDialogProps) {
  const [selectedRatio, setSelectedRatio] = useState<CropRatio>(CROP_RATIOS[0]);
  const [cropData, setCropData] = useState<CropData>({
    x: 0,
    y: 0,
    width: currentWidth,
    height: currentHeight,
  });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [zoom, setZoom] = useState(1);

  const handleRatioSelect = (ratio: CropRatio) => {
    setSelectedRatio(ratio);
    
    if (ratio.ratio === 0) {
      // Custom ratio
      setMaintainAspectRatio(false);
    } else {
      setMaintainAspectRatio(true);
      
      // Calculate new dimensions based on aspect ratio
      const newWidth = Math.min(currentWidth, currentHeight * ratio.ratio);
      const newHeight = newWidth / ratio.ratio;
      
      setCropData({
        x: (currentWidth - newWidth) / 2,
        y: (currentHeight - newHeight) / 2,
        width: newWidth,
        height: newHeight,
        aspectRatio: ratio,
      });
    }
  };

  const handleCropChange = (property: keyof CropData, value: number) => {
    const newCropData = { ...cropData, [property]: value };
    
    if (maintainAspectRatio && selectedRatio.ratio > 0) {
      if (property === 'width') {
        newCropData.height = value / selectedRatio.ratio;
      } else if (property === 'height') {
        newCropData.width = value * selectedRatio.ratio;
      }
    }
    
    // Ensure crop area doesn't exceed canvas boundaries
    newCropData.width = Math.min(newCropData.width, currentWidth - newCropData.x);
    newCropData.height = Math.min(newCropData.height, currentHeight - newCropData.y);
    newCropData.x = Math.max(0, Math.min(newCropData.x, currentWidth - newCropData.width));
    newCropData.y = Math.max(0, Math.min(newCropData.y, currentHeight - newCropData.height));
    
    setCropData(newCropData);
  };

  const handleZoomChange = (event: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
  };

  const resetCrop = () => {
    setCropData({
      x: 0,
      y: 0,
      width: currentWidth,
      height: currentHeight,
    });
    setSelectedRatio(CROP_RATIOS[0]);
    setMaintainAspectRatio(false);
  };

  const centerCrop = () => {
    const centerX = (currentWidth - cropData.width) / 2;
    const centerY = (currentHeight - cropData.height) / 2;
    
    setCropData({
      ...cropData,
      x: centerX,
      y: centerY,
    });
  };

  const handleApplyCrop = () => {
    onCrop(cropData);
    onClose();
  };

  const previewStyle = {
    width: '100%',
    height: 300,
    border: '2px solid',
    borderColor: 'primary.main',
    borderRadius: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'grey.100',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const cropOverlayStyle = {
    position: 'absolute',
    border: '2px dashed',
    borderColor: 'primary.main',
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    left: `${(cropData.x / currentWidth) * 100}%`,
    top: `${(cropData.y / currentHeight) * 100}%`,
    width: `${(cropData.width / currentWidth) * 100}%`,
    height: `${(cropData.height / currentHeight) * 100}%`,
    pointerEvents: 'none',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <CropIcon sx={{ mr: 1 }} />
            Crop Canvas
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Crop Ratios */}
          <Box sx={{ flex: { xs: 1, md: '0 0 300px' } }}>
            <Typography variant="h6" gutterBottom>
              Aspect Ratios
            </Typography>
            <Stack spacing={1}>
              {CROP_RATIOS.map((ratio) => (
                <Card
                  key={ratio.name}
                  sx={{
                    cursor: 'pointer',
                    border: selectedRatio.name === ratio.name ? 2 : 1,
                    borderColor: selectedRatio.name === ratio.name ? 'primary.main' : 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => handleRatioSelect(ratio)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AspectRatioIcon fontSize="small" />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {ratio.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ratio.width} × {ratio.height}
                          {ratio.ratio > 0 && (
                            <Chip
                              label={`${ratio.ratio.toFixed(2)}:1`}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Preview */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Box sx={previewStyle}>
              <Typography variant="body2" color="text.secondary">
                Canvas Preview ({currentWidth} × {currentHeight})
              </Typography>
              <Box sx={cropOverlayStyle} />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Zoom: {Math.round(zoom * 100)}%
              </Typography>
              <Slider
                value={zoom}
                onChange={handleZoomChange}
                min={0.1}
                max={2}
                step={0.1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              />
            </Box>
          </Box>
        </Box>

        {/* Crop Settings */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Crop Settings
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <TextField
              label="X Position"
              type="number"
              value={Math.round(cropData.x)}
              onChange={(e) => handleCropChange('x', parseInt(e.target.value) || 0)}
              size="small"
            />
            <TextField
              label="Y Position"
              type="number"
              value={Math.round(cropData.y)}
              onChange={(e) => handleCropChange('y', parseInt(e.target.value) || 0)}
              size="small"
            />
            <TextField
              label="Width"
              type="number"
              value={Math.round(cropData.width)}
              onChange={(e) => handleCropChange('width', parseInt(e.target.value) || 0)}
              size="small"
            />
            <TextField
              label="Height"
              type="number"
              value={Math.round(cropData.height)}
              onChange={(e) => handleCropChange('height', parseInt(e.target.value) || 0)}
              size="small"
            />
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                />
              }
              label="Maintain Aspect Ratio"
            />
            
            <Button
              variant="outlined"
              size="small"
              onClick={centerCrop}
              startIcon={<CenterIcon />}
            >
              Center
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              onClick={resetCrop}
              startIcon={<RefreshIcon />}
            >
              Reset
            </Button>
          </Stack>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current: {Math.round(cropData.width)} × {Math.round(cropData.height)}
              {cropData.width > 0 && cropData.height > 0 && (
                <Chip
                  label={`${(cropData.width / cropData.height).toFixed(2)}:1`}
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleApplyCrop}
          startIcon={<CropIcon />}
        >
          Apply Crop
        </Button>
      </DialogActions>
    </Dialog>
  );
}
