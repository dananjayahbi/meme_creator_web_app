# Meme Creator Pro

A professional, feature-rich meme creation application built with Next.js, TypeScript, and Material-UI. Create, edit, and share memes with a powerful drag-and-drop interface, template management, and advanced editing tools.

## 🚀 Features

### Core Functionality
- **Drag & Drop Canvas**: Intuitive interface for creating and editing memes
- **Template Management**: Upload, organize, and manage meme templates with file-based backend storage
- **Multi-Upload Support**: Upload multiple templates at once with automatic dimension detection
- **Auto-Save & Restore**: Automatically saves work-in-progress and restores on page refresh
- **Professional UI**: Blue-accented dark theme with Material-UI components

### Template System
- **File-Based Storage**: Templates stored in `/public/assets/templates` with metadata
- **Template Popup Manager**: Clean popup interface for template management (no sidebar clutter)
- **Search & Filter**: Find templates quickly with search and category filtering
- **CRUD Operations**: Full create, read, update, delete functionality for templates

### Canvas & Editing
- **Dynamic Canvas Sizing**: Canvas automatically adjusts to selected template dimensions
- **Text Elements**: Add, style, and position text with full typography controls
- **Image Elements**: Upload and integrate custom images
- **Shape Elements**: Add geometric shapes and decorative elements
- **Layer Management**: Organize elements with a comprehensive layers panel
- **Undo/Redo**: Full history management with 50-state memory

### Export & Sharing
- **Multiple Formats**: Export to PNG, JPG, WEBP, or SVG
- **Quality Control**: Adjustable export quality and resolution
- **Batch Operations**: Handle multiple projects efficiently

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: Material-UI (MUI) v7
- **Canvas**: HTML5 Canvas with Fabric.js
- **Styling**: Material-UI theme system with dark mode
- **Storage**: File system backend + localStorage for auto-save
- **Icons**: Material Icons
- **Utilities**: UUID generation, color picker, image processing

## 📁 Project Structure

```
app/
├── api/
│   └── templates/           # Template CRUD API endpoints
├── components/
│   ├── Canvas.tsx          # Main canvas component
│   ├── MemeCreator.tsx     # Root application component
│   ├── TemplateManager.tsx # Template management popup
│   ├── ToolsPanel.tsx      # Editing tools sidebar
│   ├── LayersPanel.tsx     # Layer management
│   ├── PropertiesPanel.tsx # Element properties editor
│   └── ...                 # Additional UI components
├── hooks/
│   └── useMemeCreator.ts   # Main application logic hook
├── lib/
│   ├── storage.ts          # Storage service (API + localStorage)
│   ├── theme.ts            # Material-UI theme configuration
│   ├── utils.ts            # Utility functions
│   └── constants.ts        # Application constants
└── types/
    └── index.ts            # TypeScript type definitions

public/
└── assets/
    ├── templates/          # Template storage (images + metadata)
    └── memes/              # Exported meme storage
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd meme_creator_web_app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 📖 Usage Guide

### Creating Your First Meme

1. **Start a New Project**: Click "New Project" or use the Speed Dial
2. **Load a Template**: Click "Templates" in the header to open the Template Manager
3. **Upload Templates**: Use the upload button to add your own meme templates
4. **Add Elements**: Use the Tools Panel to add text, images, or shapes
5. **Customize**: Use the Properties Panel to adjust colors, fonts, positions
6. **Export**: Use the Export dialog to save your meme in your preferred format

### Template Management

- **Upload**: Support for JPEG, PNG, GIF, and WebP images (max 10MB)
- **Multi-Upload**: Select multiple files to upload them in sequence
- **Search**: Find templates quickly using the search bar
- **Categories**: Filter by "All", "My Templates", or "Recent"
- **Delete**: Remove unwanted templates with the context menu

### Keyboard Shortcuts

- `Delete`: Remove selected element
- `Ctrl+Z`: Undo (when supported by browser)
- `Ctrl+Y`: Redo (when supported by browser)
- `F11`: Toggle fullscreen mode

## 🔧 Configuration

### Environment Variables

No environment variables required for basic operation. All storage is file-based.

### File Storage

Templates are automatically stored in:
- Images: `/public/assets/templates/[id].jpg|png|gif|webp`
- Metadata: `/public/assets/templates/[id].json`

## 🐛 Error Handling

- **File Upload Validation**: Automatic file type and size validation
- **API Error Recovery**: Graceful fallback for storage operations
- **User Feedback**: Toast notifications for all operations
- **Auto-Save Recovery**: Automatic restoration of unsaved work

## 🎨 Customization

### Theme
The app uses a blue-accented dark theme that can be customized in `app/lib/theme.ts`.

### Canvas Settings
Default canvas settings are defined in `app/lib/constants.ts`.

## 📝 API Reference

### Templates API

- `GET /api/templates` - List all templates
- `POST /api/templates` - Upload new template
- `DELETE /api/templates?id=[id]` - Delete template

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Roadmap

- [ ] Collaborative editing
- [ ] Template sharing marketplace
- [ ] Advanced animation support
- [ ] Mobile app version
- [ ] Cloud storage integration
- [ ] Social media integration

---

**Meme Creator Pro** - Professional meme creation made simple.
