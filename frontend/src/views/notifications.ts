import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('notifications-page')
export class NotificationsPage extends LitElement {
  @state()
  private smtpSettings = {
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    from_email: '',
    from_name: ''
  };

  @state()
  private isLoading = false;

  @state()
  private message = '';

  @state()
  private messageType: 'success' | 'error' | '' = '';

  @state()
  private isConfigured = false;

  static styles = css`
    :host {
      display: block;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 32px;
      font-weight: 600;
      color: #f0f6fc;
    }

    .page-header p {
      margin: 0;
      color: #8b949e;
      font-size: 16px;
    }

    .form-section {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .form-section h2 {
      margin: 0 0 1rem 0;
      font-size: 20px;
      font-weight: 600;
      color: #f0f6fc;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #f0f6fc;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #30363d;
      border-radius: 6px;
      background: #0d1117;
      color: #f0f6fc;
      font-size: 14px;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--color-accent-primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--color-accent-primary-hover, var(--color-accent-primary));
      opacity: 0.9;
    }

    .btn-secondary {
      background: var(--color-bg-secondary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border-primary);
    }

    .btn-secondary:hover {
      background: var(--color-bg-tertiary);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .message {
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 14px;
    }

    .message.success {
      background: #0f5132;
      color: #75b798;
      border: 1px solid #2d5a3d;
    }

    .message.error {
      background: #58151c;
      color: #f47068;
      border: 1px solid #da3633;
    }

    .help-text {
      font-size: 12px;
      color: #8b949e;
      margin-top: 0.5rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      margin-left: 1rem;
    }

    .status-badge.configured {
      background: #0f5132;
      color: #75b798;
    }

    .status-badge.not-configured {
      background: #58151c;
      color: #f47068;
    }

    .smtp-guide {
      margin-bottom: 2rem;
    }

    .smtp-guide h3 {
      margin: 0 0 0.5rem 0;
      font-size: 20px;
      font-weight: 600;
      color: #f0f6fc;
    }

    .provider-examples {
      display: flex;
      gap: 1rem;
    }

    .provider-example {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 0.75rem;
      flex: 1;
    }

    .provider-example strong {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #f0f6fc;
    }



    @media (max-width: 768px) {
      :host {
        padding: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .button-group {
        flex-direction: column;
      }

      .provider-examples {
        flex-direction: column;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadSmtpSettings();
  }

  private async loadSmtpSettings() {
    try {
      this.isLoading = true;
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/notifications/smtp-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const settings = await response.json();
        this.smtpSettings = {
          ...settings,
          secure: Boolean(settings.secure), // Convert to boolean (SQLite returns 1/0)
          password: '' // Don't populate password for security
        };
        this.isConfigured = true;
      } else if (response.status === 404) {
        this.isConfigured = false;
      } else {
        throw new Error('Failed to load SMTP settings');
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
      this.showMessage('Failed to load SMTP settings', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  private async saveSmtpSettings() {
    try {
      this.isLoading = true;
      const token = localStorage.getItem('token');
      
      // Only send the fields that are part of the SMTP configuration schema
      const settingsToSave = {
        host: this.smtpSettings.host,
        port: this.smtpSettings.port,
        secure: Boolean(this.smtpSettings.secure),
        username: this.smtpSettings.username,
        password: this.smtpSettings.password,
        from_email: this.smtpSettings.from_email,
        from_name: this.smtpSettings.from_name
      };
      
      const response = await fetch('/api/notifications/smtp-settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsToSave)
      });

      if (response.ok) {
        this.showMessage('SMTP settings saved successfully!', 'success');
        this.isConfigured = true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save SMTP settings');
      }
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      this.showMessage(error instanceof Error ? error.message : 'Failed to save SMTP settings', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  private async testSmtp() {
    try {
      this.isLoading = true;
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/notifications/test-smtp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.showMessage('Test email sent successfully! Check your inbox.', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error testing SMTP:', error);
      this.showMessage(error instanceof Error ? error.message : 'Failed to send test email', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  private async triggerNotification() {
    try {
      this.isLoading = true;
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.expiredCount > 0 || result.expiringCount > 0) {
          this.showMessage(`Notification sent! Found ${result.expiredCount} expired and ${result.expiringCount} expiring items.`, 'success');
        } else {
          this.showMessage('No expired or expiring items found to notify about.', 'success');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to trigger notification');
      }
    } catch (error) {
      console.error('Error triggering notification:', error);
      this.showMessage(error instanceof Error ? error.message : 'Failed to trigger notification', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  private showMessage(message: string, type: 'success' | 'error') {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }

  private handleInputChange(field: string, value: string | number | boolean) {
    this.smtpSettings = {
      ...this.smtpSettings,
      [field]: value
    };
    
    // Auto-fill username with from_email if username is empty
    if (field === 'from_email' && typeof value === 'string' && !this.smtpSettings.username) {
      this.smtpSettings = {
        ...this.smtpSettings,
        username: value
      };
    }
  }

  render() {
    return html`
      <div class="page-header">
        <h1>
          Email Notifications
          <span class="status-badge ${this.isConfigured ? 'configured' : 'not-configured'}">
            ${this.isConfigured ? 'Configured' : 'Not Configured'}
          </span>
        </h1>
        <p>Configure SMTP settings to enable email notifications for expired and expiring items</p>
      </div>

