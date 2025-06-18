import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

interface Item {
  id: string;
  name: string;
  description?: string;
  location_id?: string;
  location?: { id: string; name: string };
  category_id?: string;
  category?: { id: string; name: string };
  quantity?: number;
  model_number?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price?: number;
  purchase_location?: string;
  warranty?: string;
  custom_fields?: Record<string, any>;
  first_photo?: string;
  photos?: Photo[];
  created_at: string;
  updated_at: string;
}

interface Photo {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
}

interface CustomField {
  id: string;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'textarea' | 'checkbox' | 'enum';
  required: boolean;
  options?: string[];
}

interface Category {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

@customElement('items-page')
export class ItemsPage extends LitElement {
  @state()
  items: Item[] = [];

  @state()
  categories: Category[] = [];

  @state()
  locations: Location[] = [];

  @state()
  customFieldDefs: CustomField[] = [];

  @state()
  loading = false;

  @state()
  showForm = false;

  @state()
  editingItem: Item | null = null;

  @state()
  searchTerm = '';

  @state()
  selectedCategory = '';

  @state()
  selectedLocation = '';

  @state()
  sortBy = 'name';

  @state()
  formData = {
    name: '',
    description: '',
    location_id: '',
    category_id: '',
    quantity: '',
    model_number: '',
    serial_number: '',
    purchase_date: '',
    purchase_price: '',
    purchase_location: '',
    warranty: ''
  };

  @state()
  customFieldValues: Record<string, any> = {};

  @state()
  selectedFiles: File[] = [];

  @state()
  uploadingPhotos = false;

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

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      padding: 1.5rem;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 200px;
    }

    .filter-group label {
      font-size: 12px;
      font-weight: 500;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filter-group input,
    .filter-group select {
      padding: 0.75rem;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      font-size: 14px;
      color: #f0f6fc;
      transition: all 0.2s ease;
    }

    .filter-group input::placeholder {
      color: #8b949e;
    }

    .filter-group input:focus,
    .filter-group select:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
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

    .items-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    }

