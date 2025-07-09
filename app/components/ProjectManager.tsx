'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Alert,
  Divider,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Folder as FolderIcon,
  Search as SearchIcon,
  SortByAlpha as SortIcon,
  FilterList as FilterIcon,
  AccessTime as TimeIcon,
  Image as ImageIcon,
  TextFields as TextIcon,
  Layers as LayersIcon,
  Save as SaveIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { MemeProject } from '../types';
import { storageService } from '../lib/storage';

interface ProjectManagerProps {
  open: boolean;
  onClose: () => void;
  onLoadProject: (project: MemeProject) => void;
  onNewProject: () => void;
  currentProject?: MemeProject;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export function ProjectManager({
  open,
  onClose,
  onLoadProject,
  onNewProject,
  currentProject,
}: ProjectManagerProps) {
  const [projects, setProjects] = useState<MemeProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    project: MemeProject;
  } | null>(null);
  const [editingProject, setEditingProject] = useState<MemeProject | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated'>('updated');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'favorite'>('all');

  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = () => {
    try {
      const loadedProjects = storageService.getProjects();
      setProjects(loadedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, project: MemeProject) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      project,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleDeleteProject = (project: MemeProject) => {
    try {
      storageService.deleteProject(project.id);
      loadProjects();
      handleContextMenuClose();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleDuplicateProject = (project: MemeProject) => {
    try {
      const duplicatedProject: MemeProject = {
        ...project,
        id: `${project.id}-copy-${Date.now()}`,
        name: `${project.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      storageService.saveProject(duplicatedProject);
      loadProjects();
      handleContextMenuClose();
    } catch (error) {
      console.error('Failed to duplicate project:', error);
    }
  };

  const handleRenameProject = (project: MemeProject) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    handleContextMenuClose();
  };

  const handleSaveRename = () => {
    if (editingProject && newProjectName.trim()) {
      try {
        const updatedProject = {
          ...editingProject,
          name: newProjectName.trim(),
          updatedAt: new Date(),
        };
        storageService.saveProject(updatedProject);
        loadProjects();
        setEditingProject(null);
        setNewProjectName('');
      } catch (error) {
        console.error('Failed to rename project:', error);
      }
    }
  };

  const handleCancelRename = () => {
    setEditingProject(null);
    setNewProjectName('');
  };

  const handleNewProject = () => {
    onNewProject();
    onClose();
  };

  const handleLoadProject = (project: MemeProject) => {
    onLoadProject(project);
    onClose();
  };

  const getFilteredProjects = () => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(project => new Date(project.updatedAt) > oneWeekAgo);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  };

  const getProjectStats = (project: MemeProject) => {
    const textElements = project.elements.filter(el => el.type === 'text').length;
    const imageElements = project.elements.filter(el => el.type === 'image').length;
    const shapeElements = project.elements.filter(el => el.type === 'shape').length;
    
    return { textElements, imageElements, shapeElements };
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredProjects = getFilteredProjects();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <FolderIcon sx={{ mr: 1 }} />
            Project Manager
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Search and Filter Controls */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search projects..."
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
            <Button
              variant="outlined"
              size="small"
              startIcon={<SortIcon />}
              onClick={() => {
                const nextSort = sortBy === 'name' ? 'created' : sortBy === 'created' ? 'updated' : 'name';
                setSortBy(nextSort);
              }}
            >
              Sort: {sortBy}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterIcon />}
              onClick={() => {
                const nextFilter = filterBy === 'all' ? 'recent' : 'all';
                setFilterBy(nextFilter);
              }}
            >
              Filter: {filterBy}
            </Button>
          </Stack>
        </Box>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onChange={(e, value) => setSelectedTab(value)}
          sx={{ mb: 2 }}
        >
          <Tab
            label={
              <Badge badgeContent={filteredProjects.length} color="primary">
                Projects
              </Badge>
            }
          />
          <Tab label="Templates" />
          <Tab label="Recent" />
        </Tabs>

        {/* Projects Tab */}
        <TabPanel value={selectedTab} index={0}>
          {filteredProjects.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <FolderOpenIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No projects found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Create your first meme project to get started'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewProject}
              >
                New Project
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {filteredProjects.map((project) => {
                const stats = getProjectStats(project);
                return (
                  <Card
                    key={project.id}
                    sx={{
                      cursor: 'pointer',
                      border: currentProject?.id === project.id ? 2 : 1,
                      borderColor: currentProject?.id === project.id ? 'primary.main' : 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                    onClick={() => handleLoadProject(project)}
                    onContextMenu={(e) => handleContextMenu(e, project)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                        <Typography variant="h6" noWrap>
                          {project.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContextMenu(e, project);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {project.canvas.width} × {project.canvas.height}
                      </Typography>

                      <Stack direction="row" spacing={1} mb={2}>
                        {stats.textElements > 0 && (
                          <Chip
                            label={`${stats.textElements} text`}
                            size="small"
                            icon={<TextIcon />}
                          />
                        )}
                        {stats.imageElements > 0 && (
                          <Chip
                            label={`${stats.imageElements} image`}
                            size="small"
                            icon={<ImageIcon />}
                          />
                        )}
                        {stats.shapeElements > 0 && (
                          <Chip
                            label={`${stats.shapeElements} shape`}
                            size="small"
                            icon={<LayersIcon />}
                          />
                        )}
                      </Stack>

                      <Box display="flex" alignItems="center" color="text.secondary">
                        <TimeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                        <Typography variant="caption">
                          Updated {formatDate(project.updatedAt)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </TabPanel>

        {/* Templates Tab */}
        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Templates
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Template management coming soon
            </Typography>
          </Box>
        </TabPanel>

        {/* Recent Tab */}
        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <TimeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Recent Projects
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Recent projects view coming soon
            </Typography>
          </Box>
        </TabPanel>

        {/* Context Menu */}
        <Menu
          open={contextMenu !== null}
          onClose={handleContextMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={() => handleRenameProject(contextMenu!.project)}>
            <EditIcon sx={{ mr: 1 }} />
            Rename
          </MenuItem>
          <MenuItem onClick={() => handleDuplicateProject(contextMenu!.project)}>
            <DuplicateIcon sx={{ mr: 1 }} />
            Duplicate
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => handleDeleteProject(contextMenu!.project)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Rename Dialog */}
        <Dialog
          open={editingProject !== null}
          onClose={handleCancelRename}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Rename Project</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Project Name"
              fullWidth
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
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
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewProject}
        >
          New Project
        </Button>
      </DialogActions>
    </Dialog>
  );
}
