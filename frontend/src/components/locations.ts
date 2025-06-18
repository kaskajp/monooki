import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

interface Location {
  id: number;
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

    .locations-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }

    .location-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s ease;
    }

    .location-card:hover {
      border-color: #58a6ff;
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }

    .location-card h3 {
      margin: 0 0 0.5rem 0;
      color: #f0f6fc;
      font-size: 18px;
      font-weight: 600;
    }

    .location-description {
      color: #8b949e;
      margin-bottom: 1rem;
      font-size: 14px;
      line-height: 1.5;
    }

    .location-meta {
      font-size: 12px;
      color: #8b949e;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: #0d1117;
      border-radius: 6px;
      border: 1px solid #21262d;
    }

    .location-actions {
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
      max-width: 500px;
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

    .form-group input,
    .form-group textarea {
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

    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: #8b949e;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 100px;
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