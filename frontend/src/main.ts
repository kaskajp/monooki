import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@lit-labs/router';
import './components/auth/login-form.js';
import './components/auth/register-form.js';
import './components/navbar.js';
import './components/categories.js';
import './components/locations.js';
import './components/items.js';
import './components/settings.js';
import './components/profile.js';

@customElement('monooki-app')
export class MonookiApp extends LitElement {
  @state()
  private isAuthenticated = false;

  @state()
  private authView = 'login'; // 'login' or 'register'

  private router = new Router(this, [
    { path: '/', render: () => this.renderDashboard() },
    { path: '/items', render: () => html`<items-page></items-page>` },
    { path: '/locations', render: () => html`<locations-page></locations-page>` },
    { path: '/categories', render: () => html`<categories-page></categories-page>` },
    { path: '/settings', render: () => html`<settings-page></settings-page>` },
    { path: '/profile', render: () => html`<profile-page></profile-page>` },
  ]);

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--color-bg-primary);
      color: var(--color-text-primary);
      font-family: var(--font-family-primary);
      font-size: var(--font-size-sm);
      line-height: var(--line-height-normal);
      color-scheme: dark;
    }

    * {
      box-sizing: border-box;
    }

    .app-container {
      display: flex;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      margin-left: 240px;
      background: var(--color-bg-primary);
      overflow-y: auto;
      color-scheme: dark;
    }

    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
      padding: var(--spacing-2xl);
    }

    .auth-card {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      padding: var(--spacing-2xl);
      width: 100%;
      max-width: 400px;
      box-shadow: var(--shadow-lg);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 24px;
      font-weight: 600;
      color: #f0f6fc;
    }

    .auth-header p {
      margin: 0;
      color: #8b949e;
      font-size: 14px;
    }

    .auth-toggle {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #30363d;
    }

    .auth-toggle button {
      background: none;
      border: none;
      color: #58a6ff;
      cursor: pointer;
      font-size: 14px;
      text-decoration: underline;
      padding: 0;
    }

    .auth-toggle button:hover {
      color: #79c0ff;
    }

    .dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 32px;
      font-weight: 600;
      color: #f0f6fc;
    }

    .dashboard-header p {
      margin: 0;
      color: #8b949e;
      font-size: 16px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .dashboard-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s ease;
    }

    .dashboard-card:hover {
      border-color: #58a6ff;
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }

    .dashboard-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 18px;
      font-weight: 600;
      color: #f0f6fc;
    }

    .dashboard-card p {
      margin: 0 0 1rem 0;
      color: #8b949e;
      font-size: 14px;
    }

    .dashboard-card .metric {
      font-size: 24px;
      font-weight: 600;
      color: #58a6ff;
    }

    .quick-actions {
      margin-top: 2rem;
    }

    .quick-actions h2 {
      margin: 0 0 1rem 0;
      font-size: 20px;
      font-weight: 600;
      color: #f0f6fc;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .action-btn {
      background: #238636;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .action-btn:hover {
      background: #2ea043;
      transform: translateY(-1px);
    }

    .action-btn.secondary {
      background: #21262d;
      color: #f0f6fc;
      border: 1px solid #30363d;
    }

    .action-btn.secondary:hover {
      background: #30363d;
      border-color: #58a6ff;
    }

    @media (max-width: 768px) {
      .dashboard {
        padding: 1rem;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('token');
    this.isAuthenticated = !!token;
  }

  private handleLogin() {
    this.isAuthenticated = true;
    this.router.goto('/');
  }

  private handleRegister() {
    this.isAuthenticated = true;
    this.router.goto('/');
  }

  private handleLogout() {
    localStorage.removeItem('token');
    this.isAuthenticated = false;
    this.requestUpdate();
  }

  private renderDashboard() {
    return html`
      <div class="dashboard">
        <div class="dashboard-header">
          <h1>Welcome to Monooki</h1>
          <p>Manage your home inventory with ease</p>
        </div>

        <div class="dashboard-grid">
          <div class="dashboard-card">
            <h3>Items</h3>
            <p>Total items in your inventory</p>
            <div class="metric">-</div>
          </div>

          <div class="dashboard-card">
            <h3>Locations</h3>
            <p>Organized storage locations</p>
            <div class="metric">-</div>
          </div>

          <div class="dashboard-card">
            <h3>Categories</h3>
            <p>Item categories for organization</p>
            <div class="metric">-</div>
          </div>

          <div class="dashboard-card">
            <h3>Recent Activity</h3>
            <p>Latest inventory updates</p>
            <div class="metric">-</div>
          </div>
        </div>

        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-buttons">
            <a href="/items" class="action-btn">
              <span>📦</span> Add Item
            </a>
            <a href="/locations" class="action-btn secondary">
              <span>📍</span> Manage Locations
            </a>
            <a href="/categories" class="action-btn secondary">
              <span>🏷️</span> Manage Categories
            </a>
            <a href="/settings" class="action-btn secondary">
              <span>⚙️</span> Settings
            </a>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.isAuthenticated) {
      return html`
        <div class="auth-container">
          <div class="auth-card">
            <div class="auth-header">
              <h1>Monooki</h1>
              <p>Your personal inventory management system</p>
            </div>
            
${this.authView === 'login' 
              ? html`<login-form @login-success="${this.handleLogin}"></login-form>`
              : html`<register-form @register-success="${this.handleRegister}"></register-form>`
            }
            
            <div class="auth-toggle">
              <p>${this.authView === 'login' 
                ? html`Don't have an account? <button @click="${() => this.authView = 'register'}">Sign up</button>`
                : html`Already have an account? <button @click="${() => this.authView = 'login'}">Sign in</button>`
              }</p>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="app-container">
        <app-navbar @logout="${this.handleLogout}"></app-navbar>
        <main class="main-content">
          ${this.router.outlet()}
        </main>
      </div>
    `;
  }
}

// Initialize the app
const app = document.querySelector('#app');
if (app) {
  app.innerHTML = '<monooki-app></monooki-app>';
} 