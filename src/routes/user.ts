import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { hashPassword, comparePassword } from '../utils/auth';
import { authMiddleware } from '../utils/auth';
import getDatabase from '../database/connection';
import { updateWorkspaceLabelConfig, getWorkspaceLabelConfig, previewLabelFormat } from '../utils/labels';

const router = Router();

// Validation schemas
const updateWorkspaceSchema = Joi.object({
  workspaceName: Joi.string().min(1).max(100).required()
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

const updateLabelSettingsSchema = Joi.object({
  labelFormat: Joi.string().required(),
  labelPadding: Joi.number().integer().min(1).max(10).required(),
  labelSeparator: Joi.string().allow('').max(5).required(),
  labelNextNumber: Joi.number().integer().min(1).optional()
});

const updateCurrencySettingsSchema = Joi.object({
  currency: Joi.string().length(3).required() // ISO 4217 currency codes are 3 characters
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// PUT /api/user/workspace - Update workspace name
router.put('/workspace', async (req: Request, res: Response) => {
  try {
    const { error, value } = updateWorkspaceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { workspaceName } = value;
    const user = (req as any).user; // From auth middleware
    const db = getDatabase();

    // Check if workspace exists
    const existingWorkspace = await db.get(
      'SELECT id FROM workspaces WHERE id = ?',
      [user.workspace_id]
    );

    if (!existingWorkspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Update workspace name
    await db.run(
      'UPDATE workspaces SET name = ? WHERE id = ?',
      [workspaceName, user.workspace_id]
    );

    res.json({
      message: 'Workspace name updated successfully',
      workspaceName
    });
  } catch (error) {
    console.error('Update workspace error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/user/password - Update user password
router.put('/password', async (req: Request, res: Response) => {
  try {
    const { error, value } = updatePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { currentPassword, newPassword } = value;
    const user = (req as any).user; // From auth middleware
    const db = getDatabase();

    // Get current user data
    const currentUser = await db.get(
      'SELECT password_hash FROM users WHERE id = ?',
      [user.id]
    );

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, currentUser.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await db.run(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, user.id]
    );

    res.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/user/profile - Get user profile information
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // From auth middleware
    const db = getDatabase();

    // Get user and workspace information
    const userProfile = await db.get(`
      SELECT 
        u.id,
        u.email,
        u.role,
        w.name as workspace_name,
        w.id as workspace_id
      FROM users u
      JOIN workspaces w ON u.workspace_id = w.id
      WHERE u.id = ?
    `, [user.id]);

    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role,
      workspaceName: userProfile.workspace_name,
      workspaceId: userProfile.workspace_id
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/user/label-settings - Get workspace label settings
router.get('/label-settings', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const config = await getWorkspaceLabelConfig(user.workspace_id);
    
    res.json({
      labelFormat: config.format,
      labelPadding: config.padding,
      labelSeparator: config.separator,
      labelNextNumber: config.nextNumber
    });
  } catch (error) {
    console.error('Get label settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/user/label-settings - Update workspace label settings
router.put('/label-settings', async (req: Request, res: Response) => {
  try {
    const { error, value } = updateLabelSettingsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { labelFormat, labelPadding, labelSeparator, labelNextNumber } = value;
    const user = (req as any).user;

    await updateWorkspaceLabelConfig(user.workspace_id, {
      format: labelFormat,
      padding: labelPadding,
      separator: labelSeparator,
      ...(labelNextNumber !== undefined && { nextNumber: labelNextNumber })
    });

    res.json({
      message: 'Label settings updated successfully',
      labelFormat,
      labelPadding,
      labelSeparator,
      labelNextNumber
    });
  } catch (error) {
    console.error('Update label settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/user/currency-settings - Get workspace currency settings
router.get('/currency-settings', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = getDatabase();
    
    const workspace = await db.get(
      'SELECT currency FROM workspaces WHERE id = ?',
      [user.workspace_id]
    );
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    res.json({
      currency: workspace.currency || 'USD'
    });
  } catch (error) {
    console.error('Get currency settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/user/currency-settings - Update workspace currency settings
router.put('/currency-settings', async (req: Request, res: Response) => {
  try {
    const { error, value } = updateCurrencySettingsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { currency } = value;
    const user = (req as any).user;
    const db = getDatabase();

    await db.run(
      'UPDATE workspaces SET currency = ? WHERE id = ?',
      [currency, user.workspace_id]
    );

    res.json({
      message: 'Currency settings updated successfully',
      currency
    });
  } catch (error) {
    console.error('Update currency settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/user/preview-label - Preview label format
router.post('/preview-label', async (req: Request, res: Response) => {
  try {
    const { labelFormat, labelPadding, labelSeparator, sampleNumber } = req.body;
    
    // Provide defaults for missing parameters
    const safeFormat = labelFormat || '{number}';
    const safePadding = labelPadding !== undefined ? Number(labelPadding) : 1;
    const safeSeparator = labelSeparator !== undefined ? labelSeparator : '';
    const safeSampleNumber = sampleNumber !== undefined ? Number(sampleNumber) : 1;
    
    // Validate numeric values
    if (isNaN(safePadding) || safePadding < 1 || safePadding > 10) {
      return res.status(400).json({ error: 'Invalid padding value' });
    }
    
    if (isNaN(safeSampleNumber) || safeSampleNumber < 1) {
      return res.status(400).json({ error: 'Invalid sample number' });
    }
    
    const preview = previewLabelFormat(safeFormat, safePadding, safeSeparator, safeSampleNumber);
    
    res.json({ preview });
  } catch (error) {
    console.error('Preview label error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/user/delete-account - Permanently delete user account and all data
router.delete('/delete-account', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // From auth middleware
    const db = getDatabase();

    // Get workspace ID for cleanup
    const workspaceId = user.workspace_id;

    // Start transaction for atomic deletion
    await db.run('BEGIN TRANSACTION');

    try {
      // Delete all photos (files will be handled separately if needed)
      await db.run(`
        DELETE FROM photos 
        WHERE item_id IN (SELECT id FROM items WHERE workspace_id = ?)
      `, [workspaceId]);

      // Delete all items
      await db.run('DELETE FROM items WHERE workspace_id = ?', [workspaceId]);

      // Delete all custom fields
      await db.run('DELETE FROM custom_fields WHERE workspace_id = ?', [workspaceId]);

      // Delete all categories
      await db.run('DELETE FROM categories WHERE workspace_id = ?', [workspaceId]);

      // Delete all locations
      await db.run('DELETE FROM locations WHERE workspace_id = ?', [workspaceId]);

      // Delete all users in this workspace (should just be the current user for single-user workspaces)
      await db.run('DELETE FROM users WHERE workspace_id = ?', [workspaceId]);

      // Delete the workspace itself
      await db.run('DELETE FROM workspaces WHERE id = ?', [workspaceId]);

      // Commit the transaction
      await db.run('COMMIT');

      res.json({
        message: 'Account and all associated data have been permanently deleted'
      });
    } catch (transactionError) {
      // Rollback on error
      await db.run('ROLLBACK');
      throw transactionError;
    }
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 