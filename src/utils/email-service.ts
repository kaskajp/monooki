import nodemailer from 'nodemailer';
import cron from 'node-cron';
import getDatabase from '../database/connection';

interface SMTPSettings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
}

interface NotificationData {
  expiredItems: any[];
  expiringItems: any[];
  userEmail: string;
  userName: string;
}

class EmailService {
  private static instance: EmailService;
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async getTransporter(smtpSettings: SMTPSettings) {
    const transporterConfig: any = {
      host: smtpSettings.host,
      port: smtpSettings.port,
      auth: {
        user: smtpSettings.username,
        pass: smtpSettings.password
      }
    };

    // Handle different security modes
    if (smtpSettings.port === 465) {
      // Port 465 typically uses SSL/TLS
      transporterConfig.secure = true;
    } else if (smtpSettings.port === 587 || smtpSettings.port === 25) {
      // Port 587 typically uses STARTTLS, port 25 is usually plain
      transporterConfig.secure = false;
      transporterConfig.requireTLS = true; // Force STARTTLS
    } else {
      // Use the user's preference for other ports
      transporterConfig.secure = smtpSettings.secure;
      if (!smtpSettings.secure) {
        transporterConfig.requireTLS = false; // Allow plain connections
      }
    }

    // Add additional options for better compatibility
    transporterConfig.tls = {
      rejectUnauthorized: false // Allow self-signed certificates (for development/testing)
    };

    return nodemailer.createTransport(transporterConfig);
  }

  private generateEmailContent(data: NotificationData): { subject: string; html: string } {
    const { expiredItems, expiringItems, userName } = data;
    
    const hasExpired = expiredItems.length > 0;
    const hasExpiring = expiringItems.length > 0;
    
    let subject = 'Monooki Inventory Notification';
    if (hasExpired && hasExpiring) {
      subject = `Monooki: ${expiredItems.length} expired, ${expiringItems.length} expiring items`;
    } else if (hasExpired) {
      subject = `Monooki: ${expiredItems.length} expired items`;
    } else if (hasExpiring) {
      subject = `Monooki: ${expiringItems.length} expiring items`;
    }

    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Inventory Notification</h2>
        <p>Hello ${userName},</p>
        <p>Here's your inventory status update:</p>
    `;

    if (hasExpired) {
      html += `
        <div style="background-color: #fee; border: 1px solid #fcc; border-radius: 5px; padding: 15px; margin: 15px 0;">
          <h3 style="color: #d32f2f; margin-top: 0;">⚠️ Expired Items (${expiredItems.length})</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
      `;
      
      expiredItems.forEach(item => {
        const expiredDate = new Date(item.expiration_date).toLocaleDateString();
        html += `
          <li style="margin: 8px 0;">
            <strong>${item.name}</strong>
            ${item.location_name ? `<span style="color: #666;"> - ${item.location_name}</span>` : ''}
            <br>
            <span style="color: #d32f2f; font-size: 0.9em;">Expired: ${expiredDate}</span>
          </li>
        `;
      });
      
      html += `
          </ul>
        </div>
      `;
    }

    if (hasExpiring) {
      html += `
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 15px 0;">
          <h3 style="color: #f39c12; margin-top: 0;">⏰ Expiring Soon (${expiringItems.length})</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
      `;
      
      expiringItems.forEach(item => {
        const expiringDate = new Date(item.expiration_date).toLocaleDateString();
        const daysUntilExpiry = Math.ceil((new Date(item.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        html += `
          <li style="margin: 8px 0;">
            <strong>${item.name}</strong>
            ${item.location_name ? `<span style="color: #666;"> - ${item.location_name}</span>` : ''}
            <br>
            <span style="color: #f39c12; font-size: 0.9em;">Expires: ${expiringDate} (${daysUntilExpiry} days)</span>
          </li>
        `;
      });
      
      html += `
          </ul>
        </div>
      `;
    }

    html += `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 0.9em;">
            This notification was sent based on your notification preferences in Monooki.
            <br>
            You can update your preferences in your profile settings.
          </p>
        </div>
      </div>
    `;

    return { subject, html };
  }

  public async sendNotification(data: NotificationData, smtpSettings: SMTPSettings): Promise<void> {
    const transporter = await this.getTransporter(smtpSettings);
    const { subject, html } = this.generateEmailContent(data);

    await transporter.sendMail({
      from: `"${smtpSettings.from_name}" <${smtpSettings.from_email}>`,
      to: data.userEmail,
      subject,
      html
    });
  }

  public async checkAndSendNotifications(): Promise<void> {
    const db = getDatabase();
    
    try {
      // Get all users with notification preferences enabled
      const usersWithNotifications = await db.all(`
        SELECT u.id, u.email, u.notification_frequency, u.last_notification_sent, u.workspace_id
        FROM users u
        WHERE u.notification_frequency IN ('daily', 'weekly')
          AND u.is_active = 1
      `);

      for (const user of usersWithNotifications) {
        const shouldSend = this.shouldSendNotification(user);
        if (!shouldSend) continue;

        // Get SMTP settings for this workspace
        const smtpSettings = await db.get(`
          SELECT host, port, secure, username, password, from_email, from_name
          FROM smtp_settings
          WHERE workspace_id = ?
        `, [user.workspace_id]);

        if (!smtpSettings) {
          console.warn(`No SMTP settings found for workspace ${user.workspace_id}`);
          continue;
        }

        // Get expired items
        const expiredItems = await db.all(`
          SELECT i.name, i.expiration_date, l.name as location_name
          FROM items i
          LEFT JOIN locations l ON i.location_id = l.id
          WHERE i.workspace_id = ? 
            AND i.expiration_date IS NOT NULL 
            AND i.expiration_date != ''
            AND date(i.expiration_date) < date('now')
          ORDER BY date(i.expiration_date) DESC
          LIMIT 50
        `, [user.workspace_id]);

        // Get expiring items (within 30 days)
        const expiringItems = await db.all(`
          SELECT i.name, i.expiration_date, l.name as location_name
          FROM items i
          LEFT JOIN locations l ON i.location_id = l.id
          WHERE i.workspace_id = ? 
            AND i.expiration_date IS NOT NULL 
            AND i.expiration_date != ''
            AND date(i.expiration_date) <= date('now', '+30 days')
            AND date(i.expiration_date) >= date('now')
          ORDER BY date(i.expiration_date) ASC
          LIMIT 50
        `, [user.workspace_id]);

        // Only send if there are items to notify about
        if (expiredItems.length === 0 && expiringItems.length === 0) {
          continue;
        }

        const notificationData: NotificationData = {
          expiredItems,
          expiringItems,
          userEmail: user.email,
          userName: user.email.split('@')[0] // Use email prefix as name
        };

        try {
          await this.sendNotification(notificationData, smtpSettings);
          
          // Update last notification sent
          await db.run(`
            UPDATE users 
            SET last_notification_sent = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [user.id]);
          
