import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { authMiddleware } from '../utils/auth';
import getDatabase from '../database/connection';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'user';
    workspace_id: string;
  };
}

const router = Router();
router.use(authMiddleware);

const categorySchema = Joi.object({
  name: Joi.string().min(1).required()
});

// GET /api/categories
router.get('/', async (req: any, res: any) => {
  try {
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();
    
    const categories = await db.all(
      'SELECT * FROM categories WHERE workspace_id = ? ORDER BY name',
      [workspace_id]
    );

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/categories/:id
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    const category = await db.get(
      'SELECT * FROM categories WHERE id = ? AND workspace_id = ?',
      [id, workspace_id]
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/categories
router.post('/', async (req: any, res: any) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const workspace_id = req.user.workspace_id;
    const db = getDatabase();
    
    const id = uuidv4();

    await db.run(
      'INSERT INTO categories (id, name, workspace_id) VALUES (?, ?, ?)',
      [id, value.name, workspace_id]
    );

    const createdCategory = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(201).json(createdCategory);
  } catch (error: any) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    const existingCategory = await db.get('SELECT id FROM categories WHERE id = ? AND workspace_id = ?', [id, workspace_id]);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await db.run(
      'UPDATE categories SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND workspace_id = ?',
      [value.name, id, workspace_id]
    );

    const updatedCategory = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    res.json(updatedCategory);
  } catch (error: any) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    const existingCategory = await db.get('SELECT id FROM categories WHERE id = ? AND workspace_id = ?', [id, workspace_id]);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await db.run('DELETE FROM categories WHERE id = ? AND workspace_id = ?', [id, workspace_id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 