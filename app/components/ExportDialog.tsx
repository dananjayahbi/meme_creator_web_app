'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  FormControlLabel,
  Switch,
  IconButton,
  Paper,
  Chip,
  Stack,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Share as ShareIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (exportOptions: ExportOptions) => Promise<void>;
  canvasWidth: number;
  canvasHeight: number;
}

interface ExportOptions {
  format: 'png' | 'jpg' | 'webp' | 'svg';
  quality: number;
  width: number;
  height: number;
  scale: number;
  filename: string;
  backgroundColor: string;
  includeTransparency: boolean;
}

export function ExportDialog({
  open,
  onClose,
  onExport,
  canvasWidth,
  canvasHeight,
}: ExportDialogProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 90,
    width: canvasWidth,
    height: canvasHeight,
    scale: 1,
    filename: 'my-meme',
    backgroundColor: '#ffffff',
    includeTransparency: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleScaleChange = (event: Event, newValue: number | number[]) => {
    const scale = newValue as number;
    handleOptionChange('scale', scale);
    handleOptionChange('width', Math.round(canvasWidth * scale));
    handleOptionChange('height', Math.round(canvasHeight * scale));
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    handleOptionChange(dimension, value);
    
    // Update scale based on size change
    if (dimension === 'width') {
      const newScale = value / canvasWidth;
      handleOptionChange('scale', newScale);
      handleOptionChange('height', Math.round(canvasHeight * newScale));
    } else {
      const newScale = value / canvasHeight;
      handleOptionChange('scale', newScale);
      handleOptionChange('width', Math.round(canvasWidth * newScale));
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    
    try {
      await onExport(exportOptions);
      onClose();
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const getFileSize = () => {
    const pixels = exportOptions.width * exportOptions.height;
    const bytesPerPixel = exportOptions.format === 'jpg' ? 3 : 4;
    const estimatedBytes = pixels * bytesPerPixel;
    
    if (estimatedBytes < 1024) return `${estimatedBytes} B`;
    if (estimatedBytes < 1024 * 1024) return `${(estimatedBytes / 1024).toFixed(1)} KB`;
    return `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatOptions = [
    { value: 'png', label: 'PNG', description: 'Best quality with transparency' },
    { value: 'jpg', label: 'JPG', description: 'Smaller file size, no transparency' },
    { value: 'webp', label: 'WebP', description: 'Modern format with great compression' },
    { value: 'svg', label: 'SVG', description: 'Vector format (experimental)' },
  ];

  const presetSizes = [
    { name: 'Original', width: canvasWidth, height: canvasHeight },
    { name: 'HD (1080p)', width: 1920, height: 1080 },
    { name: 'Square (1:1)', width: 1080, height: 1080 },
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Facebook Post', width: 1200, height: 628 },
    { name: 'Twitter Post', width: 1200, height: 675 },
    { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <DownloadIcon sx={{ mr: 1 }} />
            Export Meme
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Export Settings */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Export Settings
            </Typography>
            
            <Stack spacing={3}>
              {/* Format Selection */}
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={exportOptions.format}
                  label="Format"
                  onChange={(e) => handleOptionChange('format', e.target.value)}
                >
                  {formatOptions.map((format) => (
                    <MenuItem key={format.value} value={format.value}>
                      <Box>
                        <Typography variant="body2">{format.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Filename */}
              <TextField
                label="Filename"
                value={exportOptions.filename}
                onChange={(e) => handleOptionChange('filename', e.target.value)}
                fullWidth
              />

              {/* Quality (for lossy formats) */}
              {(exportOptions.format === 'jpg' || exportOptions.format === 'webp') && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Quality: {exportOptions.quality}%
                  </Typography>
                  <Slider
                    value={exportOptions.quality}
                    onChange={(e, value) => handleOptionChange('quality', value)}
                    min={10}
                    max={100}
                    step={5}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Box>
              )}

              {/* Size Settings */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Size & Scale
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <TextField
                    label="Width"
                    type="number"
                    value={exportOptions.width}
                    onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 0)}
                    size="small"
                  />
                  <TextField
                    label="Height"
                    type="number"
                    value={exportOptions.height}
                    onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 0)}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Scale: {Math.round(exportOptions.scale * 100)}%
                  </Typography>
                  <Slider
                    value={exportOptions.scale}
                    onChange={handleScaleChange}
                    min={0.25}
                    max={4}
                    step={0.25}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                  />
                </Box>
              </Box>

              {/* Background Color */}
              {exportOptions.format !== 'png' && (
                <TextField
                  label="Background Color"
                  type="color"
                  value={exportOptions.backgroundColor}
                  onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                  fullWidth
                />
              )}

              {/* Transparency */}
              {exportOptions.format === 'png' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={exportOptions.includeTransparency}
                      onChange={(e) => handleOptionChange('includeTransparency', e.target.checked)}
                    />
                  }
                  label="Include Transparency"
                />
              )}
            </Stack>
          </Box>

          {/* Preview & Info */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Preview & Info
            </Typography>
            
            <Paper
              sx={{
                p: 2,
                mb: 2,
                textAlign: 'center',
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'grey.100',
              }}
            >
              <Box>
                <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Export Preview
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {exportOptions.width} × {exportOptions.height}
                </Typography>
              </Box>
            </Paper>

            {/* Export Info */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Export Information
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Format:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {exportOptions.format.toUpperCase()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Dimensions:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {exportOptions.width} × {exportOptions.height}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Scale:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Math.round(exportOptions.scale * 100)}%
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Est. File Size:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {getFileSize()}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Preset Sizes */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Preset Sizes
              </Typography>
              <Stack spacing={1}>
                {presetSizes.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      handleOptionChange('width', preset.width);
                      handleOptionChange('height', preset.height);
                      handleOptionChange('scale', preset.width / canvasWidth);
                    }}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <span>{preset.name}</span>
                    <Chip
                      label={`${preset.width} × ${preset.height}`}
                      size="small"
                      variant="outlined"
                    />
                  </Button>
                ))}
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Export Progress */}
        {isExporting && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Exporting...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {/* Export Error */}
        {exportError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {exportError}
          </Alert>
        )}

        {/* Export Tips */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Box>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Export Tips:
            </Typography>
            <Typography variant="body2">
              • PNG format preserves transparency and quality
              • JPG format creates smaller files but no transparency
              • Higher quality settings result in larger file sizes
              • Scale up for print, scale down for web
            </Typography>
          </Box>
        </Alert>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={isExporting}
          startIcon={isExporting ? <SaveIcon /> : <DownloadIcon />}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
