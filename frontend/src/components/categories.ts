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
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .categories-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .category-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .category-card h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .category-meta {
      font-size: 12px;
      color: #666;
      margin-bottom: 16px;
    }

    .category-actions {
      display: flex;
      gap: 8px;
    }

    .form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .form-container {
      background: white;
      padding: 24px;
      border-radius: 8px;
      width: 90%;
      max-width: 400px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .form-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .error {
      color: #dc3545;
      margin-bottom: 16px;
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