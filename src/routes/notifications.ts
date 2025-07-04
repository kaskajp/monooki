import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { authMiddleware } from '../utils/auth';
import getDatabase from '../database/connection';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

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
const smtpSettingsSchema = Joi.object({
  host: Joi.string().required(),
  port: Joi.number().integer().min(1).max(65535).required(),
  secure: Joi.boolean().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  from_email: Joi.string().email().required(),
  from_name: Joi.string().required()
});

const notificationPreferenceSchema = Joi.object({
  notification_frequency: Joi.string().valid('none', 'daily', 'weekly').required()
});

// GET /api/notifications/smtp-settings - Get SMTP settings
router.get('/smtp-settings', async (req: any, res: any) => {
  try {
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    const settings = await db.get(`
      SELECT host, port, secure, username, from_email, from_name, created_at, updated_at
      FROM smtp_settings 
      WHERE workspace_id = ?
    `, [workspace_id]);

    if (!settings) {
      return res.status(404).json({ error: 'SMTP settings not configured' });
    }

    res.json(settings);
  } catch (error) {
    console.error('Get SMTP settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notifications/smtp-settings - Create or update SMTP settings
router.post('/smtp-settings', async (req: any, res: any) => {
  try {
    const { error, value } = smtpSettingsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    // Check if settings already exist
    const existingSettings = await db.get(`
      SELECT id FROM smtp_settings WHERE workspace_id = ?
    `, [workspace_id]);

    if (existingSettings) {
      // Update existing settings
      await db.run(`
        UPDATE smtp_settings SET 
          host = ?, port = ?, secure = ?, username = ?, password = ?, 
          from_email = ?, from_name = ?, updated_at = CURRENT_TIMESTAMP
        WHERE workspace_id = ?
      `, [
        value.host, value.port, value.secure, value.username, value.password,
        value.from_email, value.from_name, workspace_id
      ]);
    } else {
      // Create new settings
      const id = uuidv4();
      await db.run(`
        INSERT INTO smtp_settings (
          id, host, port, secure, username, password, from_email, from_name, workspace_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, value.host, value.port, value.secure, value.username, value.password,
        value.from_email, value.from_name, workspace_id
      ]);
    }

    res.json({ message: 'SMTP settings saved successfully' });
  } catch (error) {
    console.error('Save SMTP settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notifications/test-smtp - Test SMTP settings
router.post('/test-smtp', async (req: any, res: any) => {
  try {
    const workspace_id = req.user.workspace_id;
    const userEmail = req.user.email;
    const db = getDatabase();

    const settings = await db.get(`
      SELECT host, port, secure, username, password, from_email, from_name
      FROM smtp_settings 
      WHERE workspace_id = ?
    `, [workspace_id]);

    if (!settings) {
      return res.status(404).json({ error: 'SMTP settings not configured' });
    }

    // Create transporter with improved configuration
    const transporterConfig: any = {
      host: settings.host,
      port: settings.port,
      auth: {
        user: settings.username,
        pass: settings.password
      }
    };

    // Handle different security modes
    if (settings.port === 465) {
      // Port 465 typically uses SSL/TLS
      transporterConfig.secure = true;
    } else if (settings.port === 587 || settings.port === 25) {
      // Port 587 typically uses STARTTLS, port 25 is usually plain
      transporterConfig.secure = false;
      transporterConfig.requireTLS = true; // Force STARTTLS
    } else {
      // Use the user's preference for other ports
      transporterConfig.secure = settings.secure;
      if (!settings.secure) {
        transporterConfig.requireTLS = false; // Allow plain connections
      }
    }

    // Add additional options for better compatibility
    transporterConfig.tls = {
      rejectUnauthorized: false // Allow self-signed certificates (for development/testing)
    };

    const transporter = nodemailer.createTransport(transporterConfig);

    // Verify connection first
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from: `"${settings.from_name}" <${settings.from_email}>`,
      to: userEmail,
      subject: 'Monooki SMTP Test',
      html: `
        <h2>SMTP Configuration Test</h2>
        <p>This is a test email to verify your SMTP settings are working correctly.</p>
        <p>If you received this email, your SMTP configuration is successful!</p>
        <br>
        <p><strong>Configuration used:</strong></p>
        <ul>
          <li>Host: ${settings.host}</li>
          <li>Port: ${settings.port}</li>
          <li>Security: ${transporterConfig.secure ? 'SSL/TLS' : (transporterConfig.requireTLS ? 'STARTTLS' : 'None')}</li>
        </ul>
        <br>
        <p>Best regards,<br>Your Monooki System</p>
      `
    });

    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test SMTP error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send test email. ';
    
    if (error instanceof Error) {
      if (error.message.includes('wrong version number') || error.message.includes('SSL')) {
        errorMessage += 'SSL/TLS configuration mismatch. Try: For Gmail use port 587 with STARTTLS, or port 465 with SSL/TLS.';
      } else if (error.message.includes('authentication') || error.message.includes('auth')) {
        errorMessage += 'Authentication failed. Please check your username and password.';
      } else if (error.message.includes('connection') || error.message.includes('timeout')) {
        errorMessage += 'Cannot connect to SMTP server. Please check the host and port.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage += 'SMTP host not found. Please check the hostname.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// GET /api/notifications/preferences - Get notification preferences
router.get('/preferences', async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();

    const user = await db.get(`
      SELECT notification_frequency, last_notification_sent
      FROM users 
      WHERE id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      notification_frequency: user.notification_frequency || 'none',
      last_notification_sent: user.last_notification_sent
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notifications/preferences - Update notification preferences
router.post('/preferences', async (req: any, res: any) => {
  try {
    const { error, value } = notificationPreferenceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user.id;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    // Check if SMTP settings are configured
    const smtpSettings = await db.get(`
      SELECT id FROM smtp_settings WHERE workspace_id = ?
    `, [workspace_id]);

    if (!smtpSettings && value.notification_frequency !== 'none') {
      return res.status(400).json({ 
        error: 'SMTP settings must be configured before enabling notifications' 
      });
    }

    await db.run(`
      UPDATE users SET 
        notification_frequency = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [value.notification_frequency, userId]);

    res.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/notifications/smtp-status - Check if SMTP is configured
router.get('/smtp-status', async (req: any, res: any) => {
  try {
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    const settings = await db.get(`
      SELECT id FROM smtp_settings WHERE workspace_id = ?
    `, [workspace_id]);

    res.json({ configured: !!settings });
  } catch (error) {
    console.error('Get SMTP status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 