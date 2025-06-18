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

@customElement('monooki-app')
class MonookiApp extends LitElement {
  private router = new Router(this, [
    { path: '/', render: () => this.renderDashboard() },
    { path: '/login', render: () => this.renderLogin() },
    { path: '/register', render: () => this.renderRegister() },
    { path: '/items', render: () => this.renderItems() },
    { path: '/items/new', render: () => this.renderItemForm() },
    { path: '/items/:id', render: ({ id }) => this.renderItemForm(id) },
    { path: '/locations', render: () => this.renderLocations() },
    { path: '/categories', render: () => this.renderCategories() },
    { path: '/settings', render: () => this.renderSettings() },
  ]);

  @state()
  isAuthenticated = false;

  @state()
  currentUser: any = null;

  @state()
  loading = true;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }
    
    .main-content {
      padding: 20px 0;
    }
    
    .dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #007bff;
      margin-bottom: 10px;
    }
    
    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.checkAuth();
  }

  private async checkAuth() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Verify token is still valid by making a request
        const response = await fetch('/api/items', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          this.isAuthenticated = true;
          this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      this.loading = false;
    }
  }

  private handleLogin = (event: CustomEvent) => {
    const { token, user } = event.detail;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.isAuthenticated = true;
    this.currentUser = user;
    this.router.goto('/');
  };

  private handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticated = false;
    this.currentUser = null;
    this.router.goto('/login');
  };

  private renderDashboard() {
    return html`
      <div class="container">
        <h1>Dashboard</h1>
        <div class="dashboard">
          <div class="stat-card">
            <div class="stat-number">-</div>
            <div class="stat-label">Total Items</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">-</div>
            <div class="stat-label">Locations</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">-</div>
            <div class="stat-label">Categories</div>
          </div>
        </div>
      </div>
    `;
  }

  private renderLogin() {
    return html`
      <div class="container">
        <login-form @login-success="${this.handleLogin}"></login-form>
      </div>
    `;
  }

  private renderRegister() {
    return html`
      <div class="container">
        <register-form @register-success="${this.handleLogin}"></register-form>
      </div>
    `;
  }

  private renderItems() {
    return html`
      <div class="container">
        <items-page></items-page>
      </div>
    `;
  }

  private renderItemForm(id?: string) {
    return html`
      <div class="container">
        <h1>${id ? 'Edit' : 'Add'} Item</h1>
        <p>Item form coming soon...</p>
      </div>
    `;
  }

  private renderLocations() {
    return html`
      <div class="container">
        <locations-page></locations-page>
      </div>
    `;
  }

  private renderCategories() {
    return html`
      <div class="container">
        <categories-page></categories-page>
      </div>
    `;
  }

  private renderSettings() {
    return html`
      <div class="container">
        <settings-page></settings-page>
      </div>
    `;
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">Loading...</div>`;
    }

    const currentPath = window.location.pathname;
    
    if (!this.isAuthenticated && !['/login', '/register'].includes(currentPath)) {
      return html`
        <main class="main-content">
          ${this.renderLogin()}
        </main>
      `;
    }

    return html`
      ${this.isAuthenticated ? html`
        <app-navbar 
          .currentUser="${this.currentUser}"
          @logout="${this.handleLogout}">
        </app-navbar>
        
        <main class="main-content">
          ${this.router.outlet()}
        </main>
      ` : html`
        <main class="main-content">
          ${currentPath === '/register' ? this.renderRegister() : this.renderLogin()}
        </main>
      `}
    `;
  }
}

// Initialize the app
const app = document.querySelector('#app');
if (app) {
  app.innerHTML = '<monooki-app></monooki-app>';
} 