import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('register-form')
export class RegisterForm extends LitElement {
  @state()
  private email = '';

  @state()
  private password = '';

  @state()
  private workspaceName = '';

  @state()
  private loading = false;

  @state()
  private error = '';

  static styles = css`
    .register-form {
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
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--form-bg);
      border: 1px solid var(--form-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      color: var(--form-text);
      transition: all var(--transition-normal);
      font-family: var(--font-family-primary);
      box-sizing: border-box;
    }

    .form-group input::placeholder {
      color: var(--form-placeholder);
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--form-border-focus);
      box-shadow: var(--shadow-focus);
    }

    .form-group input:hover {
      border-color: var(--color-accent-primary);
    }

    .submit-btn {
      width: 100%;
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--btn-primary-bg);
      color: var(--btn-primary-text);
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-normal);
      font-family: var(--font-family-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
    }

    .submit-btn:hover:not(:disabled) {
      background: var(--btn-primary-bg-hover);
      transform: translateY(-1px);
    }

    .submit-btn:disabled {
      background: var(--color-bg-tertiary);
      color: var(--color-text-secondary);
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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
          workspaceName: this.workspaceName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        this.dispatchEvent(new CustomEvent('register-success', {
          detail: { token: data.token, user: data.user }
        }));
      } else {
        this.error = data.error || 'Registration failed';
      }
    } catch (error) {
      this.error = 'Network error. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <form class="register-form" @submit="${this.handleSubmit}">
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
            minlength="8"
          />
        </div>
        
        <div class="form-group">
          <label for="workspaceName">Workspace name</label>
          <input
            type="text"
            id="workspaceName"
            placeholder="e.g., Smith Family"
            .value="${this.workspaceName}"
            @input="${(e: InputEvent) => this.workspaceName = (e.target as HTMLInputElement).value}"
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
            Creating account...
          ` : 'Create account'}
        </button>
      </form>
    `;
  }
} 