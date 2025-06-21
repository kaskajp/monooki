import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../components/button.js';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  workspace_id: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

@customElement('user-management-page')
export class UserManagementPage extends LitElement {
  @state()
  private users: User[] = [];

  @state()
  private loading = false;

  @state()
  private showInviteForm = false;

  @state()
  private inviteFormData = {
    email: '',
    role: 'user' as 'admin' | 'user',
    password: ''
  };

  @state()
  private currentUser: User | null = null;

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-2xl);
      background: var(--color-bg-primary);
      color: var(--color-text-primary);
      min-height: 100vh;
      color-scheme: dark;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-2xl);
    }

    .header h1 {
      margin: 0;
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .users-table {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      overflow-x: auto;
      width: 100%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      text-align: left;
      padding: 1rem 1.5rem;
      vertical-align: middle;
    }

    th {
      background: #21262d;
      font-weight: 600;
      color: #f0f6fc;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0.75rem 1.5rem;
      border-bottom: 1px solid #30363d;
    }

    td {
      border-bottom: 1px solid #30363d;
    }

    tbody tr:hover {
      background: #0d1117;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .user-email {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      font-size: var(--font-size-base);
    }

    .user-meta {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
      display: inline-block;
      text-transform: capitalize;
    }

    .badge--admin {
      background: var(--color-accent-primary);
      color: white;
    }

    .badge--user {
      background: var(--color-bg-tertiary);
      color: var(--color-text-secondary);
    }

    .badge--active {
      background: var(--color-success);
      color: white;
    }

    .badge--inactive {
      background: var(--color-danger);
      color: white;
    }

    .actions-cell {
      text-align: right;
      width: 200px;
    }

    .user-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--color-bg-overlay);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .form-container {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      padding: var(--spacing-2xl);
      border-radius: var(--radius-lg);
      width: 90%;
      max-width: 500px;
      color-scheme: dark;
      box-shadow: var(--shadow-lg);
    }

    .form-container h2 {
      margin: 0 0 var(--spacing-xl) 0;
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .form-group {
      margin-bottom: var(--spacing-xl);
    }

    .form-group label {
      display: block;
      margin-bottom: var(--spacing-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: var(--spacing-md);
      background: var(--form-bg);
      border: 1px solid var(--form-border);
      border-radius: var(--radius-md);
      box-sizing: border-box;
      color: var(--form-text);
      font-size: var(--font-size-sm);
      transition: all var(--transition-normal);
      font-family: var(--font-family-primary);
    }

    .form-group input::placeholder {
      color: var(--form-placeholder);
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--form-border-focus);
      box-shadow: var(--shadow-focus);
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #30363d;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #8b949e;
      font-size: 16px;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #8b949e;
    }

    .empty-state p {
      font-size: 16px;
      margin: 0;
    }

    .success-message {
      background: var(--color-success-bg);
      color: var(--color-success-text);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-xl);
      font-size: var(--font-size-sm);
      border: 1px solid var(--color-success-border);
    }

    .error-message {
      background: var(--color-danger-bg);
      color: var(--color-danger-text);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-xl);
      font-size: var(--font-size-sm);
      border: 1px solid var(--color-danger-border);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadUsers();
    this.loadCurrentUser();
  }

  private async loadCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.currentUser = await response.json();
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  }

  private async loadUsers() {
    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/workspace/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.users = await response.json();
      } else {
        console.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.loading = false;
    }
  }

  private showCreateUserForm() {
    this.inviteFormData = { email: '', role: 'user', password: '' };
    this.showInviteForm = true;
  }

  private hideCreateUserForm() {
    this.showInviteForm = false;
    this.inviteFormData = { email: '', role: 'user', password: '' };
  }

  private async handleCreateUser() {
    if (!this.inviteFormData.email.trim()) {
      this.showErrorMessage('Please enter an email address');
      return;
    }

    if (!this.inviteFormData.password.trim()) {
      this.showErrorMessage('Please enter a password');
      return;
    }

    if (this.inviteFormData.password.length < 8) {
      this.showErrorMessage('Password must be at least 8 characters long');
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/workspace/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(this.inviteFormData)
      });

      if (response.ok) {
        await this.loadUsers();
        this.hideCreateUserForm();
        this.showSuccessMessage('User created successfully!');
      } else {
        const errorData = await response.json();
        this.showErrorMessage(errorData.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      this.showErrorMessage('An error occurred while creating user');
    } finally {
      this.loading = false;
    }
  }

  private async updateUserRole(user: User, newRole: 'admin' | 'user') {
    if (user.id === this.currentUser?.id) {
      alert("You cannot change your own role.");
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/workspace/users/${user.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        await this.loadUsers();
        this.showSuccessMessage('User role updated successfully!');
      } else {
        const errorData = await response.json();
        this.showErrorMessage(errorData.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      this.showErrorMessage('An error occurred while updating user role');
    } finally {
      this.loading = false;
    }
  }

  private async toggleUserStatus(user: User) {
    if (user.id === this.currentUser?.id) {
      alert("You cannot deactivate your own account.");
      return;
    }

    const action = user.is_active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${user.email}?`)) {
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/workspace/users/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !user.is_active })
      });

      if (response.ok) {
        await this.loadUsers();
        this.showSuccessMessage(`User ${action}d successfully!`);
      } else {
        const errorData = await response.json();
        this.showErrorMessage(errorData.error || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      this.showErrorMessage(`An error occurred while ${action}ing user`);
    } finally {
      this.loading = false;
    }
  }

  private async removeUser(user: User) {
    if (user.id === this.currentUser?.id) {
      alert("You cannot remove your own account.");
      return;
    }

    if (!confirm(`Are you sure you want to remove ${user.email} from the workspace? This action cannot be undone.`)) {
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/workspace/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await this.loadUsers();
        this.showSuccessMessage('User removed successfully!');
      } else {
        const errorData = await response.json();
        this.showErrorMessage(errorData.error || 'Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
      this.showErrorMessage('An error occurred while removing user');
    } finally {
      this.loading = false;
    }
  }

  private handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const value = target.value;
    this.inviteFormData = { ...this.inviteFormData, [target.name]: value };
  }

  private showSuccessMessage(message: string) {
    const successDiv = this.shadowRoot?.querySelector('.success-message') as HTMLElement;
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'block';
      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 5000);
    }
  }

  private showErrorMessage(message: string) {
    const errorDiv = this.shadowRoot?.querySelector('.error-message') as HTMLElement;
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }

  private formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  }

  // Check if current user is admin
  private get isCurrentUserAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  render() {
    if (this.loading && !this.users.length) {
      return html`<div class="loading">Loading users...</div>`;
    }

    return html`
      <div class="success-message" style="display: none;"></div>
      <div class="error-message" style="display: none;"></div>

      <div class="header">
        <h1>User Management</h1>
        ${this.isCurrentUserAdmin ? html`
          <app-button variant="primary" @button-click="${this.showCreateUserForm}">
            Create User
          </app-button>
        ` : ''}
      </div>

      ${!this.isCurrentUserAdmin ? html`
        <div class="error-message" style="display: block;">
          You must be an administrator to manage users.
        </div>
      ` : ''}

      ${this.users.length === 0 ? html`
        <div class="empty-state">
          <p>No users found in this workspace.</p>
        </div>
      ` : html`
        <div class="users-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Joined</th>
                ${this.isCurrentUserAdmin ? html`<th class="actions-cell">Actions</th>` : ''}
              </tr>
            </thead>
            <tbody>
              ${this.users.map(user => html`
                <tr>
                  <td>
                    <div class="user-info">
                      <div class="user-email">${user.email}</div>
                      ${user.id === this.currentUser?.id ? html`
                        <div class="user-meta">(You)</div>
                      ` : ''}
                    </div>
                  </td>
                  <td>
                    <span class="badge badge--${user.role}">
                      ${user.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  </td>
                  <td>
                    <span class="badge badge--${user.is_active ? 'active' : 'inactive'}">
                      ${user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>${this.formatDate(user.last_login)}</td>
                  <td>${this.formatDate(user.created_at)}</td>
                  
                  ${this.isCurrentUserAdmin ? html`
                    <td class="actions-cell">
                      <div class="user-actions">
                        ${user.id !== this.currentUser?.id ? html`
                          <app-button 
                            variant="secondary" 
                            size="sm" 
                            @button-click="${() => this.updateUserRole(user, user.role === 'admin' ? 'user' : 'admin')}"
                            title="${user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}"
                          >
                            ${user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </app-button>
                          
                          <app-button 
                            variant="${user.is_active ? 'secondary' : 'primary'}" 
                            size="sm" 
                            @button-click="${() => this.toggleUserStatus(user)}"
                            title="${user.is_active ? 'Deactivate' : 'Activate'}"
                          >
                            ${user.is_active ? 'Deactivate' : 'Activate'}
                          </app-button>
                          
                          <app-button 
                            variant="danger" 
                            size="sm" 
                            @button-click="${() => this.removeUser(user)}"
                            icon-only
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 trash can</title><g fill="currentColor" class="nc-icon-wrapper"><path d="M2.5,5.5l.865,8.649A1.5,1.5,0,0,0,4.857,15.5h6.286a1.5,1.5,0,0,0,1.492-1.351L13.5,5.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><line data-color="color-2" x1="0.5" y1="3.5" x2="15.5" y2="3.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></line><polyline data-color="color-2" points="5.5 3.5 5.5 0.5 10.5 0.5 10.5 3.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></polyline> </g></svg>
                          </app-button>
                        ` : html`
                          <span style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">—</span>
                        `}
                      </div>
                    </td>
                  ` : ''}
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      `}

      ${this.showInviteForm ? html`
        <div class="form-overlay" @click="${(e: Event) => e.target === e.currentTarget && this.hideCreateUserForm()}">
          <div class="form-container">
            <h2>Create User</h2>
            <div class="form-content">
              <div class="form-group">
                <label for="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  .value="${this.inviteFormData.email}"
                  @input="${this.handleInputChange}"
                  required
                  placeholder="user@example.com"
                />
              </div>
              
              <div class="form-group">
                <label for="role">Role</label>
                <select
                  id="role"
                  name="role"
                  .value="${this.inviteFormData.role}"
                  @change="${this.handleInputChange}"
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div class="form-group">
                <label for="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  .value="${this.inviteFormData.password}"
                  @input="${this.handleInputChange}"
                  required
                  placeholder="Enter password (min 8 characters)"
                />
                <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--spacing-sm);">
                  Password must be at least 8 characters long
                </div>
              </div>

              <div class="form-actions">
                <app-button type="button" variant="secondary" @button-click="${this.hideCreateUserForm}">
                  Cancel
                </app-button>
                <app-button type="button" variant="primary" ?loading="${this.loading}" @button-click="${this.handleCreateUser}">
                  Create User
                </app-button>
              </div>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }
} 