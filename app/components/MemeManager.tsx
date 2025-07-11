'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
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
  Download as DownloadIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { MemeProject } from '../types';
import { storageService } from '../lib/storage';
import { exportToImage } from '../lib/utils';

interface SavedMeme {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailPath: string;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
  project: MemeProject;
}

interface MemeManagerProps {
  open: boolean;
  onClose: () => void;
  onLoadMeme: (project: MemeProject) => void;
  currentProject?: MemeProject;
}

export function MemeManager({
  open,
  onClose,
  onLoadMeme,
  currentProject,
}: MemeManagerProps) {
  const [savedMemes, setSavedMemes] = useState<SavedMeme[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMeme, setSelectedMeme] = useState<SavedMeme | null>(null);
  const [editingMeme, setEditingMeme] = useState<SavedMeme | null>(null);
  const [newMemeName, setNewMemeName] = useState('');

  const categories = [
    { id: 'all', label: 'All Memes' },
    { id: 'recent', label: 'Recent' },
    { id: 'today', label: 'Today' },
  ];

  useEffect(() => {
    if (open) {
      loadSavedMemes();
    }
  }, [open]);

  const loadSavedMemes = async () => {
    setIsLoading(true);
    try {
      const projects = storageService.getProjects();
      const memes: SavedMeme[] = [];
      
      for (const project of projects) {
        // Check if thumbnail exists in localStorage, otherwise generate preview
        const thumbnailPath = `/assets/memes/${project.id}.png`;
        const savedThumbnail = localStorage.getItem(`meme_thumbnail_${project.id}`);
        const imageUrl = savedThumbnail || await generatePreviewImage(project);
        
        memes.push({
          id: project.id,
          name: project.name,
          imageUrl,
          thumbnailPath,
          width: project.canvas.width,
          height: project.canvas.height,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
          project,
        });
      }
      
      setSavedMemes(memes);
    } catch (error) {
      console.error('Failed to load saved memes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreviewImage = async (project: MemeProject): Promise<string> => {
    try {
      // Create a canvas element to render the preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return createFallbackPreview(project);

      // Set canvas size (scaled down for preview)
      const scale = Math.min(300 / project.canvas.width, 200 / project.canvas.height);
      canvas.width = project.canvas.width * scale;
      canvas.height = project.canvas.height * scale;

      // Fill background
      ctx.fillStyle = project.canvas.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render elements (simplified preview)
      for (const element of project.elements) {
        ctx.save();
        
        const x = element.x * scale;
        const y = element.y * scale;
        const width = element.width * scale;
        const height = element.height * scale;

        ctx.globalAlpha = element.opacity;
        
        if (element.rotation !== 0) {
          ctx.translate(x + width / 2, y + height / 2);
          ctx.rotate((element.rotation * Math.PI) / 180);
          ctx.translate(-width / 2, -height / 2);
        } else {
          ctx.translate(x, y);
        }

        if (element.type === 'text') {
          ctx.fillStyle = element.data.color || '#000000';
          ctx.font = `${Math.max(8, (element.data.fontSize || 16) * scale)}px ${element.data.fontFamily || 'Arial'}`;
          ctx.textAlign = element.data.textAlign || 'left';
          ctx.fillText(element.data.text || 'Text', 0, height / 2);
        } else if (element.type === 'shape') {
          ctx.fillStyle = element.data.fill || '#cccccc';
          if (element.data.shape === 'rectangle') {
            ctx.fillRect(0, 0, width, height);
          } else if (element.data.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
            ctx.fill();
          }
        } else if (element.type === 'image') {
          // For images, just draw a placeholder rectangle
          ctx.fillStyle = '#e0e0e0';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#999999';
          ctx.font = `${Math.max(8, 12 * scale)}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText('IMG', width / 2, height / 2);
        }

        ctx.restore();
      }

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating preview:', error);
      return createFallbackPreview(project);
    }
  };

  const createFallbackPreview = (project: MemeProject): string => {
    const { width, height, backgroundColor } = project.canvas;
    const elements = project.elements;
    
    let elementsPreview = '';
    
    // Add simplified representations of elements
    elements.forEach((element, index) => {
      const x = (element.x / width) * 200; // Scale to preview size
      const y = (element.y / height) * 140;
      const w = Math.min((element.width / width) * 200, 40);
      const h = Math.min((element.height / height) * 140, 20);
      
      if (element.type === 'text') {
        elementsPreview += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#666" opacity="0.7" rx="2"/>`;
        elementsPreview += `<text x="${x + 2}" y="${y + 12}" font-size="8" fill="white">T</text>`;
      } else if (element.type === 'image') {
        elementsPreview += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#4CAF50" opacity="0.7" rx="2"/>`;
        elementsPreview += `<text x="${x + 2}" y="${y + 12}" font-size="8" fill="white">I</text>`;
      } else if (element.type === 'shape') {
        elementsPreview += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#2196F3" opacity="0.7" rx="2"/>`;
        elementsPreview += `<text x="${x + 2}" y="${y + 12}" font-size="8" fill="white">S</text>`;
      }
    });
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="140" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}"/>
        ${elementsPreview}
        <text x="10" y="130" font-size="10" fill="#666">${elements.length} element${elements.length !== 1 ? 's' : ''}</text>
      </svg>
    `)}`;
  };

  const filteredMemes = savedMemes.filter(meme => {
    const matchesSearch = meme.name.toLowerCase().includes(searchTerm.toLowerCase());
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    let matchesCategory = true;
    if (selectedCategory === 'recent') {
      matchesCategory = meme.updatedAt > oneWeekAgo;
    } else if (selectedCategory === 'today') {
      matchesCategory = meme.updatedAt > oneDayAgo;
    }
    
    return matchesSearch && matchesCategory;
  });

  const handleMemeClick = (meme: SavedMeme) => {
    onLoadMeme(meme.project);
    onClose();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, meme: SavedMeme) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedMeme(meme);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMeme(null);
  };

  const handleRenameMeme = () => {
    if (selectedMeme) {
      setEditingMeme(selectedMeme);
      setNewMemeName(selectedMeme.name);
      handleMenuClose();
    }
  };

  const handleSaveRename = () => {
    if (editingMeme && newMemeName.trim()) {
      try {
        const updatedProject = {
          ...editingMeme.project,
          name: newMemeName.trim(),
          updatedAt: new Date(),
        };
        storageService.saveProject(updatedProject);
        loadSavedMemes();
        setEditingMeme(null);
        setNewMemeName('');
      } catch (error) {
        console.error('Failed to rename meme:', error);
      }
    }
  };

  const handleCancelRename = () => {
    setEditingMeme(null);
    setNewMemeName('');
  };

  const handleDeleteMeme = () => {
    if (selectedMeme) {
      try {
        storageService.deleteProject(selectedMeme.id);
        loadSavedMemes();
        handleMenuClose();
      } catch (error) {
        console.error('Failed to delete meme:', error);
      }
    }
  };

  const handleDownloadMeme = async () => {
    if (selectedMeme) {
      try {
        // Check if we have a saved high-quality thumbnail
        const savedThumbnail = localStorage.getItem(`meme_thumbnail_${selectedMeme.id}`);
        
        if (savedThumbnail) {
          // Use the saved thumbnail for faster download
          const link = document.createElement('a');
          link.download = `${selectedMeme.name}.png`;
          link.href = savedThumbnail;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          handleMenuClose();
          return;
        }
        
        // Fallback: Render the full meme to a canvas for download
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Could not get canvas context');
          return;
        }

        const project = selectedMeme.project;
        canvas.width = project.canvas.width;
        canvas.height = project.canvas.height;

        // Fill background
        ctx.fillStyle = project.canvas.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Process elements that need to be loaded (like images)
        const imagePromises: Promise<void>[] = [];
        
        for (const element of project.elements) {
          if (element.type === 'image' && element.data.src) {
            const promise = new Promise<void>((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                ctx.save();
                
                const x = element.x;
                const y = element.y;
                const width = element.width;
                const height = element.height;

                ctx.globalAlpha = element.opacity;
                
                if (element.rotation !== 0) {
                  ctx.translate(x + width / 2, y + height / 2);
                  ctx.rotate((element.rotation * Math.PI) / 180);
                  ctx.translate(-width / 2, -height / 2);
                } else {
                  ctx.translate(x, y);
                }

                ctx.drawImage(img, 0, 0, width, height);
                ctx.restore();
                resolve();
              };
              img.onerror = () => {
                // If image fails to load, draw a placeholder
                ctx.save();
                ctx.translate(element.x, element.y);
                ctx.fillStyle = '#e0e0e0';
                ctx.fillRect(0, 0, element.width, element.height);
                ctx.fillStyle = '#999999';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Image', element.width / 2, element.height / 2);
                ctx.restore();
                resolve();
              };
              img.src = element.data.src;
            });
            imagePromises.push(promise);
          }
        }

        // Wait for all images to load, then render other elements
        await Promise.all(imagePromises);

        // Render text and shape elements
        for (const element of project.elements) {
          if (element.type === 'text') {
            ctx.save();
            
            const x = element.x;
            const y = element.y;
            const width = element.width;
            const height = element.height;

            ctx.globalAlpha = element.opacity;
            
            if (element.rotation !== 0) {
              ctx.translate(x + width / 2, y + height / 2);
              ctx.rotate((element.rotation * Math.PI) / 180);
              ctx.translate(-width / 2, -height / 2);
            } else {
              ctx.translate(x, y);
            }

            ctx.fillStyle = element.data.color || '#000000';
            ctx.font = `${element.data.fontWeight || 'normal'} ${element.data.fontSize || 16}px ${element.data.fontFamily || 'Arial'}`;
            ctx.textAlign = element.data.textAlign || 'left';
            
            // Handle multi-line text
            const text = element.data.text || 'Text';
            const lines = text.split('\n');
            const lineHeight = (element.data.fontSize || 16) * 1.2;
            
            lines.forEach((line: string, index: number) => {
              ctx.fillText(line, 0, lineHeight * (index + 1));
            });

            ctx.restore();
          } else if (element.type === 'shape') {
            ctx.save();
            
            const x = element.x;
            const y = element.y;
            const width = element.width;
            const height = element.height;

            ctx.globalAlpha = element.opacity;
            
            if (element.rotation !== 0) {
              ctx.translate(x + width / 2, y + height / 2);
              ctx.rotate((element.rotation * Math.PI) / 180);
              ctx.translate(-width / 2, -height / 2);
            } else {
              ctx.translate(x, y);
            }

            ctx.fillStyle = element.data.fill || '#cccccc';
            
            if (element.data.shape === 'rectangle') {
              ctx.fillRect(0, 0, width, height);
            } else if (element.data.shape === 'circle') {
              ctx.beginPath();
              ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
              ctx.fill();
            }

            ctx.restore();
          }
        }

        // Download the rendered canvas
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${selectedMeme.name}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        handleMenuClose();
      } catch (error) {
        console.error('Failed to download meme:', error);
        // Fallback to the preview image if rendering fails
        const link = document.createElement('a');
        link.download = `${selectedMeme.name}.png`;
        link.href = selectedMeme.imageUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        handleMenuClose();
      }
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getMemeStats = (meme: SavedMeme) => {
    const textElements = meme.project.elements.filter(el => el.type === 'text').length;
    const imageElements = meme.project.elements.filter(el => el.type === 'image').length;
    const shapeElements = meme.project.elements.filter(el => el.type === 'shape').length;
    
    return { textElements, imageElements, shapeElements };
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { minHeight: '90vh', maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <ImageIcon sx={{ mr: 1 }} />
              My Memes
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Search and Filter */}
          <Box sx={{ mb: 3, mt:1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                placeholder="Search memes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
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
            </Stack>
          </Box>

          {/* Loading State */}
          {isLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          )}

          {/* Empty State */}
          {!isLoading && filteredMemes.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm ? 'No memes found' : 'No saved memes yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create and save your first meme to see it here'
                }
              </Typography>
            </Box>
          )}

          {/* Memes Grid */}
          {!isLoading && filteredMemes.length > 0 && (
            <Box sx={{ 
              maxHeight: '500px', 
              overflow: 'auto', 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: 2 
            }}>
              {filteredMemes.map((meme) => {
                const stats = getMemeStats(meme);
                const isCurrentProject = currentProject?.id === meme.id;
                
                return (
                  <Box key={meme.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: isCurrentProject ? 2 : 1,
                        borderColor: isCurrentProject ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                      onClick={() => handleMemeClick(meme)}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={meme.imageUrl}
                        alt={meme.name}
                        sx={{ 
                          objectFit: 'contain',
                          backgroundColor: 'grey.50',
                          border: '1px solid',
                          borderColor: 'grey.200',
                        }}
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = createFallbackPreview(meme.project);
                        }}
                      />
                      <CardContent sx={{ pb: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                          <Typography variant="subtitle2" noWrap sx={{ flex: 1, mr: 1 }}>
                            {meme.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, meme)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary" display="block">
                          {meme.width} × {meme.height}
                        </Typography>
                        
                        <Stack direction="row" spacing={0.5} mt={1} mb={1}>
                          {stats.textElements > 0 && (
                            <Chip label={`${stats.textElements} text`} size="small" />
                          )}
                          {stats.imageElements > 0 && (
                            <Chip label={`${stats.imageElements} img`} size="small" />
                          )}
                          {stats.shapeElements > 0 && (
                            <Chip label={`${stats.shapeElements} shape`} size="small" />
                          )}
                        </Stack>
                        
                        <Box display="flex" alignItems="center" color="text.secondary">
                          <TimeIcon sx={{ mr: 0.5, fontSize: 14 }} />
                          <Typography variant="caption">
                            {formatDate(meme.updatedAt)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            {filteredMemes.length} meme{filteredMemes.length !== 1 ? 's' : ''}
          </Typography>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRenameMeme}>
          <EditIcon sx={{ mr: 1 }} />
          Rename
        </MenuItem>
        <MenuItem onClick={handleDownloadMeme}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={handleDeleteMeme} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Rename Dialog */}
      <Dialog
        open={editingMeme !== null}
        onClose={handleCancelRename}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rename Meme</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Meme Name"
            fullWidth
            value={newMemeName}
            onChange={(e) => setNewMemeName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSaveRename();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRename}>Cancel</Button>
          <Button onClick={handleSaveRename} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
