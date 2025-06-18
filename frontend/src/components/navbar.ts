import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-navbar')
export class AppNavbar extends LitElement {
  @property({ type: Object })
  currentUser: any = null;

  static styles = css`
    :host {
      display: block;
      width: 240px;
      height: 100vh;
      background: #161b22;
      border-right: 1px solid #30363d;
      overflow-y: auto;
      color-scheme: dark;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1rem 0;
    }

    .nav-brand {
      padding: 0 1.5rem;
      margin-bottom: 2rem;
    }

    .nav-brand h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #f0f6fc;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-brand .logo {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #58a6ff 0%, #79c0ff 100%);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    .nav-section {
      margin-bottom: 1.5rem;
    }

    .nav-section-title {
      padding: 0 1.5rem;
      margin-bottom: 0.5rem;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #8b949e;
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
      gap: 0.75rem;
      color: #e6edf3;
      text-decoration: none;
      padding: 0.5rem 1.5rem;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .nav-link:hover {
      background: #21262d;
      color: #f0f6fc;
    }

    .nav-link.active {
      background: #1c2128;
      color: #58a6ff;
      border-left-color: #58a6ff;
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
      padding: 1rem 0;
      border-top: 1px solid #30363d;
    }

    .user-info {
      padding: 0 1.5rem;
      margin-bottom: 1rem;
    }

    .user-email {
      font-size: 12px;
      color: #8b949e;
      margin-bottom: 0.25rem;
    }

    .user-workspace {
      font-size: 14px;
      color: #f0f6fc;
      font-weight: 500;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: none;
      border: none;
      color: #e6edf3;
      padding: 0.5rem 1.5rem;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all 0.2s ease;
    }

    .logout-btn:hover {
      background: #21262d;
      color: #f85149;
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

  private getCurrentPath() {
    return window.location.pathname;
  }

  private isActive(path: string) {
    const currentPath = this.getCurrentPath();
    return currentPath === path || (path !== '/' && currentPath.startsWith(path));
  }

  private handleLogout() {
    this.dispatchEvent(new CustomEvent('logout'));
  }

  render() {
    return html`
      <div class="sidebar">
        <div class="nav-brand">
          <h1>
            <div class="logo">M</div>
            Monooki
          </h1>
        </div>
        
        <div class="nav-section">
          <div class="nav-section-title">Navigation</div>
          <ul class="nav-links">
            <li>
              <a href="/" class="nav-link ${this.isActive('/') && this.getCurrentPath() === '/' ? 'active' : ''}">
                <span class="icon">🏠</span>
                Dashboard
              </a>
            </li>
            <li>
              <a href="/items" class="nav-link ${this.isActive('/items') ? 'active' : ''}">
                <span class="icon">📦</span>
                Items
              </a>
            </li>
            <li>
              <a href="/locations" class="nav-link ${this.isActive('/locations') ? 'active' : ''}">
                <span class="icon">📍</span>
                Locations
              </a>
            </li>
            <li>
              <a href="/categories" class="nav-link ${this.isActive('/categories') ? 'active' : ''}">
                <span class="icon">🏷️</span>
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
                <span class="icon">⚙️</span>
                Settings
              </a>
            </li>
          </ul>
        </div>

        <div class="user-section">
          <div class="user-info">
            <div class="user-email">user@monooki.app</div>
            <div class="user-workspace">Personal Workspace</div>
          </div>
          <button class="logout-btn" @click="${this.handleLogout}">
            <span class="icon">🚪</span>
            Sign out
          </button>
        </div>
      </div>
    `;
  }
} 