import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../components/button.js';

@customElement('settings-page')
export class SettingsPage extends LitElement {
  @state()
  private currentUser: any = null;
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

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 400px));
      gap: var(--spacing-xl);
      margin-top: var(--spacing-2xl);
      justify-content: start;
    }

    .settings-card {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      padding: var(--spacing-2xl);
      transition: all var(--transition-normal);
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      display: block;
      max-width: 400px;
    }

    .settings-card:hover {
      background: var(--color-bg-tertiary);
      border-color: var(--color-accent-primary);
      transform: translateY(-2px);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      background: var(--color-accent-primary);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--spacing-lg);
    }

    .card-icon svg {
      width: 24px;
      height: 24px;
      color: white;
    }

    .card-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .card-description {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: var(--line-height-relaxed);
    }

    .card-badge {
      display: inline-flex;
      align-items: center;
      background: var(--color-bg-tertiary);
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
      margin-top: var(--spacing-md);
    }

    .badge-admin {
      background: var(--color-accent-primary);
      color: white;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadCurrentUser();
  }

  private async loadCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.currentUser = await response.json();
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  }

  private get isCurrentUserAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  private navigateToPage(path: string) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  render() {
    return html`
      <div class="header">
        <h1>Settings</h1>
      </div>

      <div class="settings-grid">
        <a href="/profile" class="settings-card" @click="${(e: Event) => {
          e.preventDefault();
          this.navigateToPage('/profile');
        }}">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
              <circle cx="8" cy="5" r="3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2,13c0-3.866,2.686-7,6-7s6,3.134,6,7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="card-title">Profile Settings</h3>
          <p class="card-description">
            Manage your personal information, account details, and password settings.
          </p>
        </a>

        ${this.isCurrentUserAdmin ? html`
          <a href="/account-settings" class="settings-card" @click="${(e: Event) => {
            e.preventDefault();
            this.navigateToPage('/account-settings');
          }}">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
                <rect x="2" y="3" width="12" height="10" rx="2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 7h2" stroke="currentColor" stroke-linecap="round"/>
              </svg>
            </div>
            <h3 class="card-title">Account Settings</h3>
            <p class="card-description">
              Configure workspace settings, currency preferences, label formats, and account options.
            </p>
          </a>

          <a href="/custom-fields" class="settings-card" @click="${(e: Event) => {
            e.preventDefault();
            this.navigateToPage('/custom-fields');
          }}">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
                <rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 7h2v2H7z" fill="currentColor"/>
                <path d="M5 5h6M5 11h6" stroke="currentColor" stroke-linecap="round"/>
              </svg>
            </div>
            <h3 class="card-title">Custom Fields</h3>
            <p class="card-description">
              Create and manage custom fields to add additional information to your items.
            </p>
          </a>

          <a href="/user-management" class="settings-card" @click="${(e: Event) => {
            e.preventDefault();
            this.navigateToPage('/user-management');
          }}">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
                <circle cx="6" cy="4" r="2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2,12c0-2.209,1.791-4,4-4s4,1.791,4,4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8,15c0-1.657,1.343-3,3-3s3,1.343,3,3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="card-title">User Management</h3>
            <p class="card-description">
              Invite users to your workspace and manage user roles and permissions.
            </p>
            <div class="card-badge badge-admin">Admin Only</div>
          </a>
        ` : ''}
      </div>
    `;
  }
} 