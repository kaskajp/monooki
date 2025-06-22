import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('app-navbar')
export class AppNavbar extends LitElement {
  @property({ type: Object })
  currentUser: any = null;

  @state()
  private currentPath = window.location.pathname;

  @state()
  private userProfile: any = null;

  static styles = css`
    :host {
      display: block;
      width: 240px;
      height: 100vh;
      background: var(--color-bg-secondary);
      border-right: 1px solid var(--color-border-primary);
      overflow-y: auto;
      color-scheme: dark;
      position: fixed;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: var(--spacing-lg) 0 0 0;
      box-sizing: border-box;
    }

    .nav-section {
      margin-bottom: var(--spacing-xl);
    }

    .nav-section-title {
      padding: 0 var(--spacing-xl);
      margin-bottom: var(--spacing-sm);
      font-size: 11px;
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
      color: var(--color-text-secondary);
      letter-spacing: 0.5px;
    }

    .nav-links {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      color: var(--color-text-primary);
      text-decoration: none;
      padding: var(--spacing-sm) var(--spacing-xl);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      transition: all var(--transition-normal);
      border-left: 3px solid transparent;
    }

    .nav-link:hover {
      background: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }

    .nav-link.active {
      background: var(--color-bg-primary);
      color: var(--color-accent-primary);
      border-left-color: var(--color-accent-primary);
    }

    .nav-link .icon {
      width: 16px;
      height: 16px;
      opacity: 0.8;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-link.active .icon {
      opacity: 1;
    }

    .user-section {
      margin-top: auto;
      padding: var(--spacing-lg) 0;
      border-top: 1px solid var(--color-border-primary);
    }

    .user-info {
      padding: var(--spacing-md) var(--spacing-xl);
      margin-bottom: var(--spacing-lg);
      cursor: pointer;
      transition: all var(--transition-normal);
      border-left: 3px solid transparent;
      border-radius: 0;
    }

    .user-info:hover {
      background: var(--color-bg-tertiary);
    }

    .user-info.active {
      background: var(--color-bg-primary);
      color: var(--color-accent-primary);
      border-left-color: var(--color-accent-primary);
    }

    .user-info.active .user-email,
    .user-info.active .user-workspace {
      color: var(--color-accent-primary);
    }

    .user-email {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .user-workspace {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      background: none;
      border: none;
      color: var(--color-text-primary);
      padding: var(--spacing-sm) var(--spacing-xl);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all var(--transition-normal);
      font-family: var(--font-family-primary);
    }

    .logout-btn:hover {
      background: var(--color-bg-tertiary);
    }

    .logout-btn .icon {
      width: 16px;
      height: 16px;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      :host {
        width: 100%;
        height: auto;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      :host(.mobile-open) {
        transform: translateX(0);
      }

      .sidebar {
        height: 100vh;
      }
    }
  `;

  private pathCheckInterval?: number;

  connectedCallback() {
    super.connectedCallback();
    this.updateCurrentPath();
    
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', this.handlePopState);
    
    // Listen for workspace updates
    window.addEventListener('workspace-updated', this.handleWorkspaceUpdate);
    
    // Start checking for path changes periodically
    this.startPathMonitoring();
    
    // Load user profile
    this.loadUserProfile();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('workspace-updated', this.handleWorkspaceUpdate);
    this.stopPathMonitoring();
  }

  private startPathMonitoring() {
    // Check for path changes every 100ms
    this.pathCheckInterval = window.setInterval(() => {
      const newPath = window.location.pathname;
      if (newPath !== this.currentPath) {
        this.updateCurrentPath();
      }
    }, 100);
  }

  private stopPathMonitoring() {
    if (this.pathCheckInterval) {
      clearInterval(this.pathCheckInterval);
      this.pathCheckInterval = undefined;
    }
  }

  private handlePopState = () => {
    this.updateCurrentPath();
  }

  private updateCurrentPath() {
    this.currentPath = window.location.pathname;
  }

  private getCurrentPath() {
    return this.currentPath;
  }

  private isActive(path: string) {
    const currentPath = this.getCurrentPath();
    return currentPath === path || (path !== '/' && currentPath.startsWith(path));
  }

  private handleLogout() {
    this.dispatchEvent(new CustomEvent('logout'));
  }