          console.log(`Notification sent to ${user.email}`);
        } catch (error) {
          console.error(`Failed to send notification to ${user.email}:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking and sending notifications:', error);
    }
  }

  private shouldSendNotification(user: any): boolean {
    const now = new Date();
    const lastSent = user.last_notification_sent ? new Date(user.last_notification_sent) : null;

    if (!lastSent) {
      return true; // Never sent before
    }

    const timeSinceLastSent = now.getTime() - lastSent.getTime();
    const hoursHours = timeSinceLastSent / (1000 * 60 * 60);

    if (user.notification_frequency === 'daily' && hoursHours >= 24) {
      return true;
    }

    if (user.notification_frequency === 'weekly' && hoursHours >= (24 * 7)) {
      return true;
    }

    return false;
  }

  public initializeCronJobs(): void {
    // Daily check at 9 AM
    const dailyJob = cron.schedule('0 9 * * *', () => {
      console.log('Running daily notification check...');
      this.checkAndSendNotifications();
    }, {
      scheduled: false
    });

    // Weekly check on Mondays at 9 AM
    const weeklyJob = cron.schedule('0 9 * * 1', () => {
      console.log('Running weekly notification check...');
      this.checkAndSendNotifications();
    }, {
      scheduled: false
    });

    this.cronJobs.set('daily', dailyJob);
    this.cronJobs.set('weekly', weeklyJob);

    // Start the cron jobs
    dailyJob.start();
    weeklyJob.start();

    console.log('Email notification cron jobs initialized');
  }

  public stopCronJobs(): void {
    this.cronJobs.forEach((job) => {
      job.stop();
    });
    this.cronJobs.clear();
  }
}

export default EmailService; 