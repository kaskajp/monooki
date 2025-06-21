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
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadUserProfile();
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
      </div>
    `;
  }
} 