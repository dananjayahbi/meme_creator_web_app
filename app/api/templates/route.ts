import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir, unlink, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { generateId } from '../../lib/utils';

const TEMPLATES_DIR = join(process.cwd(), 'public', 'assets', 'templates');

// Ensure directory exists
async function ensureDirectory() {
  if (!existsSync(TEMPLATES_DIR)) {
    await mkdir(TEMPLATES_DIR, { recursive: true });
  }
}

// GET - List all templates
export async function GET() {
  try {
    await ensureDirectory();
    const files = await readdir(TEMPLATES_DIR);
    const templates = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = join(TEMPLATES_DIR, file);
          const fileContent = await readFile(filePath, 'utf-8');
          const templateData = JSON.parse(fileContent);
          templates.push(templateData);
        } catch (fileError) {
          console.error(`Error reading template file ${file}:`, fileError);
        }
      }
    }
    
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error reading templates:', error);
    return NextResponse.json({ templates: [] });
  }
}

// POST - Upload new template
export async function POST(request: NextRequest) {
  try {
    await ensureDirectory();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const width = parseInt(formData.get('width') as string) || 800;
    const height = parseInt(formData.get('height') as string) || 600;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload an image file.' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    const templateId = generateId();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${templateId}.${fileExtension}`;
    const filePath = join(TEMPLATES_DIR, fileName);
    
    // Save the image file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Create template metadata
    const template = {
      id: templateId,
      name: name || file.name,
      imageUrl: `/assets/templates/${fileName}`,
      width,
      height,
      textBoxes: [],
      category: 'user',
      createdAt: new Date().toISOString(),
    };
    
    // Save template metadata as JSON
    const metadataPath = join(TEMPLATES_DIR, `${templateId}.json`);
    await writeFile(metadataPath, JSON.stringify(template, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      template,
      message: 'Template uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading template:', error);
    return NextResponse.json(
      { error: 'Failed to upload template' }, 
      { status: 500 }
    );
  }
}

// DELETE - Remove template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }
    
    // Find and delete template files
    const files = await readdir(TEMPLATES_DIR);
    const templateFiles = files.filter(file => file.startsWith(templateId));
    
    for (const file of templateFiles) {
      await unlink(join(TEMPLATES_DIR, file));
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Template deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' }, 
      { status: 500 }
    );
  }
}
