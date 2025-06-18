import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-navbar')
export class AppNavbar extends LitElement {
  @property({ type: Object })
  currentUser: any = null;

  static styles = css`
    .navbar {
      background: #343a40;
      color: white;
      padding: 1rem 0;
      margin-bottom: 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-brand {
      font-size: 1.5rem;
      font-weight: bold;
      text-decoration: none;
      color: white;
    }

    .navbar-nav {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 1rem;
    }

    .nav-link {
      color: #ffffff;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .nav-link:hover {
      background-color: rgba(255,255,255,0.1);
    }

    .nav-link.active {
      background-color: #007bff;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-email {
      color: #ccc;
      font-size: 0.9rem;
    }

    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .logout-btn:hover {
      background: #c82333;
    }
  `;

  private handleLogout() {
    this.dispatchEvent(new CustomEvent('logout'));
  }

  render() {
    return html`
      <nav class="navbar">
        <div class="container">
          <a href="/" class="navbar-brand">Monooki</a>
          
          <ul class="navbar-nav">
            <li><a href="/" class="nav-link">Dashboard</a></li>
            <li><a href="/items" class="nav-link">Items</a></li>
            <li><a href="/locations" class="nav-link">Locations</a></li>
            <li><a href="/categories" class="nav-link">Categories</a></li>
            <li><a href="/settings" class="nav-link">Settings</a></li>
          </ul>
          
          <div class="user-info">
            ${this.currentUser ? html`
              <span class="user-email">${this.currentUser.email}</span>
              <button class="logout-btn" @click="${this.handleLogout}">
                Logout
              </button>
            ` : ''}
          </div>
        </div>
      </nav>
    `;
  }
} 