  private handleProfileClick() {
    window.history.pushState({}, '', '/profile');
    window.dispatchEvent(new PopStateEvent('popstate'));
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

  private handleWorkspaceUpdate = (event: any) => {
    if (this.userProfile) {
      this.userProfile = {
        ...this.userProfile,
        workspaceName: event.detail.workspaceName
      };
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <div class="sidebar">
        <div class="nav-section">
          <ul class="nav-links">
            <li>
              <a href="/" class="nav-link ${this.isActive('/') && this.getCurrentPath() === '/' ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 metrics</title><g stroke-miterlimit="10" fill="#FFFFFF" class="nc-icon-wrapper"><line fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" x1="9.5" y1="6.5" x2="11.692" y2="4.308"></line> <circle data-color="color-2" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" cx="2.5" cy="13.5" r="2"></circle> <line data-color="color-2" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" x1="6.5" y1="9.5" x2="3.914" y2="12.086"></line> <path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" d="M2.5,3.5v-3 c7.18,0,13,5.82,13,13h-3"></path> </g></svg>
                Dashboard
              </a>
            </li>
            <li>
              <a href="/items" class="nav-link ${this.isActive('/items') ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 file copies</title><g stroke-miterlimit="10" fill="#FFFFFF" class="nc-icon-wrapper"><rect x="2.5" y="4.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" width="9" height="11"></rect> <polyline fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" points="4.5,2.5 13.5,2.5 13.5,13.5 " data-color="color-2"></polyline> <polyline fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" points="7.5,0.5 15.5,0.5 15.5,10.5 " data-color="color-2"></polyline></g></svg>
                Items
              </a>
            </li>
            <li>
              <a href="/locations" class="nav-link ${this.isActive('/locations') ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 position marker</title><g fill="#FFFFFF" class="nc-icon-wrapper"><line x1="8.5" y1="12.5" x2="8.5" y2="8.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line> <circle cx="8.5" cy="4.5" r="4" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></circle> <path d="M11,11.681c2.066.316,3.5,1.012,3.5,1.819,0,1.105-2.686,2-6,2s-6-.895-6-2c0-.807,1.434-1.5,3.5-1.819" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" data-color="color-2"></path></g></svg>
                Locations
              </a>
            </li>
            <li>
              <a href="/categories" class="nav-link ${this.isActive('/categories') ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 tag cut</title><g stroke-miterlimit="10" fill="#FFFFFF" class="nc-icon-wrapper"><polygon fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" points="3.5,0.5 8.5,1.5 15.5,8.5 8.5,15.5 1.5,8.5 0.5,3.5 " data-cap="butt"></polygon> <circle fill="#FFFFFF" cx="5" cy="5" r="1" data-color="color-2" data-stroke="none"></circle></g></svg>
                Categories
              </a>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Manage</div>
          <ul class="nav-links">
            <li>
              <a href="/settings" class="nav-link ${this.isActive('/settings') ? 'active' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 settings wheel</title><g fill="#FFFFFF" class="nc-icon-wrapper"><line x1="5.25" y1="3.236" x2="8" y2="8" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" data-color="color-2"></line><line x1="5.25" y1="12.764" x2="8" y2="8" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" data-color="color-2"></line><line x1="13.5" y1="8" x2="8" y2="8" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" data-color="color-2"></line><circle cx="8" cy="8" r="5.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></circle><line x1="8" y1=".5" x2="8" y2="2.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><line x1="4.25" y1="1.505" x2="5.25" y2="3.236" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><line x1="1.505" y1="4.25" x2="3.237" y2="5.25" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><line x1=".5" y1="8" x2="2.5" y2="8" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><line x1="1.505" y1="11.75" x2="3.237" y2="10.75" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><line x1="4.25" y1="14.495" x2="5.25" y2="12.764" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><line x1="8" y1="15.5" x2="8" y2="13.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><line x1="11.75" y1="14.495" x2="10.75" y2="12.763" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><line x1="14.495" y1="11.75" x2="12.763" y2="10.75" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><line x1="15.5" y1="8" x2="13.5" y2="8" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><line x1="14.495" y1="4.25" x2="12.763" y2="5.25" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><line x1="11.75" y1="1.505" x2="10.75" y2="3.237" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line></g></svg>
                Settings
              </a>
            </li>
          </ul>
        </div>

        <div class="user-section">
          <div class="user-info ${this.isActive('/profile') ? 'active' : ''}" @click="${this.handleProfileClick}">
            <div class="user-email">${this.userProfile?.email || 'user@monooki.app'}</div>
            <div class="user-workspace">${this.userProfile?.workspaceName || 'Personal Workspace'}</div>
          </div>
          <button class="logout-btn" @click="${this.handleLogout}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 log out</title><g fill="#FFFFFF" class="nc-icon-wrapper"><path d="M6.5,4.5V2A1.5,1.5,0,0,1,8,.5h6A1.5,1.5,0,0,1,15.5,2V14A1.5,1.5,0,0,1,14,15.5H8A1.5,1.5,0,0,1,6.5,14V11.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></path><line data-color="color-2" x1="11.5" y1="8" x2="0.5" y2="8" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><polyline data-color="color-2" points="3.5 5 0.5 8 3.5 11" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></polyline></g></svg>
            Sign out
          </button>
        </div>
      </div>
    `;
  }
} 