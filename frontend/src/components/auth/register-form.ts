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
    .register-container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .form-title {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-primary:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .error {
      color: #dc3545;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }

    .login-link {
      text-align: center;
      margin-top: 1rem;
    }

    .login-link a {
      color: #007bff;
      text-decoration: none;
    }

    .login-link a:hover {
      text-decoration: underline;
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
      <div class="register-container">
        <h2 class="form-title">Create Your Account</h2>
        
        ${this.error ? html`
          <div class="error">${this.error}</div>
        ` : ''}
        
        <form @submit="${this.handleSubmit}">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
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
              .value="${this.password}"
              @input="${(e: InputEvent) => this.password = (e.target as HTMLInputElement).value}"
              required
              minlength="8"
            />
          </div>
          
          <div class="form-group">
            <label for="workspaceName">Workspace Name</label>
            <input
              type="text"
              id="workspaceName"
              .value="${this.workspaceName}"
              @input="${(e: InputEvent) => this.workspaceName = (e.target as HTMLInputElement).value}"
              required
              placeholder="e.g., Smith Family"
            />
          </div>
          
          <button
            type="submit"
            class="btn-primary"
            ?disabled="${this.loading}"
          >
            ${this.loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div class="login-link">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    `;
  }
} 