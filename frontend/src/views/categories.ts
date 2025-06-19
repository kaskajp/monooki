import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../components/button.js';

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

    .empty-state {
      text-align: center;
      padding: var(--spacing-3xl);
      color: var(--color-text-secondary);
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
    }

    .loading {
      text-align: center;
      padding: var(--spacing-3xl);
      color: var(--color-text-secondary);
    }

    .form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .form-container {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      padding: var(--spacing-2xl);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .form-container h2 {
      margin: 0 0 var(--spacing-xl) 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .form-group {
      margin-bottom: var(--spacing-xl);
    }

    .form-group label {
      display: block;
      margin-bottom: var(--spacing-sm);
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-control,
    input,
    select,
    textarea {
      width: 100%;
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--form-bg);
      border: 1px solid var(--form-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      color: var(--form-text);
      font-family: var(--font-family-primary);
      transition: all var(--transition-normal);
      box-sizing: border-box;
    }

    .form-control::placeholder,
    input::placeholder,
    textarea::placeholder {
      color: var(--form-placeholder);
    }

    .form-control:focus,
    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: var(--form-border-focus);
      box-shadow: var(--shadow-focus);
    }

    .form-control:hover,
    input:hover,
    select:hover,
    textarea:hover {
      border-color: var(--color-accent-primary);
    }

    .form-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      margin-top: var(--spacing-2xl);
    }

    @media (max-width: 768px) {
      :host {
        padding: var(--spacing-lg);
      }

      .header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-lg);
      }

      .form-container {
        margin: var(--spacing-lg);
        max-width: none;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      table {
        font-size: var(--font-size-xs);
      }

      th, td {
        padding: var(--spacing-sm) var(--spacing-md);
      }

      .category-actions {
        flex-direction: column;
        gap: var(--spacing-xs);
      }
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
        <app-button variant="primary" @button-click="${this.showAddForm}">
          Add Category
        </app-button>
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
                      <app-button variant="secondary" size="sm" icon-only @button-click="${() => this.showEditForm(category)}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 pen 01</title><g fill="currentColor" class="nc-icon-wrapper"><line id="butt_color" data-name="butt color" x1="13" y1="7" x2="9" y2="3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-cap="butt" data-color="color-2"></line> <polygon points="5.5 14.5 0.5 15.5 1.5 10.5 11.5 0.5 15.5 4.5 5.5 14.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-cap="butt"></polygon></g></svg>
                      </app-button>
                      <app-button variant="danger" size="sm" icon-only @button-click="${() => this.deleteCategory(category)}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 trash can</title><g fill="currentColor" class="nc-icon-wrapper"><path d="M2.5,5.5l.865,8.649A1.5,1.5,0,0,0,4.857,15.5h6.286a1.5,1.5,0,0,0,1.492-1.351L13.5,5.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><line data-color="color-2" x1="0.5" y1="3.5" x2="15.5" y2="3.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></line><polyline data-color="color-2" points="5.5 3.5 5.5 0.5 10.5 0.5 10.5 3.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></polyline> </g></svg>
                      </app-button>
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
                <app-button type="button" variant="secondary" @button-click="${this.hideForm}">
                  Cancel
                </app-button>
                <app-button type="submit" variant="primary" ?loading="${this.loading}">
                  ${this.editingCategory ? 'Update' : 'Create'}
                </app-button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}
    `;
  }
} 