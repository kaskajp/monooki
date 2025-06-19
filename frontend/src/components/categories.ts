import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

@customElement('categories-page')
export class CategoriesPage extends LitElement {
  @state()
  categories: Category[] = [];

  @state()
  loading = false;

  @state()
  showForm = false;

  @state()
  editingCategory: Category | null = null;

  @state()
  formData = { name: '' };

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

    .btn {
      padding: var(--spacing-md) var(--spacing-lg);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      transition: all var(--transition-normal);
      font-family: var(--font-family-primary);
    }

    .btn-primary {
      background: var(--btn-primary-bg);
      color: var(--btn-primary-text);
    }

    .btn-primary:hover {
      background: var(--btn-primary-bg-hover);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--btn-secondary-bg);
      color: var(--btn-secondary-text);
      border: 1px solid var(--btn-secondary-border);
    }

    .btn-secondary:hover {
      background: var(--btn-secondary-bg-hover);
      border-color: var(--btn-secondary-border-hover);
    }

    .btn-danger {
      background: var(--btn-danger-bg);
      color: var(--btn-danger-text);
    }

    .btn-danger:hover {
      background: var(--btn-danger-bg-hover);
    }

    .categories-table {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      overflow: hidden;
      width: 100%;
    }

    .table-header {
      background: var(--color-bg-tertiary);
      border-bottom: 1px solid var(--color-border-primary);
    }

    .table-row {
      border-bottom: 1px solid var(--color-border-primary);
      transition: background var(--transition-normal);
    }

    .table-row:hover {
      background: var(--color-bg-primary);
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-cell {
      padding: var(--spacing-lg) var(--spacing-xl);
      vertical-align: middle;
    }

    .table-header .table-cell {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: var(--spacing-md) var(--spacing-xl);
    }

    .category-name {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      font-size: var(--font-size-base);
    }

    .category-date {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .category-count {
      color: var(--color-accent-primary);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
    }

    .category-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn-small {
      padding: 0.5rem 0.75rem;
      font-size: 12px;
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

    tr:hover {
      background: #0d1117;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .actions-cell {
      text-align: right;
      width: 150px;
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
      max-width: 400px;
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

    .form-group input {
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

    .form-group input:focus {
      outline: none;
      border-color: var(--form-border-focus);
      box-shadow: var(--shadow-focus);
    }

    .form-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-xl);
      border-top: 1px solid var(--color-border-primary);
    }

    .loading {
      text-align: center;
      padding: var(--spacing-3xl);
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-3xl);
      color: var(--color-text-secondary);
    }

    .empty-state p {
      font-size: var(--font-size-base);
      margin: 0;
    }

    .error {
      color: var(--color-danger);
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      background: var(--color-danger-light);
      border: 1px solid var(--color-border-danger);
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--color-danger);
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadCategories();
  }

  private async loadCategories() {
    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.categories = await response.json();
      } else {
        console.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      this.loading = false;
    }
  }

  private showAddForm() {
    this.editingCategory = null;
    this.formData = { name: '' };
    this.showForm = true;
  }

  private showEditForm(category: Category) {
    this.editingCategory = category;
    this.formData = { name: category.name };
    this.showForm = true;
  }

  private hideForm() {
    this.showForm = false;
    this.editingCategory = null;
    this.formData = { name: '' };
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!this.formData.name.trim()) {
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const url = this.editingCategory 
        ? `/api/categories/${this.editingCategory.id}`
        : '/api/categories';
      
      const response = await fetch(url, {
        method: this.editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(this.formData)
      });

      if (response.ok) {
        await this.loadCategories();
        this.hideForm();
      } else {
        console.error('Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      this.loading = false;
    }
  }

  private async deleteCategory(category: Category) {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await this.loadCategories();
      } else {
        console.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      this.loading = false;
    }
  }

  private handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.formData = { ...this.formData, [target.name]: target.value };
  }

  render() {
    if (this.loading && !this.categories.length) {
      return html`<div class="loading">Loading categories...</div>`;
    }

    return html`
      <div class="header">
        <h1>Categories</h1>
        <button class="btn btn-primary" @click="${this.showAddForm}">
          Add Category
        </button>
      </div>

      ${this.categories.length === 0 ? html`
        <div class="empty-state">
          <p>No categories yet. Create your first category to get started!</p>
        </div>
      ` : html`
        <div class="categories-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Items</th>
                <th>Created</th>
                <th class="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.categories.map(category => html`
                <tr>
                  <td>
                    <div class="category-name">${category.name}</div>
                  </td>
                  <td>
                    <div class="category-count">${category.item_count || 0}</div>
                  </td>
                  <td>
                    <div class="category-date">${new Date(category.created_at).toLocaleDateString()}</div>
                  </td>
                  <td class="actions-cell">
                    <div class="category-actions">
                      <button class="btn btn-secondary btn-small" @click="${() => this.showEditForm(category)}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 pen 01</title><g fill="#FFFFFF" class="nc-icon-wrapper"><line id="butt_color" data-name="butt color" x1="13" y1="7" x2="9" y2="3" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" data-cap="butt" data-color="color-2"></line> <polygon points="5.5 14.5 0.5 15.5 1.5 10.5 11.5 0.5 15.5 4.5 5.5 14.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" data-cap="butt"></polygon></g></svg>
                      </button>
                      <button class="btn btn-danger btn-small" @click="${() => this.deleteCategory(category)}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 trash can</title><g fill="#FFFFFF" class="nc-icon-wrapper"><path d="M2.5,5.5l.865,8.649A1.5,1.5,0,0,0,4.857,15.5h6.286a1.5,1.5,0,0,0,1.492-1.351L13.5,5.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></path><line data-color="color-2" x1="0.5" y1="3.5" x2="15.5" y2="3.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><polyline data-color="color-2" points="5.5 3.5 5.5 0.5 10.5 0.5 10.5 3.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></polyline> </g></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      `}

      ${this.showForm ? html`
        <div class="form-overlay" @click="${(e: Event) => e.target === e.currentTarget && this.hideForm()}">
          <div class="form-container">
            <h2>${this.editingCategory ? 'Edit' : 'Add'} Category</h2>
            <form @submit="${this.handleSubmit}">
              <div class="form-group">
                <label for="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  .value="${this.formData.name}"
                  @input="${this.handleInputChange}"
                  required
                  placeholder="Enter category name"
                />
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="${this.hideForm}">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" ?disabled="${this.loading}">
                  ${this.loading ? 'Saving...' : (this.editingCategory ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}
    `;
  }
} 