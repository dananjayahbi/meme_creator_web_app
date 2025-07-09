'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { MemeTemplate } from '../types';

interface TemplateManagerProps {
  open: boolean;
  onClose: () => void;
  templates: MemeTemplate[];
  onSelectTemplate: (template: MemeTemplate) => void;
  onUploadTemplate: (file: File, name: string, width: number, height: number) => Promise<MemeTemplate>;
  onDeleteTemplate: (templateId: string) => Promise<void>;
  isLoading?: boolean;
}

export function TemplateManager({
  open,
  onClose,
  templates,
  onSelectTemplate,
  onUploadTemplate,
  onDeleteTemplate,
  isLoading = false,
}: TemplateManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);

  // Upload dialog state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadWidth, setUploadWidth] = useState(800);
  const [uploadHeight, setUploadHeight] = useState(600);

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'user', label: 'My Templates' },
    { id: 'recent', label: 'Recent' },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'user' && template.createdAt && new Date(template.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000) ||
      (selectedCategory === 'recent' && template.createdAt && new Date(template.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
    return matchesSearch && matchesCategory;
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadName(file.name.replace(/\.[^/.]+$/, ''));
      
      // Get image dimensions automatically
      const img = new Image();
      img.onload = () => {
        setUploadWidth(img.naturalWidth);
        setUploadHeight(img.naturalHeight);
      };
      img.src = URL.createObjectURL(file);
      
      setShowUploadDialog(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      setUploadLoading(true);
      setUploadError(null);
      await onUploadTemplate(uploadFile, uploadName, uploadWidth, uploadHeight);
      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadName('');
    } catch (error) {
      setUploadError('Failed to upload template. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleTemplateSelect = (template: MemeTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: MemeTemplate) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    
    try {
      await onDeleteTemplate(selectedTemplate.id);
      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Template Manager</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Search and Filter Bar */}
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                component="label"
              >
                Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </Button>
            </Stack>

            {/* Category Pills */}
            <Stack direction="row" spacing={1}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.label}
                  variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                  onClick={() => setSelectedCategory(category.id)}
                  size="small"
                />
              ))}
            </Stack>

            {/* Templates Grid */}
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <CircularProgress />
              </Box>
            ) : filteredTemplates.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  {searchTerm ? 'No templates found matching your search.' : 'No templates available. Upload your first template!'}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ 
                maxHeight: '400px', 
                overflow: 'auto', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: 2 
              }}>
                {filteredTemplates.map((template) => (
                  <Box key={template.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        position: 'relative',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        image={template.imageUrl}
                        alt={template.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="body2" noWrap title={template.name}>
                          {template.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {template.width} × {template.height}
                        </Typography>
                      </CardContent>
                      
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.7)',
                          },
                        }}
                        onClick={(e) => handleMenuOpen(e, template)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Template</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {uploadError && (
              <Alert severity="error" onClose={() => setUploadError(null)}>
                {uploadError}
              </Alert>
            )}
            
            <TextField
              label="Template Name"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              fullWidth
              required
            />
            
            <Stack direction="row" spacing={2}>
              <TextField
                label="Width"
                type="number"
                value={uploadWidth}
                onChange={(e) => setUploadWidth(parseInt(e.target.value) || 800)}
                fullWidth
              />
              <TextField
                label="Height"
                type="number"
                value={uploadHeight}
                onChange={(e) => setUploadHeight(parseInt(e.target.value) || 600)}
                fullWidth
              />
            </Stack>
            
            {uploadFile && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Selected file: {uploadFile.name}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!uploadFile || !uploadName || uploadLoading}
          >
            {uploadLoading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
