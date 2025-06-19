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
      padding: 1rem 0 0 0;
      box-sizing: border-box;
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