      ${this.message ? html`
        <div class="message ${this.messageType}">
          ${this.message}
        </div>
      ` : ''}

      <div class="form-section">
        <h2>SMTP Configuration</h2>
        
        <div class="smtp-guide">
          <h3>Common SMTP Settings</h3>
          <div class="provider-examples">
            <div class="provider-example">
              <strong>Gmail:</strong> smtp.gmail.com, Port 587 (STARTTLS) or Port 465 (SSL/TLS)
            </div>
            <div class="provider-example">
              <strong>Outlook/Hotmail:</strong> smtp-mail.outlook.com, Port 587 (STARTTLS)
            </div>
            <div class="provider-example">
              <strong>Yahoo:</strong> smtp.mail.yahoo.com, Port 587 (STARTTLS)
            </div>
          </div>
        </div>


        
        <form @submit=${(e: Event) => { e.preventDefault(); this.saveSmtpSettings(); }}>
          <div class="form-group">
            <label for="host">SMTP Host</label>
            <input
              type="text"
              id="host"
              .value=${this.smtpSettings.host}
              @input=${(e: Event) => this.handleInputChange('host', (e.target as HTMLInputElement).value)}
              placeholder="smtp.gmail.com"
              required
            />
            <div class="help-text">Your email provider's SMTP server address</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="port">Port</label>
              <select
                id="port"
                .value=${this.smtpSettings.port.toString()}
                @change=${(e: Event) => {
                  const port = parseInt((e.target as HTMLSelectElement).value);
                  this.handleInputChange('port', port);
                  // Auto-set security based on common port conventions
                  if (port === 465) {
                    this.handleInputChange('secure', true);
                  } else if (port === 587 || port === 25) {
                    this.handleInputChange('secure', false);
                  }
                }}
              >
                <option value="587">587 (STARTTLS - Recommended)</option>
                <option value="465">465 (SSL/TLS)</option>
                <option value="25">25 (Plain/STARTTLS)</option>
                <option value="2525">2525 (Alternative)</option>
              </select>
              <div class="help-text">587 is recommended for most providers</div>
            </div>

            <div class="form-group">
              <div class="checkbox-group">
                <input
                  type="checkbox"
                  id="secure"
                  .checked=${this.smtpSettings.secure}
                  @change=${(e: Event) => this.handleInputChange('secure', (e.target as HTMLInputElement).checked)}
                />
                <label for="secure">Use SSL/TLS</label>
              </div>
              <div class="help-text">
                ${this.smtpSettings.port === 465 ? 'SSL/TLS (recommended for port 465)' : 
                  this.smtpSettings.port === 587 ? 'STARTTLS (recommended for port 587)' : 
                  'Choose based on your provider requirements'}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              .value=${this.smtpSettings.username}
              @input=${(e: Event) => this.handleInputChange('username', (e.target as HTMLInputElement).value)}
              placeholder="your-email@gmail.com"
              required
            />
            <div class="help-text">Use your full email address (e.g., user@gmail.com) for most providers</div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              .value=${this.smtpSettings.password}
              @input=${(e: Event) => this.handleInputChange('password', (e.target as HTMLInputElement).value)}
              placeholder=${this.isConfigured ? 'Leave empty to keep current password' : 'Your email password or app password'}
              ?required=${!this.isConfigured}
            />
            <div class="help-text">
              ${this.isConfigured ? 'Leave empty to keep current password' : 'For Gmail/Outlook: Use App Password (not your regular password) when 2FA is enabled'}
            </div>
          </div>

          <div class="form-group">
            <label for="from_email">From Email</label>
            <input
              type="email"
              id="from_email"
              .value=${this.smtpSettings.from_email}
              @input=${(e: Event) => this.handleInputChange('from_email', (e.target as HTMLInputElement).value)}
              placeholder="notifications@yourdomain.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="from_name">From Name</label>
            <input
              type="text"
              id="from_name"
              .value=${this.smtpSettings.from_name}
              @input=${(e: Event) => this.handleInputChange('from_name', (e.target as HTMLInputElement).value)}
              placeholder="Monooki Notifications"
              required
            />
          </div>

          <div class="button-group">
            <button type="submit" class="btn btn-primary" ?disabled=${this.isLoading}>
              ${this.isLoading ? 'Saving...' : 'Save Settings'}
            </button>
            
            ${this.isConfigured ? html`
              <button type="button" class="btn btn-secondary" @click=${this.testSmtp} ?disabled=${this.isLoading}>
                ${this.isLoading ? 'Testing...' : 'Send Test Email'}
              </button>
              
              <button type="button" class="btn btn-secondary" @click=${this.triggerNotification} ?disabled=${this.isLoading}>
                ${this.isLoading ? 'Sending...' : 'Test Notification'}
              </button>
            ` : ''}
          </div>
          
          ${this.isConfigured ? html`
            <div class="help-text" style="margin-top: 1rem;">
              <strong>Send Test Email:</strong> Sends a basic SMTP test email to verify your configuration.<br>
              <strong>Test Notification:</strong> Triggers a real notification email with your current expired/expiring items (requires notification preferences enabled).
            </div>
          ` : ''}
        </form>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'notifications-page': NotificationsPage;
  }
} 