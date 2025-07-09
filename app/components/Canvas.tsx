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
    elementId: string;
    startX: number;
    startY: number;
  }>({
    isDragging: false,
    elementId: '',
    startX: 0,
    startY: 0,
  });

  const canvasSettings = project?.canvas || DEFAULT_CANVAS_SETTINGS;
  const elements = project?.elements || [];

  const handleMouseDown = (e: React.MouseEvent, element: CanvasElement) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSelectElement(element);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragState({
        isDragging: true,
        elementId: element.id,
        startX: e.clientX - rect.left - element.x,
        startY: e.clientY - rect.top - element.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const element = elements.find(el => el.id === dragState.elementId);
      if (element) {
        const newX = e.clientX - rect.left - dragState.startX;
        const newY = e.clientY - rect.top - dragState.startY;
        
        onUpdateElement({
          ...element,
          x: Math.max(0, Math.min(canvasSettings.width - element.width, newX)),
          y: Math.max(0, Math.min(canvasSettings.height - element.height, newY)),
        });
      }
    }
  };

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
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
    
    const elementStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity,
      cursor: 'move',
      border: isSelected ? '2px solid #1976d2' : '1px solid transparent',
      borderRadius: '4px',
      zIndex: element.type === 'text' ? 2 : 1,
    };

    if (element.type === 'text') {
      return (
        <Box
          key={element.id}
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
      );
    }

    if (element.type === 'image') {
      return (
        <Box
          key={element.id}
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
      );
    }

    if (element.type === 'shape') {
      return (
        <Box
          key={element.id}
          sx={{
            ...elementStyle,
            backgroundColor: element.data.backgroundColor || '#1976d2',
            borderRadius: element.data.borderRadius || '0px',
            border: element.data.borderWidth ? `${element.data.borderWidth}px solid ${element.data.borderColor || '#000000'}` : 'none',
          }}
          onMouseDown={(e) => handleMouseDown(e, element)}
        />
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
              border: '2px solid #1976d2',
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
