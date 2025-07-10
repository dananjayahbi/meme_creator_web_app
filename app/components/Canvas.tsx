'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { MemeProject, CanvasElement } from '../types';
import { DEFAULT_CANVAS_SETTINGS } from '../lib/constants';

interface CanvasProps {
  project?: MemeProject;
  selectedElement?: CanvasElement;
  onSelectElement: (element: CanvasElement) => void;
  onUpdateElement: (element: CanvasElement) => void;
  onDeleteElement: (elementId: string) => void;
}

interface ResizeHandle {
  position: string;
  cursor: string;
  x: number;
  y: number;
}

export function Canvas({
  project,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    isResizing: boolean;
    elementId: string;
    startX: number;
    startY: number;
    resizeHandle?: string;
    originalElement?: CanvasElement;
  }>({
    isDragging: false,
    isResizing: false,
    elementId: '',
    startX: 0,
    startY: 0,
  });

  const canvasSettings = project?.canvas || DEFAULT_CANVAS_SETTINGS;
  const elements = project?.elements || [];

  const handleMouseDown = (e: React.MouseEvent, element: CanvasElement) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't allow interaction with locked elements
    const isLocked = element.data?.locked === true;
    if (isLocked) {
      return;
    }
    
    onSelectElement(element);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragState({
        isDragging: true,
        isResizing: false,
        elementId: element.id,
        startX: e.clientX - rect.left - element.x,
        startY: e.clientY - rect.top - element.y,
        originalElement: element,
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, element: CanvasElement, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't allow resizing locked elements
    const isLocked = element.data?.locked === true;
    if (isLocked) {
      return;
    }
    
    onSelectElement(element);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragState({
        isDragging: false,
        isResizing: true,
        elementId: element.id,
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        resizeHandle: handle,
        originalElement: { ...element },
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging && !dragState.isResizing) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const element = elements.find(el => el.id === dragState.elementId);
    if (!element) return;

    if (dragState.isDragging) {
      // Handle dragging
      const newX = e.clientX - rect.left - dragState.startX;
      const newY = e.clientY - rect.top - dragState.startY;
      
      onUpdateElement({
        ...element,
        x: Math.max(0, Math.min(canvasSettings.width - element.width, newX)),
        y: Math.max(0, Math.min(canvasSettings.height - element.height, newY)),
      });
    } else if (dragState.isResizing && dragState.originalElement) {
      // Handle resizing
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      const deltaX = currentX - dragState.startX;
      const deltaY = currentY - dragState.startY;
      
      let newWidth = dragState.originalElement.width;
      let newHeight = dragState.originalElement.height;
      let newX = dragState.originalElement.x;
      let newY = dragState.originalElement.y;

      switch (dragState.resizeHandle) {
        case 'se': // Southeast
          newWidth = Math.max(20, dragState.originalElement.width + deltaX);
          newHeight = Math.max(20, dragState.originalElement.height + deltaY);
          break;
        case 'sw': // Southwest  
          newWidth = Math.max(20, dragState.originalElement.width - deltaX);
          newHeight = Math.max(20, dragState.originalElement.height + deltaY);
          newX = dragState.originalElement.x + (dragState.originalElement.width - newWidth);
          break;
        case 'ne': // Northeast
          newWidth = Math.max(20, dragState.originalElement.width + deltaX);
          newHeight = Math.max(20, dragState.originalElement.height - deltaY);
          newY = dragState.originalElement.y + (dragState.originalElement.height - newHeight);
          break;
        case 'nw': // Northwest
          newWidth = Math.max(20, dragState.originalElement.width - deltaX);
          newHeight = Math.max(20, dragState.originalElement.height - deltaY);
          newX = dragState.originalElement.x + (dragState.originalElement.width - newWidth);
          newY = dragState.originalElement.y + (dragState.originalElement.height - newHeight);
          break;
        case 'e': // East
          newWidth = Math.max(20, dragState.originalElement.width + deltaX);
          break;
        case 'w': // West
          newWidth = Math.max(20, dragState.originalElement.width - deltaX);
          newX = dragState.originalElement.x + (dragState.originalElement.width - newWidth);
          break;
        case 'n': // North
          newHeight = Math.max(20, dragState.originalElement.height - deltaY);
          newY = dragState.originalElement.y + (dragState.originalElement.height - newHeight);
          break;
        case 's': // South
          newHeight = Math.max(20, dragState.originalElement.height + deltaY);
          break;
      }

      onUpdateElement({
        ...element,
        x: Math.max(0, Math.min(canvasSettings.width - newWidth, newX)),
        y: Math.max(0, Math.min(canvasSettings.height - newHeight, newY)),
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      isResizing: false,
      elementId: '',
      startX: 0,
      startY: 0,
    });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement({} as CanvasElement);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedElement && e.key === 'Delete') {
      onDeleteElement(selectedElement.id);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedElement?.id === element.id;
    const isVisible = element.data?.visible !== false; // Default to visible if not specified
    const isLocked = element.data?.locked === true;
    
    // Don't render if element is not visible
    if (!isVisible) {
      return null;
    }
    
    const elementStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity,
      cursor: isLocked ? 'not-allowed' : 'move',
      border: isSelected ? '2px solid #1976d2' : '1px solid transparent',
      borderRadius: '4px',
      zIndex: element.type === 'text' ? 2 : 1,
      pointerEvents: isLocked ? 'none' : 'auto',
    };

    if (element.type === 'text') {
      return (
        <Box key={element.id}>
          <Box
            sx={elementStyle}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <Typography
              sx={{
                fontSize: element.data.fontSize || 32,
                fontFamily: element.data.fontFamily || 'Arial',
                color: element.data.color || '#000000',
                backgroundColor: element.data.backgroundColor || 'transparent',
                textAlign: element.data.textAlign || 'center',
                fontWeight: element.data.fontWeight || 'bold',
                fontStyle: element.data.fontStyle || 'normal',
                textShadow: element.data.textShadow || 'none',
                padding: '4px 8px',
                border: element.data.borderWidth ? `${element.data.borderWidth}px solid ${element.data.borderColor || '#000000'}` : 'none',
                borderRadius: element.data.borderRadius || '0px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: element.data.textAlign || 'center',
                userSelect: 'none',
              }}
            >
              {element.data.text || 'Double click to edit'}
            </Typography>
          </Box>
          
          {/* Resize handles for selected text */}
          {isSelected && !isLocked && (
            <>
              {/* Corner handles */}
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x - 4,
                  top: element.y - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'nw-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'nw')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width - 4,
                  top: element.y - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'ne-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'ne')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x - 4,
                  top: element.y + element.height - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'sw-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'sw')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width - 4,
                  top: element.y + element.height - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'se-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'se')}
              />
              
              {/* Edge handles */}
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width / 2 - 4,
                  top: element.y - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'n-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'n')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width / 2 - 4,
                  top: element.y + element.height - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 's-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 's')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x - 4,
                  top: element.y + element.height / 2 - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'w-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'w')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width - 4,
                  top: element.y + element.height / 2 - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'e-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'e')}
              />
            </>
          )}
        </Box>
      );
    }

    if (element.type === 'image') {
      return (
        <Box key={element.id}>
          <Box
            sx={elementStyle}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <img
              src={element.data.src}
              alt="Meme element"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: element.data.borderRadius || '0px',
                filter: element.data.filter || 'none',
              }}
              draggable={false}
            />
          </Box>
          
          {/* Resize handles for selected image */}
          {isSelected && !isLocked && element.data.resizable && (
            <>
              {/* Corner handles */}
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x - 4,
                  top: element.y - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'nw-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'nw')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width - 4,
                  top: element.y - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'ne-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'ne')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x - 4,
                  top: element.y + element.height - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'sw-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'sw')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width - 4,
                  top: element.y + element.height - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'se-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'se')}
              />
              
              {/* Edge handles */}
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width / 2 - 4,
                  top: element.y - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'n-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'n')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width / 2 - 4,
                  top: element.y + element.height - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 's-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 's')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x - 4,
                  top: element.y + element.height / 2 - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'w-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'w')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width - 4,
                  top: element.y + element.height / 2 - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'e-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'e')}
              />
            </>
          )}
        </Box>
      );
    }

    if (element.type === 'shape') {
      return (
        <Box key={element.id}>
          <Box
            sx={{
              ...elementStyle,
              backgroundColor: element.data.backgroundColor || '#1976d2',
              borderRadius: element.data.borderRadius || '0px',
              border: element.data.borderWidth ? `${element.data.borderWidth}px solid ${element.data.borderColor || '#000000'}` : 'none',
            }}
            onMouseDown={(e) => handleMouseDown(e, element)}
          />
          
          {/* Resize handles for selected shape */}
          {isSelected && !isLocked && (
            <>
              {/* Corner handles */}
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x - 4,
                  top: element.y - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'nw-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'nw')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width - 4,
                  top: element.y - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'ne-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'ne')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x - 4,
                  top: element.y + element.height - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'sw-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'sw')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width - 4,
                  top: element.y + element.height - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'se-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'se')}
              />
              
              {/* Edge handles */}
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width / 2 - 4,
                  top: element.y - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'n-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'n')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width / 2 - 4,
                  top: element.y + element.height - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 's-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 's')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x - 4,
                  top: element.y + element.height / 2 - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'w-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'w')}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: element.x + element.width - 4,
                  top: element.y + element.height / 2 - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1976d2',
                  border: '1px solid white',
                  cursor: 'e-resize',
                  zIndex: 1001,
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'e')}
              />
            </>
          )}
        </Box>
      );
    }

    return null;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: canvasSettings.backgroundColor,
        border: '2px solid #333',
        borderRadius: '8px',
      }}
    >
      <Box
        ref={canvasRef}
        sx={{
          width: canvasSettings.width,
          height: canvasSettings.height,
          position: 'relative',
          cursor: 'default',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        onMouseLeave={handleMouseUp}
      >
        {elements.length === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#666',
              pointerEvents: 'none',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Your meme canvas
            </Typography>
            <Typography variant="body2">
              Add templates, text, or images to get started
            </Typography>
          </Box>
        )}
        
        {elements.map(renderElement)}
        
        {/* Selection overlay */}
        {selectedElement && (
          <Box
            sx={{
              position: 'absolute',
              left: selectedElement.x - 4,
              top: selectedElement.y - 4,
              width: selectedElement.width + 8,
              height: selectedElement.height + 8,
              border: selectedElement.data?.locked === true 
                ? '2px solid #ff9800' 
                : '2px solid #1976d2',
              borderRadius: '6px',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}
      </Box>
    </Paper>
  );
}
