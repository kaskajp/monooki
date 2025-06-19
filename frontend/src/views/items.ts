import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../components/button.js';

interface Item {
  id: string;
  label_id?: string;
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

  // Add simple caching to prevent redundant API calls
  private static cachedData: {
    categories?: Category[];
    locations?: Location[];
    customFields?: CustomField[];
    cacheTime?: number;
  } = {};

  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

    .filters {
      display: flex;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-2xl);
      flex-wrap: wrap;
      padding: var(--spacing-xl);
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      min-width: 200px;
    }

    .filter-group label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filter-group input,
    .filter-group select {
      padding: var(--spacing-md);
      background: var(--form-bg);
      border: 1px solid var(--form-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      color: var(--form-text);
      font-family: var(--font-family-primary);
      transition: all var(--transition-normal);
    }

    .filter-group input::placeholder {
      color: var(--form-placeholder);
    }

    .filter-group input:focus,
    .filter-group select:focus {
      outline: none;
      border-color: var(--form-border-focus);
      box-shadow: var(--shadow-focus);
    }



    .items-table {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      overflow: hidden;
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

    tbody tr {
      cursor: pointer;
      transition: background-color var(--transition-normal);
    }

    tbody tr:hover {
      background: #0d1117;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .actions-cell {
      text-align: right;
      width: 150px;
    }

    .item-actions {
      position: relative;
      z-index: 10;
    }

    .item-name {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      font-size: var(--font-size-base);
    }

    .item-description {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
    }

    .item-location,
    .item-category {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .item-quantity {
      color: var(--color-accent-primary);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
    }

    .item-price {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
    }

    .item-date {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .item-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .item-photo {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      border: 1px solid var(--color-border-secondary);
    }

    .no-photo {
      width: 40px;
      height: 40px;
      background: var(--color-bg-tertiary);
      border: 1px solid var(--color-border-secondary);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
    }

    /* Global badge styles */
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
      display: inline-block;
      text-transform: capitalize;
    }

    .badge--required {
      background: var(--color-accent-primary);
      color: white;
      font-weight: var(--font-weight-semibold);
    }

    .badge--optional {
      background: var(--color-bg-tertiary);
      color: var(--color-text-secondary);
    }

    .badge--type {
      background: var(--color-bg-tertiary);
      color: var(--color-text-secondary);
    }

    .badge--label {
      background: var(--color-accent-primary);
      color: white;
      font-weight: var(--font-weight-semibold);
      font-family: 'Courier New', monospace;
      text-transform: none;
    }

    .empty-label {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .readonly-field {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--color-bg-tertiary);
      border: 1px solid var(--color-border-secondary);
      border-radius: var(--radius-md);
    }

    .readonly-note {
      color: var(--color-text-tertiary);
      font-size: var(--font-size-xs);
      font-style: italic;
    }

    .readonly-placeholder {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-style: italic;
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
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
    
    // Load cached data first (synchronous)
    await this.loadCategories();
    await this.loadLocations(); 
    await this.loadCustomFields();
    
    // Then load items (which isn't cached and is component-specific)
    await this.loadItems();
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
    // Check cache first
    const cache = ItemsPage.cachedData;
    const now = Date.now();
    
    if (cache.categories && cache.cacheTime && (now - cache.cacheTime) < ItemsPage.CACHE_DURATION) {
      this.categories = cache.categories;
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.categories = await response.json();
        // Update cache
        cache.categories = this.categories;
        cache.cacheTime = now;
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  private async loadLocations() {
    // Check cache first
    const cache = ItemsPage.cachedData;
    const now = Date.now();
    
    if (cache.locations && cache.cacheTime && (now - cache.cacheTime) < ItemsPage.CACHE_DURATION) {
      this.locations = cache.locations;
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/locations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.locations = await response.json();
        // Update cache
        cache.locations = this.locations;
        cache.cacheTime = now;
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  }

  private async loadCustomFields() {
    // Check cache first
    const cache = ItemsPage.cachedData;
    const now = Date.now();
    
    if (cache.customFields && cache.cacheTime && (now - cache.cacheTime) < ItemsPage.CACHE_DURATION) {
      this.customFieldDefs = cache.customFields;
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/custom-fields', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.customFieldDefs = await response.json();
        // Update cache
        cache.customFields = this.customFieldDefs;
        cache.cacheTime = now;
      }
    } catch (error) {
      console.error('Error loading custom fields:', error);
    }
  }

  // Static method to get cached custom fields for other components
  static getCachedCustomFields(): CustomField[] | null {
    const cache = ItemsPage.cachedData;
    const now = Date.now();
    
    if (cache.customFields && cache.cacheTime && (now - cache.cacheTime) < ItemsPage.CACHE_DURATION) {
      return cache.customFields;
    }
    
    return null;
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

  // Public method to edit an item by ID (called from item view)
  public async editItemById(itemId: string) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      await this.showEditForm(item);
    }
  }

  // Public method to open create modal (called from command center)
  public openCreateModal() {
    this.showAddForm();
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    console.log('Form submitted:', this.formData);
    
    // Handle both native form events and custom button-click events
    if (e.type === 'button-click') {
      // For button-click events, we need to prevent the default form submission
      // since we're handling it manually
      const form = this.shadowRoot?.querySelector('form');
      if (form) {
        // Prevent any potential form submission
        form.addEventListener('submit', (formEvent) => formEvent.preventDefault(), { once: true });
      }
    }
    
    if (!this.formData.name.trim()) {
      alert('Please enter an item name');
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
        
        // If creating a new item, navigate to its view page
        if (!this.editingItem) {
          window.location.href = `/items/${savedItem.id}`;
          return;
        }
        
        // If editing, reload items and close form
        await this.loadItems();
        this.hideForm();
      } else {
        const errorData = await response.text();
        console.error('Failed to save item:', response.status, errorData);
        alert(`Failed to save item: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item. Please check your connection and try again.');
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

  private handleRowClick(item: Item, event: Event) {
    // Don't navigate if clicking on action buttons
    if ((event.target as HTMLElement).closest('.item-actions')) {
      return;
    }
    
    // Navigate to item view
    window.location.href = `/items/${item.id}`;
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

    return html`
      <div class="header">
        <h1>Items</h1>
        <app-button variant="primary" @button-click="${this.showAddForm}">
          Add Item
        </app-button>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Search</label>
          <input
            type="text"
            .value="${this.searchTerm}"
            @input="${(e: Event) => this.searchTerm = (e.target as HTMLInputElement).value}"
            placeholder="Search items..."
          />
        </div>
        <div class="filter-group">
          <label>Category</label>
          <select .value="${this.selectedCategory}" @change="${(e: Event) => this.selectedCategory = (e.target as HTMLSelectElement).value}">
            <option value="">All Categories</option>
            ${this.categories.map(category => html`
              <option value="${category.id}">${category.name}</option>
            `)}
          </select>
        </div>
        <div class="filter-group">
          <label>Location</label>
          <select .value="${this.selectedLocation}" @change="${(e: Event) => this.selectedLocation = (e.target as HTMLSelectElement).value}">
            <option value="">All Locations</option>
            ${this.locations.map(location => html`
              <option value="${location.id}">${location.name}</option>
            `)}
          </select>
        </div>
        <div class="filter-group">
          <label>Sort By</label>
          <select .value="${this.sortBy}" @change="${(e: Event) => this.sortBy = (e.target as HTMLSelectElement).value}">
            <option value="name">Name</option>
            <option value="created_at">Date Created</option>
            <option value="purchase_date">Purchase Date</option>
            <option value="purchase_price">Price</option>
            <option value="quantity">Quantity</option>
          </select>
        </div>
      </div>

      ${this.filteredAndSortedItems.length === 0 ? html`
        <div class="empty-state">
          <p>No items found. ${this.items.length === 0 ? 'Create your first item to get started!' : 'Try adjusting your filters.'}</p>
        </div>
      ` : html`
        <div class="items-table">
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Label</th>
                <th>Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Created</th>
                <th class="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.filteredAndSortedItems.map(item => html`
                <tr @click="${(e: Event) => this.handleRowClick(item, e)}">
                  <td>
                    ${item.first_photo ? html`
                      <img class="item-photo" src="/api/photos/files/${item.first_photo}" alt="${item.name}" />
                    ` : html`
                      <div class="no-photo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>no-photo</title><g fill="#FFFFFF" stroke-miterlimit="10"><path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" d="M5.525,10.475 C4.892,9.842,4.5,8.967,4.5,8c0-1.933,1.567-3.5,3.5-3.5c0.966,0,1.841,0.392,2.475,1.025"></path> <path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" d="M11.355,7 C11.449,7.317,11.5,7.652,11.5,8c0,1.933-1.567,3.5-3.5,3.5c-0.348,0-0.683-0.051-1-0.145"></path> <path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" d="M5.5,13.5h9 c0.552,0,1-0.448,1-1v-9"></path> <path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" d="M13.5,2.5h-2l-1-2h-5 l-1,2h-3c-0.552,0-1,0.448-1,1v9c0,0.552,0.448,1,1,1h1"></path> <line fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" x1="0.5" y1="15.5" x2="15.5" y2="0.5"></line></g></svg></div>
                    `}
                  </td>
                  <td>
                    ${item.label_id ? html`
                      <span class="badge badge--label">${item.label_id}</span>
                    ` : html`
                      <span class="empty-label">—</span>
                    `}
                  </td>
                  <td>
                    <div class="item-name">${item.name}</div>
                    ${item.description ? html`
                      <div class="item-description">${item.description}</div>
                    ` : ''}
                  </td>
                  <td>
                    <div class="item-category">${item.category?.name || '—'}</div>
                  </td>
                  <td>
                    <div class="item-location">${item.location?.name || '—'}</div>
                  </td>
                  <td>
                    <div class="item-quantity">${item.quantity || 1}</div>
                  </td>
                  <td>
                    <div class="item-price">
                      ${item.purchase_price ? `$${item.purchase_price}` : '—'}
                    </div>
                  </td>
                  <td>
                    <div class="item-date">${new Date(item.created_at).toLocaleDateString()}</div>
                  </td>
                  <td class="actions-cell">
                    <div class="item-actions">
                      <app-button variant="secondary" size="sm" icon-only @button-click="${() => this.showEditForm(item)}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 pen 01</title><g fill="currentColor" class="nc-icon-wrapper"><line id="butt_color" data-name="butt color" x1="13" y1="7" x2="9" y2="3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-cap="butt" data-color="color-2"></line> <polygon points="5.5 14.5 0.5 15.5 1.5 10.5 11.5 0.5 15.5 4.5 5.5 14.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-cap="butt"></polygon></g></svg>
                      </app-button>
                      <app-button variant="danger" size="sm" icon-only @button-click="${() => this.deleteItem(item)}">
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
                  <label>Label ID</label>
                  <div class="readonly-field">
                    ${this.editingItem?.label_id ? html`
                      <span class="badge badge--label">${this.editingItem.label_id}</span>
                      <span class="readonly-note">(auto-generated)</span>
                    ` : html`
                      <span class="readonly-placeholder">Will be auto-generated</span>
                      <span class="readonly-note">(assigned after creation)</span>
                    `}
                  </div>
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
                <app-button type="button" variant="secondary" @button-click="${this.hideForm}">
                  Cancel
                </app-button>
                <app-button 
                  type="submit" 
                  variant="primary" 
                  ?loading="${this.loading}"
                  @button-click="${this.handleSubmit}"
                >
                  ${this.editingItem ? 'Update' : 'Create'}
                </app-button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}
    `;
  }
} 