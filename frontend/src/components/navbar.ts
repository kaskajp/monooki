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

    .nav-brand {
      padding: 0 var(--spacing-xl);
      margin-bottom: var(--spacing-2xl);
    }

    .nav-brand h1 {
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .nav-brand .logo {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, var(--color-accent-primary) 0%, var(--color-accent-secondary) 100%);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-xs);
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
      color: var(--color-danger);
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
        <div class="nav-brand">
        <?xml version="1.0" encoding="UTF-8" standalone="no"?>
          <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
          <svg width="100%" height="100%" viewBox="0 0 164 29" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;">
              <g transform="matrix(1,0,0,1,-309.841,-165.625)">
                  <g transform="matrix(1,0,0,1,247.023,0)">
                      <g transform="matrix(1,0,0,1,-17.0267,54.1344)">
                          <g transform="matrix(30,0,0,30,120.583,136.594)">
                              <path d="M0.073,-0L0.073,-0.7L0.276,-0.7L0.429,-0.072L0.445,-0.072L0.598,-0.7L0.801,-0.7L0.801,-0L0.696,-0L0.696,-0.624L0.68,-0.624L0.528,-0L0.346,-0L0.194,-0.624L0.178,-0.624L0.178,-0L0.073,-0Z" style="fill:white;fill-rule:nonzero;"/>
                          </g>
                          <g transform="matrix(30,0,0,30,146.803,136.594)">
                              <path d="M0.307,0.014C0.258,0.014 0.214,0.004 0.176,-0.017C0.137,-0.037 0.107,-0.066 0.085,-0.104C0.063,-0.142 0.052,-0.187 0.052,-0.239L0.052,-0.254C0.052,-0.306 0.063,-0.351 0.085,-0.389C0.107,-0.426 0.137,-0.455 0.176,-0.476C0.214,-0.497 0.258,-0.507 0.307,-0.507C0.356,-0.507 0.4,-0.497 0.439,-0.476C0.478,-0.455 0.508,-0.426 0.53,-0.389C0.552,-0.351 0.563,-0.306 0.563,-0.254L0.563,-0.239C0.563,-0.187 0.552,-0.142 0.53,-0.104C0.508,-0.066 0.478,-0.037 0.439,-0.017C0.4,0.004 0.356,0.014 0.307,0.014ZM0.307,-0.078C0.352,-0.078 0.389,-0.092 0.418,-0.122C0.446,-0.151 0.46,-0.191 0.46,-0.242L0.46,-0.251C0.46,-0.302 0.446,-0.343 0.418,-0.372C0.39,-0.401 0.353,-0.415 0.307,-0.415C0.262,-0.415 0.226,-0.401 0.198,-0.372C0.169,-0.343 0.155,-0.302 0.155,-0.251L0.155,-0.242C0.155,-0.191 0.169,-0.151 0.198,-0.122C0.226,-0.092 0.262,-0.078 0.307,-0.078Z" style="fill:white;fill-rule:nonzero;"/>
                          </g>
                          <g transform="matrix(30,0,0,30,165.253,136.594)">
                              <path d="M0.076,-0L0.076,-0.493L0.177,-0.493L0.177,-0.419L0.193,-0.419C0.202,-0.439 0.219,-0.458 0.243,-0.475C0.267,-0.492 0.303,-0.501 0.35,-0.501C0.387,-0.501 0.421,-0.493 0.45,-0.476C0.478,-0.459 0.501,-0.436 0.518,-0.406C0.535,-0.375 0.543,-0.339 0.543,-0.296L0.543,-0L0.44,-0L0.44,-0.288C0.44,-0.331 0.429,-0.362 0.408,-0.383C0.387,-0.403 0.357,-0.413 0.32,-0.413C0.277,-0.413 0.243,-0.399 0.218,-0.371C0.192,-0.343 0.179,-0.302 0.179,-0.249L0.179,-0L0.076,-0Z" style="fill:white;fill-rule:nonzero;"/>
                          </g>
                          <g transform="matrix(30,0,0,30,183.703,136.594)">
                              <path d="M0.307,0.014C0.258,0.014 0.214,0.004 0.176,-0.017C0.137,-0.037 0.107,-0.066 0.085,-0.104C0.063,-0.142 0.052,-0.187 0.052,-0.239L0.052,-0.254C0.052,-0.306 0.063,-0.351 0.085,-0.389C0.107,-0.426 0.137,-0.455 0.176,-0.476C0.214,-0.497 0.258,-0.507 0.307,-0.507C0.356,-0.507 0.4,-0.497 0.439,-0.476C0.478,-0.455 0.508,-0.426 0.53,-0.389C0.552,-0.351 0.563,-0.306 0.563,-0.254L0.563,-0.239C0.563,-0.187 0.552,-0.142 0.53,-0.104C0.508,-0.066 0.478,-0.037 0.439,-0.017C0.4,0.004 0.356,0.014 0.307,0.014ZM0.307,-0.078C0.352,-0.078 0.389,-0.092 0.418,-0.122C0.446,-0.151 0.46,-0.191 0.46,-0.242L0.46,-0.251C0.46,-0.302 0.446,-0.343 0.418,-0.372C0.39,-0.401 0.353,-0.415 0.307,-0.415C0.262,-0.415 0.226,-0.401 0.198,-0.372C0.169,-0.343 0.155,-0.302 0.155,-0.251L0.155,-0.242C0.155,-0.191 0.169,-0.151 0.198,-0.122C0.226,-0.092 0.262,-0.078 0.307,-0.078Z" style="fill:white;fill-rule:nonzero;"/>
                          </g>
                          <g transform="matrix(30,0,0,30,202.153,136.594)">
                              <path d="M0.307,0.014C0.258,0.014 0.214,0.004 0.176,-0.017C0.137,-0.037 0.107,-0.066 0.085,-0.104C0.063,-0.142 0.052,-0.187 0.052,-0.239L0.052,-0.254C0.052,-0.306 0.063,-0.351 0.085,-0.389C0.107,-0.426 0.137,-0.455 0.176,-0.476C0.214,-0.497 0.258,-0.507 0.307,-0.507C0.356,-0.507 0.4,-0.497 0.439,-0.476C0.478,-0.455 0.508,-0.426 0.53,-0.389C0.552,-0.351 0.563,-0.306 0.563,-0.254L0.563,-0.239C0.563,-0.187 0.552,-0.142 0.53,-0.104C0.508,-0.066 0.478,-0.037 0.439,-0.017C0.4,0.004 0.356,0.014 0.307,0.014ZM0.307,-0.078C0.352,-0.078 0.389,-0.092 0.418,-0.122C0.446,-0.151 0.46,-0.191 0.46,-0.242L0.46,-0.251C0.46,-0.302 0.446,-0.343 0.418,-0.372C0.39,-0.401 0.353,-0.415 0.307,-0.415C0.262,-0.415 0.226,-0.401 0.198,-0.372C0.169,-0.343 0.155,-0.302 0.155,-0.251L0.155,-0.242C0.155,-0.191 0.169,-0.151 0.198,-0.122C0.226,-0.092 0.262,-0.078 0.307,-0.078Z" style="fill:white;fill-rule:nonzero;"/>
                          </g>
                          <g transform="matrix(30,0,0,30,220.603,136.594)">
                              <path d="M0.076,-0L0.076,-0.7L0.179,-0.7L0.179,-0.301L0.195,-0.301L0.389,-0.493L0.526,-0.493L0.277,-0.254L0.534,-0L0.398,-0L0.195,-0.205L0.179,-0.205L0.179,-0L0.076,-0Z" style="fill:white;fill-rule:nonzero;"/>
                          </g>
                          <g transform="matrix(30,0,0,30,237.133,136.594)">
                              <path d="M0.076,-0L0.076,-0.493L0.179,-0.493L0.179,-0L0.076,-0ZM0.128,-0.56C0.108,-0.56 0.091,-0.567 0.078,-0.58C0.064,-0.592 0.057,-0.609 0.057,-0.63C0.057,-0.651 0.064,-0.668 0.078,-0.681C0.091,-0.694 0.108,-0.7 0.128,-0.7C0.149,-0.7 0.166,-0.694 0.179,-0.681C0.192,-0.668 0.199,-0.651 0.199,-0.63C0.199,-0.609 0.192,-0.592 0.179,-0.58C0.166,-0.567 0.149,-0.56 0.128,-0.56Z" style="fill:white;fill-rule:nonzero;"/>
                          </g>
                      </g>
                      <g transform="matrix(0.155952,0,0,0.156014,61.5323,164.318)">
                          <path d="M32.083,71.833C31.557,69.461 31.291,67.039 31.291,64.609C31.291,46.323 46.338,31.276 64.624,31.276C67.077,31.276 69.523,31.547 71.917,32.083C78.036,22.513 88.641,16.707 100,16.707C111.359,16.707 121.964,22.513 128.083,32.083C130.483,31.544 132.935,31.272 135.395,31.272C153.681,31.272 168.728,46.319 168.728,64.605C168.728,67.065 168.456,69.517 167.917,71.917C177.487,78.036 183.293,88.641 183.293,100C183.293,111.359 177.487,121.964 167.917,128.083C168.453,130.477 168.724,132.923 168.724,135.376C168.724,153.662 153.677,168.709 135.391,168.709C132.961,168.709 130.539,168.443 128.167,167.917C122.055,177.524 111.428,183.359 100.042,183.359C88.655,183.359 78.028,177.524 71.917,167.917C69.523,168.453 67.077,168.724 64.624,168.724C46.338,168.724 31.291,153.677 31.291,135.391C31.291,132.961 31.557,130.539 32.083,128.167C22.438,122.063 16.576,111.414 16.576,100C16.576,88.586 22.438,77.937 32.083,71.833Z" style="fill:none;fill-rule:nonzero;stroke:white;stroke-width:16.67px;"/>
                      </g>
                  </g>
              </g>
          </svg>
        </div>
        
        <div class="nav-section">
          <div class="nav-section-title">Navigation</div>
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