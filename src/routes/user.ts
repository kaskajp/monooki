import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { hashPassword, comparePassword } from '../utils/auth';
import { authMiddleware } from '../utils/auth';
import getDatabase from '../database/connection';

const router = Router();

// Validation schemas
const updateWorkspaceSchema = Joi.object({
  workspaceName: Joi.string().min(1).max(100).required()
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
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

export default router; 