import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

interface Location {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

@customElement('locations-page')
export class LocationsPage extends LitElement {
  @state()
  locations: Location[] = [];

  @state()
  loading = false;

  @state()
  showForm = false;

  @state()
  editingLocation: Location | null = null;

  @state()
  formData = { 
    name: '', 
    description: ''
  };

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

    .locations-grid {
      display: grid;
      gap: var(--spacing-xl);
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }

    .location-card {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      transition: all var(--transition-normal);
    }

    .location-card:hover {
      border-color: var(--color-accent-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .location-card h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--color-text-primary);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
    }

    .location-description {
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-lg);
      font-size: var(--font-size-sm);
      line-height: var(--line-height-normal);
    }

    .location-meta {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-sm);
      background: var(--color-bg-primary);
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border-secondary);
    }

    .location-actions {
      display: flex;
      gap: var(--spacing-sm);
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
    .form-group textarea {
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

    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: var(--form-placeholder);
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--form-border-focus);
      box-shadow: var(--shadow-focus);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 100px;
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
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadLocations();
  }

  private async loadLocations() {
    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/locations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.locations = await response.json();
      } else {
        console.error('Failed to load locations');
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      this.loading = false;
    }
  }

  private showAddForm() {
    this.editingLocation = null;
    this.formData = { name: '', description: '' };
    this.showForm = true;
  }

  private showEditForm(location: Location) {
    this.editingLocation = location;
    this.formData = { 
      name: location.name, 
      description: location.description || ''
    };
    this.showForm = true;
  }

  private hideForm() {
    this.showForm = false;
    this.editingLocation = null;
    this.formData = { name: '', description: '' };
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!this.formData.name.trim()) {
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const url = this.editingLocation 
        ? `/api/locations/${this.editingLocation.id}`
        : '/api/locations';
      
      const response = await fetch(url, {
        method: this.editingLocation ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(this.formData)
      });

      if (response.ok) {
        await this.loadLocations();
        this.hideForm();
      } else {
        console.error('Failed to save location');
      }
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      this.loading = false;
    }
  }

  private async deleteLocation(location: Location) {
    if (!confirm(`Are you sure you want to delete "${location.name}"?`)) {
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/locations/${location.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await this.loadLocations();
      } else {
        console.error('Failed to delete location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
    } finally {
      this.loading = false;
    }
  }

  private handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    this.formData = { ...this.formData, [target.name]: target.value };
  }

  render() {
    if (this.loading && !this.locations.length) {
      return html`<div class="loading">Loading locations...</div>`;
    }

    return html`
      <div class="header">
        <h1>Locations</h1>
        <button class="btn btn-primary" @click="${this.showAddForm}">
          Add Location
        </button>
      </div>

      ${this.locations.length === 0 ? html`
        <div class="empty-state">
          <p>No locations yet. Create your first location to get started!</p>
        </div>
      ` : html`
        <div class="locations-grid">
          ${this.locations.map(location => html`
            <div class="location-card">
              <h3>${location.name}</h3>
              ${location.description ? html`
                <div class="location-description">${location.description}</div>
              ` : ''}
              
              <div class="location-meta">
                Created: ${new Date(location.created_at).toLocaleDateString()}
              </div>
              <div class="location-actions">
                <button class="btn btn-secondary" @click="${() => this.showEditForm(location)}">
                  Edit
                </button>
                <button class="btn btn-danger" @click="${() => this.deleteLocation(location)}">
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
            <h2>${this.editingLocation ? 'Edit' : 'Add'} Location</h2>
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
                  placeholder="e.g., Kitchen, Living Room, Garage"
                />
              </div>
              
              <div class="form-group">
                <label for="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  .value="${this.formData.description}"
                  @input="${this.handleInputChange}"
                  placeholder="Optional description of this location"
                ></textarea>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="${this.hideForm}">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" ?disabled="${this.loading}">
                  ${this.loading ? 'Saving...' : (this.editingLocation ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}
    `;
  }
} 