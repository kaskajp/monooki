// Import URLPattern polyfill for browser compatibility
import 'urlpattern-polyfill';

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@lit-labs/router';
import './components/auth/login-form.js';
import './components/auth/register-form.js';
import './components/navbar.js';
import './views/categories.js';
import './views/locations.js';
import './views/items.js';
import './views/item-view.js';
import './views/settings.js';
import './views/profile.js';
import './views/account-settings.js';
import './views/custom-fields.js';
import './views/user-management.js';
import './components/button.js';
import './components/command-center.js';

@customElement('monooki-app')
export class MonookiApp extends LitElement {
  @state()
  private isAuthenticated = false;

  @state()
  private authView = 'login'; // 'login' or 'register'

  @state()
  private dashboardStats = {
    totalItems: 0,
    totalLocations: 0,
    totalCategories: 0,
    recentActivity: 0,
    expiringItems: 0,
    expiredItems: 0,
    isLoading: true
  };

  private router = new Router(this, [
    { path: '/', render: () => this.renderDashboard() },
    { path: '/items', render: () => html`<items-page></items-page>` },
    { path: '/items/:id', render: (params) => html`<item-view .itemId="${params.id || ''}" @edit-item="${this.handleEditItem}" @item-deleted="${this.handleItemDeleted}"></item-view>` },
    { path: '/locations', render: () => html`<locations-page></locations-page>` },
    { path: '/categories', render: () => html`<categories-page></categories-page>` },
    { path: '/settings', render: () => html`<settings-page></settings-page>` },
    { path: '/profile', render: () => html`<profile-page></profile-page>` },
    { path: '/account-settings', render: () => html`<account-settings-page></account-settings-page>` },
    { path: '/custom-fields', render: () => html`<custom-fields-page></custom-fields-page>` },
    { path: '/user-management', render: () => html`<user-management-page></user-management-page>` },
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

    .auth-header .logo {
      width: 80%;
      margin-bottom: 1rem;
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
      position: relative;
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

    .card-nav-btn {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
    }

    .alert-metric {
      color: #ffa500 !important;
    }

    .expiring-items-card .metric.alert-metric {
      color: #ffa500 !important;
      animation: pulse 2s infinite;
    }

    .expired-items-card .metric.alert-metric {
      color: #ff4444 !important;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
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
    if (this.isAuthenticated) {
      this.loadDashboardStats();
    }
  }

  private async loadDashboardStats() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all data in parallel
      const [itemsResponse, locationsResponse, categoriesResponse, expiringResponse, expiredResponse] = await Promise.all([
        fetch('/api/items', { headers }),
        fetch('/api/locations', { headers }),
        fetch('/api/categories', { headers }),
        fetch('/api/items/expiring?days=30', { headers }),
        fetch('/api/items/expired', { headers })
      ]);

      if (itemsResponse.ok && locationsResponse.ok && categoriesResponse.ok && expiringResponse.ok && expiredResponse.ok) {
        const [items, locations, categories, expiringItems, expiredItems] = await Promise.all([
          itemsResponse.json(),
          locationsResponse.json(),
          categoriesResponse.json(),
          expiringResponse.json(),
          expiredResponse.json()
        ]);

        // Calculate recent activity (items added in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentItems = items.filter((item: any) => 
          new Date(item.created_at) > sevenDaysAgo
        );

        this.dashboardStats = {
          totalItems: items.length,
          totalLocations: locations.length,
          totalCategories: categories.length,
          recentActivity: recentItems.length,
          expiringItems: expiringItems.length,
          expiredItems: expiredItems.length,
          isLoading: false
        };
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      this.dashboardStats = {
        ...this.dashboardStats,
        isLoading: false
      };
    }
  }

  private handleLogin() {
    this.isAuthenticated = true;
    this.loadDashboardStats();
    this.router.goto('/');
  }

  private handleRegister() {
    this.isAuthenticated = true;
    this.loadDashboardStats();
    this.router.goto('/');
  }

  private handleLogout() {
    localStorage.removeItem('token');
    this.isAuthenticated = false;
          this.dashboardStats = {
        totalItems: 0,
        totalLocations: 0,
        totalCategories: 0,
        recentActivity: 0,
        expiringItems: 0,
        expiredItems: 0,
        isLoading: true
      };
    this.requestUpdate();
  }

  private handleCommandCenterNavigation(e: CustomEvent) {
    const { url, action } = e.detail;
    this.router.goto(url);
    
    // If it's a create action, trigger the create modal
    if (action === 'create') {
      setTimeout(() => {
        // Find the specific component based on the URL
        let componentSelector = '';
        if (url === '/items') {
          componentSelector = 'items-page';
        } else if (url === '/locations') {
          componentSelector = 'locations-page';
        } else if (url === '/categories') {
          componentSelector = 'categories-page';
        }
        
        if (componentSelector) {
          const pageComponent = this.shadowRoot?.querySelector(componentSelector);
          if (pageComponent && 'openCreateModal' in pageComponent) {
            (pageComponent as any).openCreateModal();
          }
        }
      }, 100);
    }
  }

  private handleEditItem(e: CustomEvent) {
    const { itemId } = e.detail;
    // Navigate to items page and trigger edit modal
    this.router.goto('/items');
    setTimeout(() => {
      const itemsPage = this.shadowRoot?.querySelector('items-page');
      if (itemsPage && 'editItemById' in itemsPage) {
        (itemsPage as any).editItemById(itemId);
      }
    }, 100);
  }

  private handleItemDeleted(_e: CustomEvent) {
    // Navigate back to items list after deletion
    this.router.goto('/items');
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
            <div class="metric">
              ${this.dashboardStats.isLoading ? '-' : this.dashboardStats.totalItems}
            </div>
            <app-button class="card-nav-btn" variant="secondary" size="sm" href="/items">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 file copies</title><g stroke-miterlimit="10" fill="#FFFFFF" class="nc-icon-wrapper"><rect x="2.5" y="4.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="9" height="11"></rect> <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" points="4.5,2.5 13.5,2.5 13.5,13.5 " data-color="color-2"></polyline> <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" points="7.5,0.5 15.5,0.5 15.5,10.5 " data-color="color-2"></polyline></g></svg>
              View Items
            </app-button>
          </div>

          <div class="dashboard-card">
            <h3>Locations</h3>
            <p>Organized storage locations</p>
            <div class="metric">
              ${this.dashboardStats.isLoading ? '-' : this.dashboardStats.totalLocations}
            </div>
            <app-button class="card-nav-btn" variant="secondary" size="sm" href="/locations">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 position marker</title><g fill="currentColor" class="nc-icon-wrapper"><line x1="8.5" y1="12.5" x2="8.5" y2="8.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></line> <circle cx="8.5" cy="4.5" r="4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></circle> <path d="M11,11.681c2.066.316,3.5,1.012,3.5,1.819,0,1.105-2.686,2-6,2s-6-.895-6-2c0-.807,1.434-1.5,3.5-1.819" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-color="color-2"></path></g></svg>
              View Locations
            </app-button>
          </div>

          <div class="dashboard-card">
            <h3>Categories</h3>
            <p>Item categories for organization</p>
            <div class="metric">
              ${this.dashboardStats.isLoading ? '-' : this.dashboardStats.totalCategories}
            </div>
            <app-button class="card-nav-btn" variant="secondary" size="sm" href="/categories">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 tag cut</title><g stroke-miterlimit="10" fill="currentColor" class="nc-icon-wrapper"><polygon fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" points="3.5,0.5 8.5,1.5 15.5,8.5 8.5,15.5 1.5,8.5 0.5,3.5 " data-cap="butt"></polygon> <circle fill="currentColor" cx="5" cy="5" r="1" data-color="color-2" data-stroke="none"></circle></g></svg>
              View Categories
            </app-button>
          </div>

          <div class="dashboard-card expiring-items-card">
            <h3>Expiring Soon</h3>
            <p>Items expiring within 30 days</p>
            <div class="metric ${this.dashboardStats.expiringItems > 0 ? 'alert-metric' : ''}">
              ${this.dashboardStats.isLoading ? '-' : this.dashboardStats.expiringItems}
            </div>
            ${this.dashboardStats.expiringItems > 0 ? html`
              <app-button class="card-nav-btn" variant="secondary" size="sm" href="/items?sort=expiration_date">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
                </svg>
                View Expiring
              </app-button>
            ` : ''}
          </div>

          <div class="dashboard-card expired-items-card">
            <h3>Expired Items</h3>
            <p>Items that have already expired</p>
            <div class="metric ${this.dashboardStats.expiredItems > 0 ? 'alert-metric' : ''}">
              ${this.dashboardStats.isLoading ? '-' : this.dashboardStats.expiredItems}
            </div>
            ${this.dashboardStats.expiredItems > 0 ? html`
              <app-button class="card-nav-btn" variant="secondary" size="sm" href="/items?sort=expiration_date">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M11.5 9l-3 3-3-3"/>
                  <path d="M8 4v8"/>
                </svg>
                View Expired
              </app-button>
            ` : ''}
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
              <svg class="logo" width="100%" height="100%" viewBox="0 0 164 29" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;">
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
        <command-center @navigate="${this.handleCommandCenterNavigation}"></command-center>
      </div>
    `;
  }
}

// Initialize the app
const app = document.querySelector('#app');
if (app) {
  app.innerHTML = '<monooki-app></monooki-app>';
} 