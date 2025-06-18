import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
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
      padding: 2rem;
      background: #0d1117;
      color: #f0f6fc;
      min-height: 100vh;
      color-scheme: dark;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
      color: #f0f6fc;
    }

    .btn {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn-primary {
      background: #238636;
      color: white;
    }

    .btn-primary:hover {
      background: #2ea043;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #21262d;
      color: #f0f6fc;
      border: 1px solid #30363d;
    }

    .btn-secondary:hover {
      background: #30363d;
      border-color: #58a6ff;
    }

    .btn-danger {
      background: #da3633;
      color: white;
    }

    .btn-danger:hover {
      background: #f85149;
    }

    .categories-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .category-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s ease;
    }

    .category-card:hover {
      border-color: #58a6ff;
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }

    .category-card h3 {
      margin: 0 0 0.5rem 0;
      color: #f0f6fc;
      font-size: 18px;
      font-weight: 600;
    }

    .category-meta {
      font-size: 12px;
      color: #8b949e;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: #0d1117;
      border-radius: 6px;
      border: 1px solid #21262d;
    }

    .category-actions {
      display: flex;
      gap: 0.5rem;
    }

    .form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .form-container {
      background: #161b22;
      border: 1px solid #30363d;
      padding: 2rem;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      color-scheme: dark;
      box-shadow: 0 16px 70px rgba(0, 0, 0, 0.5);
    }

    .form-container h2 {
      margin: 0 0 1.5rem 0;
      font-size: 24px;
      font-weight: 600;
      color: #f0f6fc;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #f0f6fc;
      font-size: 14px;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      box-sizing: border-box;
      color: #f0f6fc;
      font-size: 14px;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .form-group input::placeholder {
      color: #8b949e;
    }

    .form-group input:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
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

    .error {
      color: #f85149;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: rgba(248, 81, 73, 0.1);
      border: 1px solid rgba(248, 81, 73, 0.2);
      border-radius: 6px;
      border-left: 3px solid #f85149;
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
        <div class="categories-grid">
          ${this.categories.map(category => html`
            <div class="category-card">
              <h3>${category.name}</h3>
              <div class="category-meta">
                Created: ${new Date(category.created_at).toLocaleDateString()}
              </div>
              <div class="category-actions">
                <button class="btn btn-secondary" @click="${() => this.showEditForm(category)}">
                  Edit
                </button>
                <button class="btn btn-danger" @click="${() => this.deleteCategory(category)}">
                  Delete
                </button>
              </div>
            </div>
          `)}
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