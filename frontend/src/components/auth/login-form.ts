import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('login-form')
export class LoginForm extends LitElement {
  @state()
  private email = '';

  @state()
  private password = '';

  @state()
  private loading = false;

  @state()
  private error = '';

  static styles = css`
    .login-form {
      width: 100%;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #f0f6fc;
      font-size: 14px;
      font-weight: 500;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      font-size: 14px;
      color: #f0f6fc;
      transition: all 0.2s ease;
      font-family: inherit;
      box-sizing: border-box;
    }

    .form-group input::placeholder {
      color: #8b949e;
    }

    .form-group input:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
    }

    .form-group input:hover {
      border-color: #58a6ff;
    }

    .submit-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #238636;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .submit-btn:hover:not(:disabled) {
      background: #2ea043;
      transform: translateY(-1px);
    }

    .submit-btn:disabled {
      background: #30363d;
      color: #8b949e;
      cursor: not-allowed;
      transform: none;
    }

    .error-message {
      color: #f85149;
      font-size: 12px;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: rgba(248, 81, 73, 0.1);
      border: 1px solid rgba(248, 81, 73, 0.2);
      border-radius: 6px;
      border-left: 3px solid #f85149;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  private async handleSubmit(e: Event) {
    e.preventDefault();
    this.loading = true;
    this.error = '';

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        this.dispatchEvent(new CustomEvent('login-success', {
          detail: { token: data.token, user: data.user }
        }));
      } else {
        this.error = data.error || 'Login failed';
      }
    } catch (error) {
      this.error = 'Network error. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <form class="login-form" @submit="${this.handleSubmit}">
        ${this.error ? html`
          <div class="error-message">${this.error}</div>
        ` : ''}
        
        <div class="form-group">
          <label for="email">Email address</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            .value="${this.email}"
            @input="${(e: InputEvent) => this.email = (e.target as HTMLInputElement).value}"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            .value="${this.password}"
            @input="${(e: InputEvent) => this.password = (e.target as HTMLInputElement).value}"
            required
          />
        </div>
        
        <button
          type="submit"
          class="submit-btn"
          ?disabled="${this.loading}"
        >
          ${this.loading ? html`
            <div class="loading-spinner"></div>
            Signing in...
          ` : 'Sign in'}
        </button>
      </form>
    `;
  }
} 