'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Button,
  Stack,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  ListItemButton,
  Checkbox,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  MoreVert as MoreVertIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Circle as ShapeIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Edit as EditIcon,
  KeyboardArrowUp as MoveUpIcon,
  KeyboardArrowDown as MoveDownIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  GroupWork as GroupIcon,
  RemoveCircleOutline as UngroupIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import { CanvasElement } from '../types';

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedElement?: CanvasElement;
  onSelectElement: (element: CanvasElement) => void;
  onUpdateElement: (element: CanvasElement) => void;
  onDeleteElement: (elementId: string) => void;
  onDuplicateElement: (elementId: string) => void;
  onReorderElements: (elements: CanvasElement[]) => void;
}

interface LayerGroup {
  id: string;
  name: string;
  expanded: boolean;
  elements: string[]; // Element IDs
}

export function LayersPanel({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onReorderElements,
}: LayersPanelProps) {
  const theme = useTheme();
  
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    elementId?: string;
    groupId?: string;
  } | null>(null);
  
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    elementId?: string;
    groupId?: string;
    currentName: string;
  }>({ open: false, currentName: '' });
  
  const [groups, setGroups] = useState<LayerGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Helper functions
  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text': return <TextIcon fontSize="small" />;
      case 'image': return <ImageIcon fontSize="small" />;
      case 'shape': return <ShapeIcon fontSize="small" />;
      default: return <ShapeIcon fontSize="small" />;
    }
  };

  const getElementName = (element: CanvasElement) => {
    if (element.data?.name) return element.data.name;
    
    switch (element.type) {
      case 'text':
        return element.data?.text ? `"${element.data.text.substring(0, 15)}..."` : 'Text Layer';
      case 'image':
        return 'Image Layer';
      case 'shape':
        return element.data?.shape ? `${element.data.shape} Shape` : 'Shape Layer';
      default:
        return 'Layer';
    }
  };

  // Get ungrouped elements
  const ungroupedElements = useMemo(() => {
    const groupedElementIds = new Set(groups.flatMap(group => group.elements));
    return elements.filter(element => !groupedElementIds.has(element.id));
  }, [elements, groups]);

  // Multi-selection handlers
  const handleElementClick = (element: CanvasElement, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select mode
      const newSelected = new Set(selectedElements);
      if (newSelected.has(element.id)) {
        newSelected.delete(element.id);
      } else {
        newSelected.add(element.id);
      }
      setSelectedElements(newSelected);
    } else {
      // Single select
      setSelectedElements(new Set([element.id]));
      onSelectElement(element);
    }
  };

  // Visibility and lock handlers
  const toggleVisibility = (element: CanvasElement, event: React.MouseEvent) => {
    event.stopPropagation();
    const updatedElement = {
      ...element,
      data: {
        ...element.data,
        visible: element.data?.visible !== false ? false : true,
      },
    };
    onUpdateElement(updatedElement);
  };

  const toggleLock = (element: CanvasElement, event: React.MouseEvent) => {
    event.stopPropagation();
    const updatedElement = {
      ...element,
      data: {
        ...element.data,
        locked: element.data?.locked === true ? false : true,
      },
    };
    onUpdateElement(updatedElement);
  };

  // Context menu handlers
  const handleContextMenu = (event: React.MouseEvent, elementId?: string, groupId?: string) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6, elementId, groupId }
        : null
    );
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleRename = (elementId?: string, groupId?: string) => {
    let currentName = '';
    if (elementId) {
      const element = elements.find(el => el.id === elementId);
      currentName = element ? getElementName(element) : '';
    } else if (groupId) {
      const group = groups.find(g => g.id === groupId);
      currentName = group?.name || '';
    }
    setRenameDialog({ open: true, elementId, groupId, currentName });
    handleContextMenuClose();
  };

  const handleRenameConfirm = () => {
    if (renameDialog.elementId) {
      const element = elements.find(el => el.id === renameDialog.elementId);
      if (element) {
        const updatedElement = {
          ...element,
          data: {
            ...element.data,
            name: renameDialog.currentName,
          },
        };
        onUpdateElement(updatedElement);
      }
    } else if (renameDialog.groupId) {
      setGroups(groups.map(group => 
        group.id === renameDialog.groupId 
          ? { ...group, name: renameDialog.currentName }
          : group
      ));
    }
    setRenameDialog({ open: false, elementId: '', currentName: '' });
  };

  const handleDuplicate = (elementId: string) => {
    onDuplicateElement(elementId);
    handleContextMenuClose();
  };

  const handleDelete = (elementId?: string, groupId?: string) => {
    if (elementId) {
      onDeleteElement(elementId);
    } else if (groupId) {
      setGroups(groups.filter(group => group.id !== groupId));
    }
    handleContextMenuClose();
  };

  // Layer reordering
  const moveElement = (elementId: string, direction: 'up' | 'down') => {
    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex === -1) return;

    const newElements = [...elements];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newElements.length) {
      [newElements[currentIndex], newElements[targetIndex]] = [newElements[targetIndex], newElements[currentIndex]];
      onReorderElements(newElements);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', ''); // Required for Firefox
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (event: React.DragEvent, dropIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Work with ungrouped elements only
    const newUngroupedElements = [...ungroupedElements];
    const draggedElement = newUngroupedElements[draggedIndex];
    
    // Remove dragged element
    newUngroupedElements.splice(draggedIndex, 1);
    
    // Insert at new position
    const finalIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newUngroupedElements.splice(finalIndex, 0, draggedElement);
    
    // Create new full elements array by combining grouped and ungrouped elements
    const groupedElementIds = new Set(groups.flatMap(group => group.elements));
    const allElements = elements.filter(el => groupedElementIds.has(el.id));
    const reorderedElements = [...allElements, ...newUngroupedElements];
    
    onReorderElements(reorderedElements);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Group management
  const createGroup = () => {
    const selectedElementIds = Array.from(selectedElements);
    if (selectedElementIds.length === 0) {
      // Create empty group
      const newGroup: LayerGroup = {
        id: `group-${Date.now()}`,
        name: 'New Group',
        expanded: true,
        elements: [],
      };
      setGroups([...groups, newGroup]);
      setExpandedGroups(new Set([...expandedGroups, newGroup.id]));
    } else {
      // Create group with selected elements
      const newGroup: LayerGroup = {
        id: `group-${Date.now()}`,
        name: 'New Group',
        expanded: true,
        elements: selectedElementIds,
      };
      setGroups([...groups, newGroup]);
      setExpandedGroups(new Set([...expandedGroups, newGroup.id]));
      setSelectedElements(new Set());
    }
  };

  const removeFromGroup = (elementId: string) => {
    setGroups(groups.map(group => ({
      ...group,
      elements: group.elements.filter(id => id !== elementId)
    })));
  };

  const ungroupElements = (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId));
    handleContextMenuClose();
  };

  const toggleGroupExpanded = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Helper to get element by ID
  const getElementById = (elementId: string) => {
    return elements.find(el => el.id === elementId);
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" color="text.primary">
          Layers
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Create group from selected">
            <Button
              startIcon={<GroupIcon />}
              size="small"
              variant="outlined"
              onClick={createGroup}
              disabled={selectedElements.size === 0}
            >
              Group
            </Button>
          </Tooltip>
          <Tooltip title="Create empty group">
            <IconButton size="small" onClick={createGroup}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Layers List Container */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* Groups */}
        {groups.length > 0 && (
          <Paper 
            sx={{ 
              mb: 2, 
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <List dense>
              {groups.map((group) => (
                <React.Fragment key={group.id}>
                  {/* Group Header */}
                  <ListItemButton
                    onClick={() => toggleGroupExpanded(group.id)}
                    onContextMenu={(e) => handleContextMenu(e, undefined, group.id)}
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      borderBottom: 1,
                      borderColor: 'divider',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      },
                    }}
                  >
                    <ListItemIcon>
                      {expandedGroups.has(group.id) ? <FolderOpenIcon color="primary" /> : <FolderIcon color="primary" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="subtitle2" color="primary" fontWeight="medium">
                          {group.name}
                        </Typography>
                      }
                      secondary={`${group.elements.length} elements`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, undefined, group.id);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                  
                  {/* Group Elements */}
                  {expandedGroups.has(group.id) && (
                    <Box sx={{ backgroundColor: alpha(theme.palette.background.default, 0.5) }}>
                      {group.elements.map((elementId) => {
                        const element = getElementById(elementId);
                        if (!element) return null;
                        
                        const isSelected = selectedElements.has(element.id);
                        const isLocked = element.data?.locked === true;
                        const isVisible = element.data?.visible !== false;
                        
                        return (
                          <Box
                            key={element.id}
                            onClick={(e) => handleElementClick(element, e)}
                            onContextMenu={(e) => handleContextMenu(e, element.id)}
                            sx={{
                              minHeight: 100,
                              borderBottom: 1,
                              borderColor: 'divider',
                              backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                              borderLeft: isSelected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                              opacity: isVisible ? 1 : 0.5,
                              cursor: 'pointer',
                              p: 2,
                              pl: 4,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                              },
                            }}
                          >
                            {/* Row 1: Checkbox, Group indicator, Visibility Icon, Lock Icon */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              width: '100%',
                              mb: 1
                            }}>
                              {/* Left side: Checkbox + Group indicator */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Checkbox
                                  size="small"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleElementClick(element, e.nativeEvent as any);
                                  }}
                                  sx={{ p: 0.5 }}
                                />
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'text.secondary',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  ┗ {/* Group indent indicator */}
                                </Box>
                              </Box>
                              
                              {/* Right side: Visibility + Lock Icons */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Tooltip title={isVisible ? 'Hide' : 'Show'}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleVisibility(element, e);
                                    }}
                                    sx={{ 
                                      p: 0.5,
                                      backgroundColor: isVisible ? 'transparent' : alpha(theme.palette.error.main, 0.1),
                                    }}
                                  >
                                    {isVisible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title={isLocked ? 'Unlock' : 'Lock'}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleLock(element, e);
                                    }}
                                    sx={{ 
                                      p: 0.5,
                                      backgroundColor: isLocked ? alpha(theme.palette.warning.main, 0.1) : 'transparent',
                                    }}
                                  >
                                    {isLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>

                            {/* Row 2: Element Type Icon + Name */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                              mb: 1,
                              pl: 1
                            }}>
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  width: 32,
                                  height: 32,
                                  borderRadius: 1,
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  color: 'primary.main',
                                  flexShrink: 0
                                }}
                              >
                                {getElementIcon(element.type)}
                              </Box>
                              
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  textDecoration: isLocked ? 'line-through' : 'none',
                                  opacity: isLocked ? 0.7 : 1,
                                  fontWeight: isSelected ? 600 : 500,
                                  fontSize: '0.875rem',
                                  flex: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {getElementName(element)}
                              </Typography>
                            </Box>

                            {/* Row 3: Remove from group, Chip, Coordinates */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              width: '100%',
                              pl: 1
                            }}>
                              {/* Left side: Remove from group + Chip */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Tooltip title="Remove from group">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFromGroup(element.id);
                                    }}
                                    sx={{ p: 0.5 }}
                                  >
                                    <UngroupIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Chip 
                                  label={element.type} 
                                  size="small" 
                                  variant="outlined"
                                  color="primary"
                                  sx={{ 
                                    height: 20, 
                                    fontSize: '0.7rem',
                                    ml: 0.5,
                                    '& .MuiChip-label': { px: 0.75 }
                                  }}
                                />
                              </Box>
                              
                              {/* Right side: Coordinates */}
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary" 
                                  sx={{ fontSize: '0.7rem' }}
                                >
                                  {Math.round(element.x)}, {Math.round(element.y)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        {/* Ungrouped Elements */}
        <Paper sx={{ backgroundColor: theme.palette.background.paper }}>
          {ungroupedElements.map((element, index) => {
            const isSelected = selectedElements.has(element.id);
            const isLocked = element.data?.locked === true;
            const isVisible = element.data?.visible !== false;
            const isDraggedOver = dragOverIndex === index;
            
            return (
              <Box
                key={element.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                onClick={(e) => handleElementClick(element, e)}
                onContextMenu={(e) => handleContextMenu(e, element.id)}
                sx={{
                  minHeight: 100,
                  borderBottom: 1,
                  borderColor: 'divider',
                  backgroundColor: isSelected 
                    ? alpha(theme.palette.primary.main, 0.1) 
                    : isDraggedOver 
                      ? alpha(theme.palette.secondary.main, 0.1)
                      : 'transparent',
                  borderLeft: isSelected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                  opacity: isVisible ? 1 : 0.5,
                  cursor: 'pointer',
                  p: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                  '&:active': {
                    cursor: 'grabbing',
                  },
                }}
              >
                {/* Row 1: Checkbox, Drag Handle, Visibility Icon, Lock Icon */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  width: '100%',
                  mb: 1
                }}>
                  {/* Left side: Checkbox + Drag Handle */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleElementClick(element, e.nativeEvent as any);
                      }}
                      sx={{ p: 0.5 }}
                    />
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'text.secondary',
                        cursor: 'grab',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <DragHandleIcon fontSize="small" />
                    </Box>
                  </Box>
                  
                  {/* Right side: Visibility + Lock Icons */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title={isVisible ? 'Hide' : 'Show'}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVisibility(element, e);
                        }}
                        sx={{ 
                          p: 0.5,
                          backgroundColor: isVisible ? 'transparent' : alpha(theme.palette.error.main, 0.1),
                        }}
                      >
                        {isVisible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={isLocked ? 'Unlock' : 'Lock'}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLock(element, e);
                        }}
                        sx={{ 
                          p: 0.5,
                          backgroundColor: isLocked ? alpha(theme.palette.warning.main, 0.1) : 'transparent',
                        }}
                      >
                        {isLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Row 2: Element Type Icon + Name */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  mb: 1,
                  pl: 1
                }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      flexShrink: 0
                    }}
                  >
                    {getElementIcon(element.type)}
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      textDecoration: isLocked ? 'line-through' : 'none',
                      opacity: isLocked ? 0.7 : 1,
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '0.875rem',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {getElementName(element)}
                  </Typography>
                </Box>

                {/* Row 3: Move Up/Down Icons, Chip, Coordinates, Settings Menu */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  width: '100%',
                  pl: 1
                }}>
                  {/* Left side: Move buttons + Chip */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Move up">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveElement(element.id, 'up');
                        }}
                        disabled={index === 0}
                        sx={{ p: 0.5 }}
                      >
                        <MoveUpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Move down">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveElement(element.id, 'down');
                        }}
                        disabled={index === ungroupedElements.length - 1}
                        sx={{ p: 0.5 }}
                      >
                        <MoveDownIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Chip 
                      label={element.type} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        ml: 0.5,
                        '& .MuiChip-label': { px: 0.75 }
                      }}
                    />
                  </Box>
                  
                  {/* Right side: Coordinates + Settings Menu */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {Math.round(element.x)}, {Math.round(element.y)}
                    </Typography>
                    
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, element.id);
                      }}
                      sx={{ p: 0.5 }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Paper>
      </Box>

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
        {contextMenu?.elementId ? [
          <MenuItem key="rename" onClick={() => handleRename(contextMenu.elementId)}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            Rename
          </MenuItem>,
          <MenuItem key="duplicate" onClick={() => contextMenu.elementId && handleDuplicate(contextMenu.elementId)}>
            <ListItemIcon>
              <DuplicateIcon />
            </ListItemIcon>
            Duplicate
          </MenuItem>,
          <Divider key="divider" />,
          <MenuItem key="delete" onClick={() => handleDelete(contextMenu.elementId)}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            Delete
          </MenuItem>
        ] : contextMenu?.groupId ? [
          <MenuItem key="rename-group" onClick={() => handleRename(undefined, contextMenu.groupId)}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            Rename Group
          </MenuItem>,
          <MenuItem key="ungroup" onClick={() => contextMenu.groupId && ungroupElements(contextMenu.groupId)}>
            <ListItemIcon>
              <UngroupIcon />
            </ListItemIcon>
            Ungroup
          </MenuItem>,
          <Divider key="divider-group" />,
          <MenuItem key="delete-group" onClick={() => handleDelete(undefined, contextMenu.groupId)}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            Delete Group
          </MenuItem>
        ] : []}
      </Menu>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialog.open}
        onClose={() => setRenameDialog({ open: false, elementId: '', currentName: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {renameDialog.elementId ? 'Rename Layer' : 'Rename Group'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={renameDialog.elementId ? 'Layer Name' : 'Group Name'}
            fullWidth
            value={renameDialog.currentName}
            onChange={(e) => setRenameDialog({ ...renameDialog, currentName: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleRenameConfirm();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialog({ open: false, elementId: '', currentName: '' })}>
            Cancel
          </Button>
          <Button onClick={handleRenameConfirm} variant="contained">
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