    .item-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
    }

    .item-card:hover {
      border-color: #58a6ff;
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }

    .item-photo {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 1rem;
      border: 1px solid #30363d;
    }

    .item-content {
      flex: 1;
    }

    .item-card h3 {
      margin: 0 0 0.5rem 0;
      color: #f0f6fc;
      font-size: 18px;
      font-weight: 600;
    }

    .item-description {
      color: #8b949e;
      margin-bottom: 1rem;
      font-size: 14px;
      line-height: 1.5;
    }

    .item-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1rem;
      font-size: 13px;
    }

    .item-detail {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      background: #0d1117;
      border-radius: 6px;
      border: 1px solid #21262d;
    }

    .item-detail-label {
      font-weight: 500;
      color: #8b949e;
    }

    .item-detail-value {
      color: #f0f6fc;
      font-weight: 500;
    }

    .custom-fields {
      margin-bottom: 1rem;
    }

    .custom-fields h4 {
      margin: 0 0 0.5rem 0;
      font-size: 14px;
      color: #f0f6fc;
      font-weight: 600;
    }

    .custom-field {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      font-size: 12px;
      background: #0d1117;
      border-radius: 6px;
      border: 1px solid #21262d;
      margin-bottom: 0.25rem;
    }

    .custom-field:last-child {
      margin-bottom: 0;
    }

    .item-meta {
      font-size: 12px;
      color: #8b949e;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: #0d1117;
      border-radius: 6px;
      border: 1px solid #21262d;
    }

    .item-actions {
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
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      color-scheme: dark;
      box-shadow: 0 16px 70px rgba(0, 0, 0, 0.5);
    }

    .form-container h2 {
      margin: 0 0 1.5rem 0;
      font-size: 24px;
      font-weight: 600;
      color: #f0f6fc;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #f0f6fc;
      font-size: 14px;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
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
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 100px;
    }

    .custom-fields-section {
      grid-column: 1 / -1;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      background: #0d1117;
    }

    .custom-fields-section h4 {
      margin: 0 0 1rem 0;
      color: #f0f6fc;
      font-size: 16px;
      font-weight: 600;
    }

    .photos-section {
      grid-column: 1 / -1;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      background: #0d1117;
    }

    .photos-section h4 {
      margin: 0 0 1rem 0;
      color: #f0f6fc;
      font-size: 16px;
      font-weight: 600;
    }

    .photos-section h5 {
      margin: 1rem 0 0.5rem 0;
      color: #f0f6fc;
      font-size: 14px;
      font-weight: 500;
    }

    .photo-upload {
      margin-bottom: 1rem;
    }

    .photo-upload input[type="file"] {
      margin-bottom: 0.5rem;
      padding: 0.5rem;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      color: #f0f6fc;
      font-size: 14px;
    }

    .photo-preview {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .photo-preview img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #30363d;
    }

    .existing-photos {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .existing-photo {
      position: relative;
      display: inline-block;
    }

    .existing-photo img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #30363d;
    }

    .delete-photo-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #f85149;
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .delete-photo-btn:hover {
      background: #da3633;
      transform: scale(1.1);
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
    await Promise.all([
      this.loadItems(),
      this.loadCategories(),
      this.loadLocations(),
      this.loadCustomFields()
    ]);
  }

  private async loadItems() {
    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.items = await response.json();
      } else {
        console.error('Failed to load items');
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadCategories() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.categories = await response.json();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  private async loadLocations() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/locations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.locations = await response.json();
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  }

  private async loadCustomFields() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/custom-fields', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.customFieldDefs = await response.json();
      }
    } catch (error) {
      console.error('Error loading custom fields:', error);
    }
  }

  private get filteredAndSortedItems() {
    let filtered = this.items.filter(item => {
      const matchesSearch = !this.searchTerm || 
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
          const matchesCategory = !this.selectedCategory ||
      item.category_id === this.selectedCategory;
      
      const matchesLocation = !this.selectedLocation || 
        item.location_id?.toString() === this.selectedLocation;

      return matchesSearch && matchesCategory && matchesLocation;
    });

    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'purchase_date':
          if (!a.purchase_date && !b.purchase_date) return 0;
          if (!a.purchase_date) return 1;
          if (!b.purchase_date) return -1;
          return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
        case 'purchase_price':
          return (b.purchase_price || 0) - (a.purchase_price || 0);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }

  private showAddForm() {
    this.editingItem = null;
    this.formData = {
      name: '', description: '', location_id: '', category_id: '',
      quantity: '', model_number: '', serial_number: '', purchase_date: '',
      purchase_price: '', purchase_location: '', warranty: ''
    };
    // Initialize custom field values
    this.customFieldValues = {};
    this.customFieldDefs.forEach(field => {
      this.customFieldValues[field.name] = '';
    });
    this.showForm = true;
  }

  private async showEditForm(item: Item) {
    this.editingItem = item;
    this.formData = {
      name: item.name,
      description: item.description || '',
      location_id: item.location_id?.toString() || '',
      category_id: item.category_id?.toString() || '',
      quantity: item.quantity?.toString() || '',
      model_number: item.model_number || '',
      serial_number: item.serial_number || '',
      purchase_date: item.purchase_date || '',
      purchase_price: item.purchase_price?.toString() || '',
      purchase_location: item.purchase_location || '',
      warranty: item.warranty || ''
    };
    
    // Initialize custom field values from item
    this.customFieldValues = {};
    this.customFieldDefs.forEach(field => {
      this.customFieldValues[field.name] = item.custom_fields?.[field.name] || '';
    });
    
    // Load photos for editing
    await this.loadItemPhotos(item.id.toString());
    
    this.showForm = true;
  }

  private hideForm() {
    this.showForm = false;
    this.editingItem = null;
    this.customFieldValues = {};
    this.selectedFiles = [];
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!this.formData.name.trim()) {
      return;
    }

    // Check required custom fields
    for (const field of this.customFieldDefs) {
      if (field.required && !this.customFieldValues[field.name]?.toString().trim()) {
        alert(`${field.name} is required`);
        return;
      }
    }

    const submitData = {
      ...this.formData,
      location_id: this.formData.location_id || null,
      category_id: this.formData.category_id || null,
      quantity: this.formData.quantity ? parseInt(this.formData.quantity) : null,
      purchase_price: this.formData.purchase_price ? parseFloat(this.formData.purchase_price) : null,
      custom_fields: Object.keys(this.customFieldValues).length > 0 ? this.customFieldValues : null
    };

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const url = this.editingItem 
        ? `/api/items/${this.editingItem.id}`
        : '/api/items';
      
      const response = await fetch(url, {
        method: this.editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const savedItem = await response.json();
        
        // Upload photos if any were selected
        if (this.selectedFiles.length > 0) {
          await this.uploadPhotos(savedItem.id);
        }
        
        await this.loadItems();
        this.hideForm();
      } else {
        console.error('Failed to save item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      this.loading = false;
    }
  }

  private async deleteItem(item: Item) {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await this.loadItems();
      } else {
        console.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      this.loading = false;
    }
  }

  private handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    this.formData = { ...this.formData, [target.name]: target.value };
  }

  private handleCustomFieldChange(fieldName: string, value: any) {
    this.customFieldValues = { ...this.customFieldValues, [fieldName]: value };
  }

  private handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  private async uploadPhotos(itemId: string) {
    if (this.selectedFiles.length === 0) return;

    this.uploadingPhotos = true;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      this.selectedFiles.forEach(file => {
        formData.append('photos', file);
      });

      const response = await fetch(`/api/photos/items/${itemId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        this.selectedFiles = [];
        // Clear the file input
        const fileInput = this.shadowRoot?.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        console.error('Failed to upload photos');
        alert('Failed to upload photos');
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error uploading photos');
    } finally {
      this.uploadingPhotos = false;
    }
  }

  private async deletePhoto(photoId: string) {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh the item to update photos
        if (this.editingItem) {
          await this.loadItemPhotos(this.editingItem.id.toString());
        }
      } else {
        console.error('Failed to delete photo');
        alert('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error deleting photo');
    }
  }

  private async loadItemPhotos(itemId: string) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/photos/items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const photos = await response.json();
        if (this.editingItem) {
          this.editingItem = { ...this.editingItem, photos };
        }
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  }

  private renderCustomFieldInput(field: CustomField) {
    const value = this.customFieldValues[field.name] || '';
    
    switch (field.field_type) {
      case 'textarea':
        return html`
          <textarea
            .value="${value}"
            @input="${(e: Event) => this.handleCustomFieldChange(field.name, (e.target as HTMLTextAreaElement).value)}"
            ?required="${field.required}"
            placeholder="Enter ${field.name.toLowerCase()}"
          ></textarea>
        `;
      case 'number':
        return html`
          <input
            type="number"
            .value="${value}"
            @input="${(e: Event) => this.handleCustomFieldChange(field.name, (e.target as HTMLInputElement).value)}"
            ?required="${field.required}"
            placeholder="Enter ${field.name.toLowerCase()}"
          />
        `;
      case 'date':
        return html`
          <input
            type="date"
            .value="${value}"
            @input="${(e: Event) => this.handleCustomFieldChange(field.name, (e.target as HTMLInputElement).value)}"
            ?required="${field.required}"
          />
        `;
      case 'checkbox':
        return html`
          <div class="checkbox-group">
            <input
              type="checkbox"
              .checked="${value === true || value === 'true'}"
              @change="${(e: Event) => this.handleCustomFieldChange(field.name, (e.target as HTMLInputElement).checked)}"
            />
            <label>${field.name}</label>
          </div>
        `;
      case 'enum':
        return html`
          <select
            .value="${value}"
            @change="${(e: Event) => this.handleCustomFieldChange(field.name, (e.target as HTMLSelectElement).value)}"
            ?required="${field.required}"
          >
            <option value="">Select ${field.name.toLowerCase()}</option>
            ${field.options?.map(option => html`
              <option value="${option}">${option}</option>
            `)}
          </select>
        `;
      default:
        return html`
          <input
            type="text"
            .value="${value}"
            @input="${(e: Event) => this.handleCustomFieldChange(field.name, (e.target as HTMLInputElement).value)}"
            ?required="${field.required}"
            placeholder="Enter ${field.name.toLowerCase()}"
          />
        `;
    }
  }

  render() {
    if (this.loading && !this.items.length) {
      return html`<div class="loading">Loading items...</div>`;
    }

    const filteredItems = this.filteredAndSortedItems;

    return html`
      <div class="header">
        <h1>Items</h1>
        <button class="btn btn-primary" @click="${this.showAddForm}">
          Add Item
        </button>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search items..."
            .value="${this.searchTerm}"
            @input="${(e: Event) => this.searchTerm = (e.target as HTMLInputElement).value}"
          />
        </div>
        
        <div class="filter-group">
          <label>Category</label>
          <select .value="${this.selectedCategory}" @change="${(e: Event) => this.selectedCategory = (e.target as HTMLSelectElement).value}">
            <option value="">All Categories</option>
            ${this.categories.map(cat => html`
              <option value="${cat.id}">${cat.name}</option>
            `)}
          </select>
        </div>
        
        <div class="filter-group">
          <label>Location</label>
          <select .value="${this.selectedLocation}" @change="${(e: Event) => this.selectedLocation = (e.target as HTMLSelectElement).value}">
            <option value="">All Locations</option>
            ${this.locations.map(loc => html`
              <option value="${loc.id}">${loc.name}</option>
            `)}
          </select>
        </div>
        
        <div class="filter-group">
          <label>Sort By</label>
          <select .value="${this.sortBy}" @change="${(e: Event) => this.sortBy = (e.target as HTMLSelectElement).value}">
            <option value="name">Name</option>
            <option value="created_at">Date Added</option>
            <option value="purchase_date">Purchase Date</option>
            <option value="purchase_price">Purchase Price</option>
          </select>
        </div>
      </div>

      ${filteredItems.length === 0 ? html`
        <div class="empty-state">
          <p>${this.items.length === 0 ? 'No items yet. Add your first item to get started!' : 'No items match your current filters.'}</p>
        </div>
      ` : html`
        <div class="items-grid">
          ${filteredItems.map(item => html`
            <div class="item-card">
              ${item.first_photo ? html`
                <img 
                  src="/api/photos/files/${item.first_photo}" 
                  alt="${item.name}" 
                  class="item-photo"
                />
              ` : ''}
              <div class="item-content">
                <h3>${item.name}</h3>
              ${item.description ? html`
                <div class="item-description">${item.description}</div>
              ` : ''}
              
              <div class="item-details">
                ${item.location ? html`
                  <div class="item-detail">
                    <span class="item-detail-label">Location:</span>
                    <span class="item-detail-value">${item.location.name}</span>
                  </div>
                ` : ''}
                
                ${item.category ? html`
                  <div class="item-detail">
                    <span class="item-detail-label">Category:</span>
                    <span class="item-detail-value">${item.category.name}</span>
                  </div>
                ` : ''}
                
                ${item.quantity ? html`
                  <div class="item-detail">
                    <span class="item-detail-label">Quantity:</span>
                    <span class="item-detail-value">${item.quantity}</span>
                  </div>
                ` : ''}
                
                ${item.model_number ? html`
                  <div class="item-detail">
                    <span class="item-detail-label">Model:</span>
                    <span class="item-detail-value">${item.model_number}</span>
                  </div>
                ` : ''}
                
                ${item.serial_number ? html`
                  <div class="item-detail">
                    <span class="item-detail-label">Serial:</span>
                    <span class="item-detail-value">${item.serial_number}</span>
                  </div>
                ` : ''}
                
                ${item.purchase_price ? html`
                  <div class="item-detail">
                    <span class="item-detail-label">Price:</span>
                    <span class="item-detail-value">$${item.purchase_price}</span>
                  </div>
                ` : ''}
              </div>
              
              ${item.custom_fields && Object.keys(item.custom_fields).length > 0 ? html`
                <div class="custom-fields">
                  <h4>Additional Information</h4>
                  ${Object.entries(item.custom_fields).map(([key, value]) => html`
                    <div class="custom-field">
                      <span class="item-detail-label">${key}:</span>
                      <span class="item-detail-value">${value}</span>
                    </div>
                  `)}
                </div>
              ` : ''}
              
              <div class="item-meta">
                Created: ${new Date(item.created_at).toLocaleDateString()}
              </div>
                <div class="item-actions">
                  <button class="btn btn-secondary" @click="${() => this.showEditForm(item)}">
                    Edit
                  </button>
                  <button class="btn btn-danger" @click="${() => this.deleteItem(item)}">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          `)}
        </div>
      `}

      ${this.showForm ? html`
        <div class="form-overlay" @click="${(e: Event) => e.target === e.currentTarget && this.hideForm()}">
          <div class="form-container">
            <h2>${this.editingItem ? 'Edit' : 'Add'} Item</h2>
            <form @submit="${this.handleSubmit}">
              <div class="form-grid">
                <div class="form-group form-group-full">
                  <label for="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    .value="${this.formData.name}"
                    @input="${this.handleInputChange}"
                    required
                    placeholder="Item name"
                  />
                </div>
                
                <div class="form-group form-group-full">
                  <label for="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    .value="${this.formData.description}"
                    @input="${this.handleInputChange}"
                    placeholder="Item description"
                  ></textarea>
                </div>
                
                <div class="form-group">
                  <label for="location_id">Location</label>
                  <select
                    id="location_id"
                    name="location_id"
                    .value="${this.formData.location_id}"
                    @change="${this.handleInputChange}"
                  >
                    <option value="">Select location</option>
                    ${this.locations.map(loc => html`
                      <option value="${loc.id}">${loc.name}</option>
                    `)}
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="category_id">Category</label>
                  <select
                    id="category_id"
                    name="category_id"
                    .value="${this.formData.category_id}"
                    @change="${this.handleInputChange}"
                  >
                    <option value="">Select category</option>
                    ${this.categories.map(cat => html`
                      <option value="${cat.id}">${cat.name}</option>
                    `)}
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="quantity">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    .value="${this.formData.quantity}"
                    @input="${this.handleInputChange}"
                    min="0"
                    placeholder="0"
                  />
                </div>
                
                <div class="form-group">
                  <label for="model_number">Model Number</label>
                  <input
                    type="text"
                    id="model_number"
                    name="model_number"
                    .value="${this.formData.model_number}"
                    @input="${this.handleInputChange}"
                    placeholder="Model number"
                  />
                </div>
                
                <div class="form-group">
                  <label for="serial_number">Serial Number</label>
                  <input
                    type="text"
                    id="serial_number"
                    name="serial_number"
                    .value="${this.formData.serial_number}"
                    @input="${this.handleInputChange}"
                    placeholder="Serial number"
                  />
                </div>
                
                <div class="form-group">
                  <label for="purchase_date">Purchase Date</label>
                  <input
                    type="date"
                    id="purchase_date"
                    name="purchase_date"
                    .value="${this.formData.purchase_date}"
                    @input="${this.handleInputChange}"
                  />
                </div>
                
                <div class="form-group">
                  <label for="purchase_price">Purchase Price</label>
                  <input
                    type="number"
                    id="purchase_price"
                    name="purchase_price"
                    .value="${this.formData.purchase_price}"
                    @input="${this.handleInputChange}"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                
                <div class="form-group">
                  <label for="purchase_location">Purchase Location</label>
                  <input
                    type="text"
                    id="purchase_location"
                    name="purchase_location"
                    .value="${this.formData.purchase_location}"
                    @input="${this.handleInputChange}"
                    placeholder="Store or website"
                  />
                </div>
                
                <div class="form-group form-group-full">
                  <label for="warranty">Warranty</label>
                  <textarea
                    id="warranty"
                    name="warranty"
                    .value="${this.formData.warranty}"
                    @input="${this.handleInputChange}"
                    placeholder="Warranty information"
                  ></textarea>
                </div>

                <div class="photos-section">
                  <h4>Photos</h4>
                  
                  <div class="photo-upload">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      @change="${this.handleFileSelect}"
                    />
                    
                    ${this.selectedFiles.length > 0 ? html`
                      <div class="photo-preview">
                        ${this.selectedFiles.map(file => html`
                          <img src="${URL.createObjectURL(file)}" alt="Preview" />
                        `)}
                      </div>
                    ` : ''}
                  </div>
                  
                  ${this.editingItem?.photos?.length ? html`
                    <div class="existing-photos">
                      <h5>Existing Photos</h5>
                      ${this.editingItem.photos.map(photo => html`
                        <div class="existing-photo">
                          <img src="/api/photos/files/${photo.filename}" alt="${photo.original_name}" />
                          <button
                            type="button"
                            class="delete-photo-btn"
                            @click="${() => this.deletePhoto(photo.id)}"
                            title="Delete photo"
                          >
                            ×
                          </button>
                        </div>
                      `)}
                    </div>
                  ` : ''}
                </div>

                ${this.customFieldDefs.length > 0 ? html`
                  <div class="custom-fields-section">
                    <h4>Additional Information</h4>
                    <div class="form-grid">
                      ${this.customFieldDefs.map(field => html`
                        <div class="form-group">
                          <label for="custom_${field.id}">
                            ${field.name}${field.required ? ' *' : ''}
                          </label>
                          ${this.renderCustomFieldInput(field)}
                        </div>
                      `)}
                    </div>
                  </div>
                ` : ''}
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="${this.hideForm}">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" ?disabled="${this.loading}">
                  ${this.loading ? 'Saving...' : (this.editingItem ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}
    `;
  }
} 