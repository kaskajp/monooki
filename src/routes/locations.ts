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

const locationSchema = Joi.object({
  name: Joi.string().min(1).required(),
  description: Joi.string().allow(''),
  custom_fields: Joi.object()
});

const updateLocationSchema = locationSchema.keys({
  name: Joi.string().min(1)
});

// GET /api/locations
router.get('/', async (req: any, res: any) => {
  try {
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();
    
    const locations = await db.all(
      'SELECT * FROM locations WHERE workspace_id = ? ORDER BY name',
      [workspace_id]
    );

    const processedLocations = locations.map(location => ({
      ...location,
      custom_fields: location.custom_fields ? JSON.parse(location.custom_fields) : {}
    }));

    res.json(processedLocations);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/locations/:id
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    const location = await db.get(
      'SELECT * FROM locations WHERE id = ? AND workspace_id = ?',
      [id, workspace_id]
    );

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    location.custom_fields = location.custom_fields ? JSON.parse(location.custom_fields) : {};
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/locations
router.post('/', async (req: any, res: any) => {
  try {
    const { error, value } = locationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const workspace_id = req.user.workspace_id;
    const db = getDatabase();
    
    const id = uuidv4();
    const custom_fields_json = value.custom_fields ? JSON.stringify(value.custom_fields) : null;

    await db.run(
      'INSERT INTO locations (id, name, description, custom_fields, workspace_id) VALUES (?, ?, ?, ?, ?)',
      [id, value.name, value.description, custom_fields_json, workspace_id]
    );

    const createdLocation = await db.get('SELECT * FROM locations WHERE id = ?', [id]);
    createdLocation.custom_fields = createdLocation.custom_fields ? JSON.parse(createdLocation.custom_fields) : {};

    res.status(201).json(createdLocation);
  } catch (error: any) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Location name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/locations/:id
router.put('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { error, value } = updateLocationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    const existingLocation = await db.get('SELECT id FROM locations WHERE id = ? AND workspace_id = ?', [id, workspace_id]);
    if (!existingLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const custom_fields_json = value.custom_fields ? JSON.stringify(value.custom_fields) : null;

    await db.run(`
      UPDATE locations SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        custom_fields = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND workspace_id = ?
    `, [value.name, value.description, custom_fields_json, id, workspace_id]);

    const updatedLocation = await db.get('SELECT * FROM locations WHERE id = ?', [id]);
    updatedLocation.custom_fields = updatedLocation.custom_fields ? JSON.parse(updatedLocation.custom_fields) : {};

    res.json(updatedLocation);
  } catch (error: any) {
    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Location name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/locations/:id
router.delete('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    const existingLocation = await db.get('SELECT id FROM locations WHERE id = ? AND workspace_id = ?', [id, workspace_id]);
    if (!existingLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }

    await db.run('DELETE FROM locations WHERE id = ? AND workspace_id = ?', [id, workspace_id]);
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 