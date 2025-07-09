'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Button,
  Chip,
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
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  MoreVert as MoreVertIcon,
  DragIndicator as DragIcon,
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
  elements: CanvasElement[];
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
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    elementId: string;
  } | null>(null);
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    elementId: string;
    currentName: string;
  }>({ open: false, elementId: '', currentName: '' });
  const [groups, setGroups] = useState<LayerGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <TextIcon />;
      case 'image':
        return <ImageIcon />;
      case 'shape':
        return <ShapeIcon />;
      default:
        return <ShapeIcon />;
    }
  };

  const getElementName = (element: CanvasElement) => {
    if (element.data?.name) return element.data.name;
    
    switch (element.type) {
      case 'text':
        return element.data?.text ? `"${element.data.text.substring(0, 20)}..."` : 'Text';
      case 'image':
        return 'Image';
      case 'shape':
        return element.data?.shape ? `${element.data.shape} Shape` : 'Shape';
      default:
        return 'Element';
    }
  };

  const toggleVisibility = (element: CanvasElement) => {
    const updatedElement = {
      ...element,
      data: {
        ...element.data,
        visible: !element.data?.visible,
      },
    };
    onUpdateElement(updatedElement);
  };

  const toggleLock = (element: CanvasElement) => {
    const updatedElement = {
      ...element,
      data: {
        ...element.data,
        locked: !element.data?.locked,
      },
    };
    onUpdateElement(updatedElement);
  };

  const handleContextMenu = (event: React.MouseEvent, elementId: string) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6, elementId }
        : null
    );
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleRename = (elementId: string, currentName: string) => {
    setRenameDialog({ open: true, elementId, currentName });
    handleContextMenuClose();
  };

  const handleRenameConfirm = () => {
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
    setRenameDialog({ open: false, elementId: '', currentName: '' });
  };

  const handleDuplicate = (elementId: string) => {
    onDuplicateElement(elementId);
    handleContextMenuClose();
  };

  const handleDelete = (elementId: string) => {
    onDeleteElement(elementId);
    handleContextMenuClose();
  };

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

  const createGroup = () => {
    const newGroup: LayerGroup = {
      id: `group-${Date.now()}`,
      name: 'New Group',
      expanded: true,
      elements: [],
    };
    setGroups([...groups, newGroup]);
    setExpandedGroups(new Set([...expandedGroups, newGroup.id]));
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

  return (
    <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Layers</Typography>
        <Button
          startIcon={<AddIcon />}
          size="small"
          onClick={createGroup}
        >
          Group
        </Button>
      </Stack>

      {groups.length > 0 && (
        <Paper sx={{ mb: 2 }}>
          <List dense>
            {groups.map((group) => (
              <React.Fragment key={group.id}>
                <ListItemButton
                  onClick={() => toggleGroupExpanded(group.id)}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    backgroundColor: 'action.hover',
                  }}
                >
                  <ListItemIcon>
                    {expandedGroups.has(group.id) ? <FolderOpenIcon /> : <FolderIcon />}
                  </ListItemIcon>
                  <ListItemText primary={group.name} />
                </ListItemButton>
                {expandedGroups.has(group.id) && (
                  <Box sx={{ pl: 4 }}>
                    {group.elements.map((element) => (
                      <ListItem key={element.id} dense>
                        <ListItemIcon>
                          {getElementIcon(element.type)}
                        </ListItemIcon>
                        <ListItemText primary={getElementName(element)} />
                      </ListItem>
                    ))}
                  </Box>
                )}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      <Paper>
        <List dense>
          {elements.map((element, index) => (
            <ListItem
              key={element.id}
              selected={selectedElement?.id === element.id}
              onClick={() => onSelectElement(element)}
              onContextMenu={(e) => handleContextMenu(e, element.id)}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                <DragIcon />
              </ListItemIcon>
              
              <ListItemIcon>
                {getElementIcon(element.type)}
              </ListItemIcon>
              
              <ListItemText
                primary={getElementName(element)}
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={element.type}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem', height: 20 }}
                    />
                    <Typography variant="caption">
                      {Math.round(element.x)}, {Math.round(element.y)}
                    </Typography>
                  </Stack>
                }
              />
              
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title={element.data?.visible !== false ? 'Hide' : 'Show'}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(element);
                      }}
                    >
                      {element.data?.visible !== false ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={element.data?.locked ? 'Unlock' : 'Lock'}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLock(element);
                      }}
                    >
                      {element.data?.locked ? <LockIcon /> : <LockOpenIcon />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Move up">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveElement(element.id, 'up');
                      }}
                      disabled={index === 0}
                    >
                      <MoveUpIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Move down">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveElement(element.id, 'down');
                      }}
                      disabled={index === elements.length - 1}
                    >
                      <MoveDownIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, element.id);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

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
        <MenuItem onClick={() => handleRename(contextMenu?.elementId || '', getElementName(elements.find(el => el.id === contextMenu?.elementId)!))}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Rename
        </MenuItem>
        <MenuItem onClick={() => handleDuplicate(contextMenu?.elementId || '')}>
          <ListItemIcon>
            <DuplicateIcon />
          </ListItemIcon>
          Duplicate
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDelete(contextMenu?.elementId || '')}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialog.open}
        onClose={() => setRenameDialog({ open: false, elementId: '', currentName: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rename Layer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Layer Name"
            fullWidth
            value={renameDialog.currentName}
            onChange={(e) => setRenameDialog({ ...renameDialog, currentName: e.target.value })}
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
