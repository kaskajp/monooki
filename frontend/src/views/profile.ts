import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../components/button.js';

@customElement('profile-page')
export class ProfilePage extends LitElement {
  @state()
  private loading = false;

  @state()
  private formData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  @state()
  private userProfile: any = null;

  @state()
  private notificationPreferences = {
    notification_frequency: 'none',
    last_notification_sent: null
  };

  @state()
  private smtpConfigured = false;

  @state()
  private loadingNotifications = false;

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-2xl);
      background: var(--color-bg-primary);
      color: var(--color-text-primary);
      min-height: 100vh;
      color-scheme: dark;
    }

    .header {
      margin-bottom: var(--spacing-2xl);
    }

    .header h1 {
      margin: 0;
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .profile-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .profile-section {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      padding: var(--spacing-2xl);
      margin-bottom: var(--spacing-xl);
    }

    .section-title {
      margin: 0 0 var(--spacing-xl) 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .section-title .icon {
      width: 20px;
      height: 20px;
      opacity: 0.8;
    }

    .form-group {
      margin-bottom: var(--spacing-xl);
    }

    .form-group label {
      display: block;
      margin-bottom: var(--spacing-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
    }

    .form-group input {
      width: 100%;
      padding: var(--spacing-md);
      background: var(--form-bg);
      border: 1px solid var(--form-border);
      border-radius: var(--radius-md);
      box-sizing: border-box;
      color: var(--form-text);
      font-size: var(--font-size-sm);
      transition: all var(--transition-normal);
      font-family: var(--font-family-primary);
    }

    .form-group input::placeholder {
      color: var(--form-placeholder);
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--form-border-focus);
      box-shadow: var(--shadow-focus);
    }

    .form-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-xl);
      border-top: 1px solid var(--color-border-primary);
    }

    .user-info-display {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);
      background: var(--color-bg-tertiary);
      border-radius: var(--radius-md);
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
    }

    .info-value {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);
    }

    .success-message {
      background: var(--color-success-bg);
      color: var(--color-success-text);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-xl);
      font-size: var(--font-size-sm);
      border: 1px solid var(--color-success-border);
    }

    .error-message {
      background: var(--color-danger-bg);
      color: var(--color-danger-text);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-xl);
      font-size: var(--font-size-sm);
      border: 1px solid var(--color-danger-border);
    }

    .password-requirements {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-top: var(--spacing-sm);
      line-height: 1.4;
    }

    .notification-option {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-normal);
    }

    .notification-option:hover {
      background: var(--color-bg-tertiary);
    }

    .notification-option.selected {
      border-color: var(--color-accent-primary);
      background: var(--color-bg-tertiary);
    }

    .notification-option input[type="radio"] {
      margin: 0;
      width: auto;
    }

    .notification-option-content {
      flex: 1;
    }

    .notification-option-title {
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .notification-option-description {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
    }

    .smtp-warning {
      background: var(--color-warning-bg);
      color: var(--color-warning-text);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);
      font-size: var(--font-size-sm);
      border: 1px solid var(--color-warning-border);
    }

    .smtp-warning a {
      color: var(--color-accent-primary);
      text-decoration: none;
    }

    .smtp-warning a:hover {
      text-decoration: underline;
    }

    .disabled-option {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .disabled-option:hover {
      background: transparent;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadUserProfile();
    this.loadNotificationPreferences();
    this.checkSmtpStatus();
  }

  private async loadUserProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.userProfile = await response.json();
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  private async loadNotificationPreferences() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.notificationPreferences = await response.json();
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  private async checkSmtpStatus() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/notifications/smtp-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.smtpConfigured = data.configured;
      }
    } catch (error) {
      console.error('Error checking SMTP status:', error);
    }
  }

  private async handlePasswordUpdate(e: Event) {
    e.preventDefault();
    
    if (!this.formData.currentPassword || !this.formData.newPassword || !this.formData.confirmPassword) {
      this.showErrorMessage('Please fill in all password fields');
      return;
    }

    if (this.formData.newPassword !== this.formData.confirmPassword) {
      this.showErrorMessage('New passwords do not match');
      return;
    }

    if (this.formData.newPassword.length < 8) {
      this.showErrorMessage('New password must be at least 8 characters long');
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: this.formData.currentPassword,
          newPassword: this.formData.newPassword
        })
      });

      if (response.ok) {
        this.formData = {
          ...this.formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.showSuccessMessage('Password updated successfully!');
      } else {
        const error = await response.json();
        this.showErrorMessage(error.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      this.showErrorMessage('An error occurred while updating password');
    } finally {
      this.loading = false;
    }
  }

  private async updateNotificationPreferences(frequency: string) {
    try {
      this.loadingNotifications = true;
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notification_frequency: frequency
        })
      });

      if (response.ok) {
        this.notificationPreferences = {
          ...this.notificationPreferences,
          notification_frequency: frequency
        };
        this.showSuccessMessage('Notification preferences updated successfully!');
      } else {
        const error = await response.json();
        this.showErrorMessage(error.error || 'Failed to update notification preferences');
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      this.showErrorMessage('An error occurred while updating notification preferences');
    } finally {
      this.loadingNotifications = false;
    }
  }

  private showSuccessMessage(message: string) {
    // Simple implementation - in a real app you might want a more sophisticated notification system
    const successDiv = this.shadowRoot?.querySelector('.success-message') as HTMLElement;
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'block';
      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 5000);
    }
  }

  private showErrorMessage(message: string) {
    // Simple implementation - in a real app you might want a more sophisticated notification system
    const errorDiv = this.shadowRoot?.querySelector('.error-message') as HTMLElement;
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }

  render() {
    return html`
      <div class="header">
        <h1>Profile Settings</h1>
      </div>

      <div class="profile-container">
        <div class="success-message" style="display: none;"></div>
        <div class="error-message" style="display: none;"></div>

        <!-- User Information Section -->
        <div class="profile-section">
          <h2 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" class="icon">
              <circle cx="8" cy="5" r="3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2,13c0-3.866,2.686-7,6-7s6,3.134,6,7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Account Information
          </h2>
          
          <div class="user-info-display">
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">${this.userProfile?.email || 'Loading...'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Account Type</span>
              <span class="info-value">${this.userProfile?.role === 'admin' ? 'Administrator' : 'User'}</span>
            </div>
          </div>
        </div>

        <!-- Password Settings Section -->
        <div class="profile-section">
          <h2 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" class="icon">
              <rect x="3" y="7" width="10" height="7" rx="1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6,7V5a2,2,0,0,1,4,0V7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Password & Security
          </h2>
          
          <form @submit="${this.handlePasswordUpdate}">
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                .value="${this.formData.currentPassword}"
                @input="${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.formData = { ...this.formData, currentPassword: target.value };
                }}"
                placeholder="Enter current password"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                .value="${this.formData.newPassword}"
                @input="${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.formData = { ...this.formData, newPassword: target.value };
                }}"
                placeholder="Enter new password"
                required
              />
              <div class="password-requirements">
                Password must be at least 8 characters long
              </div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                .value="${this.formData.confirmPassword}"
                @input="${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.formData = { ...this.formData, confirmPassword: target.value };
                }}"
                placeholder="Confirm new password"
                required
              />
            </div>
            
            <div class="form-actions">
              <app-button type="submit" variant="primary" ?loading="${this.loading}">
                Update Password
              </app-button>
            </div>
          </form>
        </div>

        <!-- Notification Settings Section -->
        <div class="profile-section">
          <h2 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" class="icon">
              <path d="M8 2a3 3 0 0 1 3 3v2.5l1.5 1.5v1H3.5v-1L5 7.5V5a3 3 0 0 1 3-3z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Email Notifications
          </h2>

          ${!this.smtpConfigured ? html`
            <div class="smtp-warning">
              <strong>Email notifications are not available.</strong><br>
              SMTP settings must be configured first. 
              <a href="/notifications">Configure SMTP settings</a> to enable email notifications.
            </div>
          ` : ''}

          <div class="form-group">
            <label>Notification Frequency</label>
            
            <div class="notification-option ${this.notificationPreferences.notification_frequency === 'none' ? 'selected' : ''}" @click=${() => !this.loadingNotifications && this.updateNotificationPreferences('none')}>
              <input
                type="radio"
                name="notification_frequency"
                value="none"
                .checked=${this.notificationPreferences.notification_frequency === 'none'}
                @change=${() => this.updateNotificationPreferences('none')}
                ?disabled=${this.loadingNotifications}
              />
              <div class="notification-option-content">
                <div class="notification-option-title">No Notifications</div>
                <div class="notification-option-description">
                  You will not receive any email notifications about expired or expiring items.
                </div>
              </div>
            </div>

            <div class="notification-option ${this.notificationPreferences.notification_frequency === 'daily' ? 'selected' : ''} ${!this.smtpConfigured ? 'disabled-option' : ''}" @click=${() => !this.loadingNotifications && this.smtpConfigured && this.updateNotificationPreferences('daily')}>
              <input
                type="radio"
                name="notification_frequency"
                value="daily"
                .checked=${this.notificationPreferences.notification_frequency === 'daily'}
                @change=${() => this.updateNotificationPreferences('daily')}
                ?disabled=${this.loadingNotifications || !this.smtpConfigured}
              />
              <div class="notification-option-content">
                <div class="notification-option-title">Daily Notifications</div>
                <div class="notification-option-description">
                  Receive daily email summaries of expired and expiring items (sent at 9 AM).
                </div>
              </div>
            </div>

            <div class="notification-option ${this.notificationPreferences.notification_frequency === 'weekly' ? 'selected' : ''} ${!this.smtpConfigured ? 'disabled-option' : ''}" @click=${() => !this.loadingNotifications && this.smtpConfigured && this.updateNotificationPreferences('weekly')}>
              <input
                type="radio"
                name="notification_frequency"
                value="weekly"
                .checked=${this.notificationPreferences.notification_frequency === 'weekly'}
                @change=${() => this.updateNotificationPreferences('weekly')}
                ?disabled=${this.loadingNotifications || !this.smtpConfigured}
              />
              <div class="notification-option-content">
                <div class="notification-option-title">Weekly Notifications</div>
                <div class="notification-option-description">
                  Receive weekly email summaries of expired and expiring items (sent on Mondays at 9 AM).
                </div>
              </div>
            </div>

            ${this.notificationPreferences.last_notification_sent ? html`
              <div class="info-item" style="margin-top: var(--spacing-lg);">
                <span class="info-label">Last notification sent</span>
                <span class="info-value">
                  ${new Date(this.notificationPreferences.last_notification_sent).toLocaleString()}
                </span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
} 