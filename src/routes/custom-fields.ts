import { Router } from 'express';
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

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validation schemas
const createCustomFieldSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  field_type: Joi.string().valid('text', 'number', 'date', 'textarea', 'checkbox', 'enum').required(),
  required: Joi.boolean().default(false),
  options: Joi.when('field_type', {
    is: 'enum',
    then: Joi.array().items(Joi.string().min(1)).min(1).required(),
    otherwise: Joi.forbidden()
  })
});

const updateCustomFieldSchema = Joi.object({
  name: Joi.string().min(1).max(255),
  field_type: Joi.string().valid('text', 'number', 'date', 'textarea', 'checkbox', 'enum'),
  required: Joi.boolean(),
  options: Joi.when('field_type', {
    is: 'enum',
    then: Joi.array().items(Joi.string().min(1)).min(1),
    otherwise: Joi.forbidden()
  })
});

// GET /api/custom-fields - Get all custom fields for the workspace
router.get('/', async (req: any, res: any) => {
  try {
    const db = getDatabase();
    const customFields = await db.all(`
      SELECT id, name, field_type, required, options, created_at, updated_at
      FROM custom_fields 
      WHERE workspace_id = ?
      ORDER BY name ASC
    `, [req.user.workspace_id]);

    // Parse options JSON for enum fields
    const processedFields = customFields.map(field => ({
      ...field,
      options: field.options ? JSON.parse(field.options) : null
    }));

    res.json(processedFields);
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ error: 'Failed to fetch custom fields' });
  }
});

// POST /api/custom-fields - Create a new custom field
router.post('/', async (req: any, res: any) => {
  try {
    const { error, value } = createCustomFieldSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const db = getDatabase();
    const workspace_id = req.user.workspace_id;

    // Check if custom field name already exists for the workspace
    const existingField = await db.get(`
      SELECT id FROM custom_fields 
      WHERE workspace_id = ? AND name = ?
    `, [workspace_id, value.name]);

    if (existingField) {
      return res.status(400).json({ error: 'Custom field with this name already exists' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const optionsJson = value.options ? JSON.stringify(value.options) : null;
    
    await db.run(`
      INSERT INTO custom_fields (id, workspace_id, name, field_type, required, options, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, workspace_id, value.name, value.field_type, value.required, optionsJson, now, now]);

    const customField = await db.get(`
      SELECT id, name, field_type, required, options, created_at, updated_at
      FROM custom_fields 
      WHERE id = ?
    `, [id]);

    // Parse options JSON
    if (customField.options) {
      customField.options = JSON.parse(customField.options);
    }

    res.status(201).json(customField);
  } catch (error) {
    console.error('Error creating custom field:', error);
    res.status(500).json({ error: 'Failed to create custom field' });
  }
});

// PUT /api/custom-fields/:id - Update a custom field
router.put('/:id', async (req: any, res: any) => {
  try {
    const customFieldId = req.params.id;
    const { error, value } = updateCustomFieldSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const db = getDatabase();
    const workspace_id = req.user.workspace_id;

    // Check if custom field exists and belongs to user's workspace
    const existingField = await db.get(`
      SELECT id FROM custom_fields 
      WHERE id = ? AND workspace_id = ?
    `, [customFieldId, workspace_id]);

    if (!existingField) {
      return res.status(404).json({ error: 'Custom field not found' });
    }

    // Check if name already exists for another custom field in the workspace
    if (value.name) {
      const duplicateField = await db.get(`
        SELECT id FROM custom_fields 
        WHERE workspace_id = ? AND name = ? AND id != ?
      `, [workspace_id, value.name, customFieldId]);

      if (duplicateField) {
        return res.status(400).json({ error: 'Custom field with this name already exists' });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (value.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(value.name);
    }
    if (value.field_type !== undefined) {
      updateFields.push('field_type = ?');
      updateValues.push(value.field_type);
    }
    if (value.required !== undefined) {
      updateFields.push('required = ?');
      updateValues.push(value.required);
    }
    if (value.options !== undefined) {
      updateFields.push('options = ?');
      updateValues.push(value.options ? JSON.stringify(value.options) : null);
    }
    
    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(customFieldId);

    await db.run(`
      UPDATE custom_fields 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    const updatedField = await db.get(`
      SELECT id, name, field_type, required, options, created_at, updated_at
      FROM custom_fields 
      WHERE id = ?
    `, [customFieldId]);

    // Parse options JSON
    if (updatedField.options) {
      updatedField.options = JSON.parse(updatedField.options);
    }

    res.json(updatedField);
  } catch (error) {
    console.error('Error updating custom field:', error);
    res.status(500).json({ error: 'Failed to update custom field' });
  }
});

// DELETE /api/custom-fields/:id - Delete a custom field
router.delete('/:id', async (req: any, res: any) => {
  try {
    const customFieldId = req.params.id;
    const db = getDatabase();
    const workspace_id = req.user.workspace_id;

    // Check if custom field exists and belongs to user's workspace
    const existingField = await db.get(`
      SELECT name FROM custom_fields 
      WHERE id = ? AND workspace_id = ?
    `, [customFieldId, workspace_id]);

    if (!existingField) {
      return res.status(404).json({ error: 'Custom field not found' });
    }

    // Remove the custom field from all items' custom_fields JSON
    const itemsWithCustomField = await db.all(`
      SELECT id, custom_fields FROM items 
      WHERE workspace_id = ? AND custom_fields IS NOT NULL
    `, [workspace_id]);

    for (const item of itemsWithCustomField) {
      try {
        const customFields = JSON.parse(item.custom_fields);
        if (customFields && customFields[existingField.name]) {
          delete customFields[existingField.name];
          
          // Update the item with the modified custom_fields
          const updatedCustomFields = Object.keys(customFields).length > 0 ? JSON.stringify(customFields) : null;
          await db.run(`
            UPDATE items 
            SET custom_fields = ?, updated_at = ?
            WHERE id = ?
          `, [updatedCustomFields, new Date().toISOString(), item.id]);
        }
      } catch (parseError) {
        console.error(`Error parsing custom fields for item ${item.id}:`, parseError);
        // Continue with other items even if one fails
      }
    }

    // Delete the custom field definition
    await db.run('DELETE FROM custom_fields WHERE id = ?', [customFieldId]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting custom field:', error);
    res.status(500).json({ error: 'Failed to delete custom field' });
  }
});

export default router; 