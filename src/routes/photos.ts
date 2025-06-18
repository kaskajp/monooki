import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../utils/auth';
import getDatabase from '../database/connection';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/photos/items/:itemId - Upload photos for an item
router.post('/items/:itemId', authMiddleware, upload.array('photos', 10), async (req: any, res: any) => {
  try {
    const { itemId } = req.params;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    // Verify item exists and belongs to workspace
    const item = await db.get('SELECT id FROM items WHERE id = ? AND workspace_id = ?', [itemId, workspace_id]);
    if (!item) {
      // Clean up uploaded files
      if (req.files) {
        req.files.forEach((file: any) => {
          fs.unlinkSync(file.path);
        });
      }
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const photos = [];
    const now = new Date().toISOString();

    for (const file of req.files as Express.Multer.File[]) {
      const photoId = uuidv4();
      
      await db.run(`
        INSERT INTO photos (id, filename, original_name, mime_type, size, item_id, workspace_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [photoId, file.filename, file.originalname, file.mimetype, file.size, itemId, workspace_id, now]);

      photos.push({
        id: photoId,
        filename: file.filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        created_at: now
      });
    }

    res.status(201).json({ photos });
  } catch (error) {
    console.error('Error uploading photos:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach((file: any) => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      });
    }
    
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// GET /api/photos/items/:itemId - Get all photos for an item
router.get('/items/:itemId', authMiddleware, async (req: any, res: any) => {
  try {
    const { itemId } = req.params;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    // Verify item exists and belongs to workspace
    const item = await db.get('SELECT id FROM items WHERE id = ? AND workspace_id = ?', [itemId, workspace_id]);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const photos = await db.all(`
      SELECT id, filename, original_name, mime_type, size, created_at
      FROM photos 
      WHERE item_id = ?
      ORDER BY created_at ASC
    `, [itemId]);

    res.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// DELETE /api/photos/:photoId - Delete a photo
router.delete('/:photoId', authMiddleware, async (req: any, res: any) => {
  try {
    const { photoId } = req.params;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    // Get photo info and verify ownership
    const photo = await db.get(`
      SELECT p.filename, p.item_id
      FROM photos p
      JOIN items i ON p.item_id = i.id
      WHERE p.id = ? AND i.workspace_id = ?
    `, [photoId, workspace_id]);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(uploadsDir, photo.filename);
    try {
      fs.unlinkSync(filePath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await db.run('DELETE FROM photos WHERE id = ?', [photoId]);

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// GET /api/photos/files/:filename - Serve photo files
router.get('/files/:filename', (req: any, res: any) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Serve the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving photo:', error);
    res.status(500).json({ error: 'Failed to serve photo' });
  }
});

export default router; 