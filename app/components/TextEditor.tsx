'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField } from '@mui/material';
import { CanvasElement } from '../types';

interface TextEditorProps {
  element: CanvasElement;
  onUpdate: (element: CanvasElement) => void;
  onClose: () => void;
}

export function TextEditor({ element, onUpdate, onClose }: TextEditorProps) {
  const [text, setText] = useState(element.data.text || '');
  const textFieldRef = useRef<HTMLInputElement>(null);

  // Define a memoized reference to handleClickOutside to avoid recreating it on each render
  const handleClickOutside = React.useCallback(
    (e: MouseEvent) => {
      if (textFieldRef.current && !textFieldRef.current.contains(e.target as Node)) {
        // Save the current text and close the editor
        onUpdate({
          ...element,
          data: {
            ...element.data,
            text: text
          }
        });
        onClose();
      }
    },
    [element, text, onUpdate, onClose]
  );

  useEffect(() => {
    // Focus the text field when component mounts
    if (textFieldRef.current) {
      textFieldRef.current.focus();
      // Select all text to make it easy to replace
      textFieldRef.current.select();
    }
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    // Update the element with the new text
    onUpdate({
      ...element,
      data: {
        ...element.data,
        text: text
      }
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: 2000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(2px)',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px',
      }}
    >
      <TextField
        inputRef={textFieldRef}
        fullWidth
        multiline
        variant="outlined"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Enter your text here"
        FormHelperTextProps={{ 
          sx: { position: 'absolute', bottom: '-22px', left: '0', bgcolor: 'rgba(0,0,0,0.7)', color: 'white', px: 1, borderRadius: 1 } 
        }}
        helperText="Press Enter to save, Esc to cancel"
        autoFocus
        sx={{
          width: '100%',
          height: '100%',
          '& .MuiInputBase-root': {
            height: '100%',
            fontSize: element.data.fontSize || 32,
            fontFamily: element.data.fontFamily || 'Arial',
            color: element.data.color || '#000000',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            fontWeight: element.data.fontWeight || 'normal',
            fontStyle: element.data.fontStyle || 'normal',
          },
          '& .MuiInputBase-input': {
            textAlign: element.data.textAlign || 'center',
            padding: '4px 8px',
            height: '100% !important',
            overflow: 'auto',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
            borderWidth: 2,
          },
        }}
      />
    </Box>
  );
}
