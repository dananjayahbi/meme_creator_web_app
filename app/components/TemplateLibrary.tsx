'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Alert,
  Chip,
  Stack,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { MemeTemplate } from '../types';
import { generateId } from '../lib/utils';

interface TemplateLibraryProps {
  templates: MemeTemplate[];
  onSelectTemplate: (template: MemeTemplate) => void;
  onSaveTemplate?: (template: MemeTemplate) => void;
  onDeleteTemplate?: (templateId: string) => void;
}

const DEFAULT_TEMPLATES: MemeTemplate[] = [
  {
    id: '1',
    name: 'Distracted Boyfriend',
    imageUrl: '/api/placeholder/400/300',
    width: 400,
    height: 300,
    textBoxes: [
      {
        id: '1',
        text: 'Text 1',
        x: 50,
        y: 50,
        width: 100,
        height: 30,
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderColor: '#000000',
        borderWidth: 0,
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'normal',
        rotation: 0,
        opacity: 1,
      },
      {
        id: '2',
        text: 'Text 2',
        x: 250,
        y: 50,
        width: 100,
        height: 30,
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderColor: '#000000',
        borderWidth: 0,
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'normal',
        rotation: 0,
        opacity: 1,
      },
    ],
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Drake Pointing',
    imageUrl: '/api/placeholder/400/400',
    width: 400,
    height: 400,
    textBoxes: [
      {
        id: '1',
        text: 'No',
        x: 200,
        y: 100,
        width: 180,
        height: 40,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: 'transparent',
        borderColor: '#000000',
        borderWidth: 0,
        textAlign: 'left',
        fontWeight: 'bold',
        fontStyle: 'normal',
        rotation: 0,
        opacity: 1,
      },
      {
        id: '2',
        text: 'Yes',
        x: 200,
        y: 300,
        width: 180,
        height: 40,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: 'transparent',
        borderColor: '#000000',
        borderWidth: 0,
        textAlign: 'left',
        fontWeight: 'bold',
        fontStyle: 'normal',
        rotation: 0,
        opacity: 1,
      },
    ],
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'This is Fine',
    imageUrl: '/api/placeholder/500/300',
    width: 500,
    height: 300,
    textBoxes: [
      {
        id: '1',
        text: 'This is fine',
        x: 50,
        y: 250,
        width: 200,
        height: 40,
        fontSize: 18,
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderColor: '#000000',
        borderWidth: 1,
        textAlign: 'center',
        fontWeight: 'normal',
        fontStyle: 'normal',
        rotation: 0,
        opacity: 1,
      },
    ],
    createdAt: new Date(),
  },
];

export function TemplateLibrary({
  templates,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
}: TemplateLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MemeTemplate | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);

  const allTemplates = [...DEFAULT_TEMPLATES, ...templates];

  const filteredTemplates = allTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['all', 'popular', 'recent', 'custom'];

  const handleTemplateClick = (template: MemeTemplate) => {
    onSelectTemplate(template);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: MemeTemplate) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTemplate(null);
  };

  const handleEdit = () => {
    if (selectedTemplate) {
      setEditingTemplate(selectedTemplate);
      setCreateDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTemplate && onDeleteTemplate) {
      onDeleteTemplate(selectedTemplate.id);
    }
    handleMenuClose();
  };

  const handleSave = (templateData: Partial<MemeTemplate>) => {
    if (editingTemplate) {
      // Update existing template
      const updatedTemplate = { ...editingTemplate, ...templateData };
      if (onSaveTemplate) {
        onSaveTemplate(updatedTemplate);
      }
    } else {
      // Create new template
      const newTemplate: MemeTemplate = {
        id: generateId(),
        name: templateData.name || 'Untitled Template',
        imageUrl: templateData.imageUrl || '',
        width: templateData.width || 400,
        height: templateData.height || 300,
        textBoxes: templateData.textBoxes || [],
        createdAt: new Date(),
      };
      
      if (onSaveTemplate) {
        onSaveTemplate(newTemplate);
      }
    }
    
    setCreateDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setCreateDialogOpen(true);
  };

  return (
    <Box>
      {/* Search and Filter */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
        
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              size="small"
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </Stack>
      </Box>

      {/* Templates Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
            }}
            onClick={() => handleTemplateClick(template)}
          >
              <CardMedia
                component="img"
                height="140"
                image={template.imageUrl}
                alt={template.name}
                sx={{
                  objectFit: 'cover',
                  backgroundColor: '#f5f5f5',
                }}
                onError={(e) => {
                  // Fallback for missing images
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDE2MFYxNDBIMTc1VjEyNVoiIGZpbGw9IiM5OTk5OTkiLz4KPHA+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xXzEpIj4KPHBhdGggZD0iTTE2MCAyMDBIMjQwVjE0MEgxNjBWMjAwWiIgZmlsbD0iIzk5OTk5OSIvPgo8L2c+CjwvcD4KPC9zdmc+';
                }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" noWrap>
                    {template.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, template)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {template.width} × {template.height}
                </Typography>
              </CardContent>
            </Card>
        ))}
      </Box>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No templates found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or create a new template
          </Typography>
        </Box>
      )}

      {/* Create Template FAB */}
      <Fab
        color="primary"
        size="small"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={handleCreateNew}
      >
        <AddIcon />
      </Fab>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <CreateTemplateDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSave}
        initialData={editingTemplate}
      />
    </Box>
  );
}

interface CreateTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (templateData: Partial<MemeTemplate>) => void;
  initialData?: MemeTemplate | null;
}

function CreateTemplateDialog({
  open,
  onClose,
  onSave,
  initialData,
}: CreateTemplateDialogProps) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setImageUrl(initialData.imageUrl);
      setWidth(initialData.width);
      setHeight(initialData.height);
    } else {
      setName('');
      setImageUrl('');
      setWidth(400);
      setHeight(300);
    }
  }, [initialData, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      imageUrl,
      width,
      height,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Edit Template' : 'Create New Template'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Template Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          
          <TextField
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
            placeholder="https://example.com/image.jpg"
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Width"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              inputProps={{ min: 100, max: 2000 }}
            />
            <TextField
              label="Height"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              inputProps={{ min: 100, max: 2000 }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!name.trim()}>
          {initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
