import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import getDatabase from '../database/connection';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  workspaceName: Joi.string().min(1).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

// POST /api/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, workspaceName } = value;
    const db = getDatabase();

    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create workspace first
    const workspaceId = uuidv4();
    await db.run(
      'INSERT INTO workspaces (id, name) VALUES (?, ?)',
      [workspaceId, workspaceName]
    );

    // Create user as admin of the workspace
    const userId = uuidv4();
    const passwordHash = await hashPassword(password);
    
    await db.run(
      'INSERT INTO users (id, email, password_hash, role, workspace_id) VALUES (?, ?, ?, ?, ?)',
      [userId, email, passwordHash, 'admin', workspaceId]
    );

    // Generate token
    const token = generateToken({
      userId,
      email,
      role: 'admin',
      workspaceId
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        role: 'admin',
        workspace_id: workspaceId
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;
    const db = getDatabase();

    // Find user
    const user = await db.get(
      'SELECT id, email, password_hash, role, workspace_id FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      workspaceId: user.workspace_id
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        workspace_id: user.workspace_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/logout
router.post('/logout', (req: Request, res: Response) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({ message: 'Logout successful' });
});

// POST /api/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email } = value;
    const db = getDatabase();

    // Check if user exists
    const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) {
      // Don't reveal whether user exists or not
      return res.json({ message: 'If the email exists, a reset link will be sent' });
    }

    // TODO: Implement actual password reset functionality
    // For now, just return success message
    // In a real implementation, you would:
    // 1. Generate a reset token
    // 2. Store it in the database with expiration
    // 3. Send email with reset link
    
    res.json({ message: 'If the email exists, a reset link will be sent' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 