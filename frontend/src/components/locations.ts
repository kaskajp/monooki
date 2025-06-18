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

    .locations-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }

    .location-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .location-card h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .location-description {
      color: #666;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .location-meta {
      font-size: 12px;
      color: #666;
      margin-bottom: 16px;
    }

    .location-actions {
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
      max-width: 500px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 80px;
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