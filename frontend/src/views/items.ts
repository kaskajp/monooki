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
  expiration_date?: string;
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
    warranty: '',
    expiration_date: ''
  };

  @state()
  customFieldValues: Record<string, any> = {};

  @state()
  selectedFiles: File[] = [];

  @state()
  uploadingPhotos = false;

  @state()
  amazonUrl = '';

  @state()
  loadingAmazonData = false;
  
  @state()
  downloadedImageData: Array<{filename: string, original_name: string, mime_type: string, size: number}> = [];

  @state()
  userCurrency = 'USD';

  @state()
  visibleColumns: Record<string, boolean> = {
    photo: true,
    label: true,
    name: true,
    category: true,
    location: true,
    quantity: true,
    price: true,
    expiration: true,
    created: true
  };

  private defaultColumns = {
    photo: true,
    label: true,
    name: true,
    category: true,
    location: true,
    quantity: true,
    price: true,
    expiration: true,
    created: true
  };

  @state()
  showColumnSelector = false;

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
      min-width: 200px;
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

    .item-expiration {
      font-size: var(--font-size-sm);
    }

    .item-expiration.expired {
      color: #ff6b6b;
      font-weight: var(--font-weight-semibold);
    }

    .item-expiration.expiring-soon {
      color: #ffa500;
      font-weight: var(--font-weight-semibold);
    }

    .item-expiration.expiring-warning {
      color: #ffeb3b;
      font-weight: var(--font-weight-medium);
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

    .amazon-import-section {
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .amazon-import-section h3 {
      margin: 0 0 16px 0;
      color: #f0f6fc;
      font-size: 18px;
      font-weight: 600;
    }

    .amazon-url-input {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }

    .amazon-url-input input {
      flex: 1;
      padding: 12px;
      background: var(--form-bg);
      border: 1px solid var(--form-border);
      border-radius: var(--radius-md);
      color: var(--form-text);
      font-size: 14px;
      font-family: var(--font-family-primary);
      transition: all var(--transition-normal);
      box-sizing: border-box;
    }

    .amazon-url-input input::placeholder {
      color: #8b949e;
    }

    .amazon-url-input input:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
    }

    .amazon-url-input input:disabled {
      background-color: #21262d;
      opacity: 0.6;
    }

    .amazon-help {
      margin: 0;
      font-size: 14px;
      color: #8b949e;
      font-style: italic;
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

    .column-selector {
      position: relative;
      display: inline-block;
    }

    .column-selector-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .column-selector-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      min-width: 250px;
      z-index: 1000;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      margin-top: 0.5rem;
      display: block;
    }

    .column-selector-dropdown h4 {
      margin: 0 0 var(--spacing-lg) 0;
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
    }

    .column-option {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-sm) 0;
      cursor: pointer;
    }

    .column-option input[type="checkbox"] {
      margin: 0;
      width: auto;
    }

    .column-option label {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      cursor: pointer;
      flex: 1;
    }

    .column-option:hover {
      background: var(--color-bg-primary);
      border-radius: var(--radius-sm);
      margin: 0 calc(var(--spacing-sm) * -1);
      padding: var(--spacing-sm);
    }

    .name-column {
      min-width: 200px;
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    
    // Load sort preferences first (before URL parameters so URL can override)
    this.loadSortPreferences();
    
    // Check URL parameters for initial filter/sort state (can override preferences)
    this.parseUrlParameters();
    
    // Load cached data first (synchronous)
    await this.loadCategories();
    await this.loadLocations(); 
    await this.loadCustomFields();
    await this.loadUserCurrency();
    
    // Load column preferences after custom fields are loaded
    this.loadColumnPreferences();
    
    // Then load items (which isn't cached and is component-specific)
    await this.loadItems();

    // Add click listener to close column selector when clicking outside
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  private handleDocumentClick(event: Event) {
    const target = event.target as Element;
    if (this.showColumnSelector && !target.closest('.column-selector')) {
      this.showColumnSelector = false;
    }
  }

  private loadColumnPreferences() {
    try {
      const saved = localStorage.getItem('items-visible-columns');
      let savedColumns = {};
      
      if (saved) {
        savedColumns = JSON.parse(saved);
      }

      // Start with default columns
      this.visibleColumns = { ...this.defaultColumns };
      
      // Add custom fields (default to false so they're hidden by default)
      this.customFieldDefs.forEach(field => {
        this.visibleColumns[`custom_${field.id}`] = false;
      });
      
      // Apply saved preferences
      this.visibleColumns = {
        ...this.visibleColumns,
        ...savedColumns,
        // Always ensure name column is visible
        name: true
      };
    } catch (error) {
      console.error('Error loading column preferences:', error);
      // Fall back to defaults if there's an error
      this.visibleColumns = { ...this.defaultColumns };
      // Still add custom fields even on error
      this.customFieldDefs.forEach(field => {
        this.visibleColumns[`custom_${field.id}`] = false;
      });
    }
  }

  private saveColumnPreferences() {
    try {
      localStorage.setItem('items-visible-columns', JSON.stringify(this.visibleColumns));
    } catch (error) {
      console.error('Error saving column preferences:', error);
    }
  }

  private loadSortPreferences() {
    try {
      const saved = localStorage.getItem('items-sort-by');
      if (saved && ['name', 'created_at', 'purchase_date', 'expiration_date', 'purchase_price', 'quantity'].includes(saved)) {
        this.sortBy = saved;
      }
    } catch (error) {
      console.error('Error loading sort preferences:', error);
      // Fall back to default 'name' if there's an error
      this.sortBy = 'name';
    }
  }

  private saveSortPreferences() {
    try {
      localStorage.setItem('items-sort-by', this.sortBy);
    } catch (error) {
      console.error('Error saving sort preferences:', error);
    }
  }

  private handleSortChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.sortBy = target.value;
    this.saveSortPreferences();
  }

  private async loadUserCurrency() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/currency-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const settings = await response.json();
        this.userCurrency = settings.currency || 'USD';
      }
    } catch (error) {
      console.error('Error loading currency settings:', error);
      // Keep default USD if loading fails
    }
  }

  private parseUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Set sort if provided in URL
    const sort = urlParams.get('sort');
    if (sort && ['name', 'created_at', 'purchase_date', 'expiration_date', 'purchase_price', 'quantity'].includes(sort)) {
      this.sortBy = sort;
    }
    
    // Set category filter if provided in URL
    const category = urlParams.get('category');
    if (category) {
      this.selectedCategory = category;
    }
    
    // Set location filter if provided in URL
    const location = urlParams.get('location');
    if (location) {
      this.selectedLocation = location;
    }
    
    // Set search term if provided in URL
    const search = urlParams.get('search');
    if (search) {
      this.searchTerm = search;
    }
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
        const rawItems = await response.json();
        // Transform the API response to match our Item interface
        this.items = rawItems.map((item: any) => ({
          ...item,
          location: item.location_id && item.location_name ? 
            { id: item.location_id, name: item.location_name } : 
            undefined,
          category: item.category_id && item.category_name ? 
            { id: item.category_id, name: item.category_name } : 
            undefined
        }));
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
        case 'expiration_date':
          if (!a.expiration_date && !b.expiration_date) return 0;
          if (!a.expiration_date) return 1;
          if (!b.expiration_date) return -1;
          return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
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
      purchase_price: '', purchase_location: '', warranty: '', expiration_date: ''
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
      warranty: item.warranty || '',
      expiration_date: item.expiration_date || ''
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
    this.amazonUrl = '';
    this.downloadedImageData = [];
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
        
        // Save downloaded images if any exist
        if (this.downloadedImageData.length > 0) {
          await this.saveDownloadedImages(savedItem.id);
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

  private async handleAmazonUrlParse() {
    if (!this.amazonUrl.trim()) {
      alert('Please enter an Amazon URL');
      return;
    }

    this.loadingAmazonData = true;
    
    try {
      const response = await fetch('/api/items/parse-amazon-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ url: this.amazonUrl.trim() })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to parse Amazon URL');
      }

      if (result.success && result.data) {
        const data = result.data;
        
        // Auto-populate form fields
        this.formData = {
          ...this.formData,
          name: data.name || this.formData.name,
          description: data.description || this.formData.description,
          model_number: data.model_number || this.formData.model_number,
          purchase_price: data.purchase_price ? data.purchase_price.toString() : this.formData.purchase_price,
          purchase_location: data.purchase_location || this.formData.purchase_location
        };

        // Handle downloaded images
        if (data.downloadedImages && data.downloadedImages.length > 0) {
          this.downloadedImageData = data.downloadedImages;
          // Show preview of downloaded images
          const imageFiles = [];
          for (const img of data.downloadedImages) {
            try {
              // Create a blob from the downloaded image for preview
              const response = await fetch(`/api/photos/files/${img.filename}`);
              const blob = await response.blob();
              const file = new File([blob], img.original_name, { type: img.mime_type });
              imageFiles.push(file);
            } catch (error) {
              console.error('Error loading downloaded image:', error);
            }
          }
          this.selectedFiles = imageFiles;
        }

        // Clear the URL field
        this.amazonUrl = '';
        
        alert('Amazon product data loaded successfully!');
      }
      
    } catch (error) {
      console.error('Error parsing Amazon URL:', error);
      alert(error instanceof Error ? error.message : 'Failed to parse Amazon URL');
    } finally {
      this.loadingAmazonData = false;
    }
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

  private getExpirationClass(expirationDate: string): string {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'expired';
    } else if (diffDays <= 7) {
      return 'expiring-soon';
    } else if (diffDays <= 30) {
      return 'expiring-warning';
    }
    return '';
  }

  private toggleColumnSelector(e?: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.showColumnSelector = !this.showColumnSelector;
  }

  private toggleColumn(column: string) {
    // Don't allow hiding the name column (it's essential)
    if (column === 'name') return;
    
    this.visibleColumns = {
      ...this.visibleColumns,
      [column]: !this.visibleColumns[column]
    };
    
    // Save preferences to localStorage
    this.saveColumnPreferences();
  }

  private formatCurrency(amount: number): string {
    if (!amount) return '';
    
    // Find the appropriate locale for the currency
    const currencyLocales: { [key: string]: string } = {
      'USD': 'en-US',
      'EUR': 'en-EU', 
      'GBP': 'en-GB',
      'JPY': 'ja-JP',
      'CAD': 'en-CA',
      'AUD': 'en-AU',
      'CHF': 'de-CH',
      'CNY': 'zh-CN',
      'SEK': 'sv-SE',
      'NZD': 'en-NZ',
      'MXN': 'es-MX',
      'SGD': 'en-SG',
      'HKD': 'en-HK',
      'NOK': 'no-NO',
      'KRW': 'ko-KR',
      'TRY': 'tr-TR',
      'RUB': 'ru-RU',
      'INR': 'en-IN',
      'BRL': 'pt-BR',
      'ZAR': 'en-ZA'
    };

    const locale = currencyLocales[this.userCurrency] || 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.userCurrency
    }).format(amount);
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

  private async saveDownloadedImages(itemId: string) {
    if (this.downloadedImageData.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/items/${itemId}/add-downloaded-photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ photos: this.downloadedImageData })
      });

      if (response.ok) {
        this.downloadedImageData = [];
      } else {
        console.error('Failed to save downloaded images');
        alert('Failed to save downloaded images');
      }
    } catch (error) {
      console.error('Error saving downloaded images:', error);
      alert('Error saving downloaded images');
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

  private renderCustomFieldValue(field: CustomField, item: Item): string {
    const value = item.custom_fields?.[field.name];
    
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    
    switch (field.field_type) {
      case 'checkbox':
        return value ? 'Yes' : 'No';
      case 'date':
        if (value) {
          try {
            return new Date(value).toLocaleDateString();
          } catch {
            return String(value);
          }
        }
        return '—';
      case 'number':
        return String(value);
      default:
        return String(value);
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
        <div style="display: flex; gap: 1rem; align-items: center;">
          <div class="column-selector">
            <button 
              class="column-selector-btn" 
              @click="${(e: Event) => this.toggleColumnSelector(e)}"
              style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: var(--spacing-md);
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border-primary);
                border-radius: var(--radius-md);
                color: var(--color-text-primary);
                font-size: var(--font-size-sm);
                cursor: pointer;
                transition: all var(--transition-normal);
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>row-table</title><g fill="#FFFFFF"><line x1="0.5" y1="5.5" x2="15.5" y2="5.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><line x1="5.5" y1="0.5" x2="5.5" y2="15.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><path d="M14,15.5H2A1.5,1.5,0,0,1,.5,14V2A1.5,1.5,0,0,1,2,.5H14A1.5,1.5,0,0,1,15.5,2V14A1.5,1.5,0,0,1,14,15.5Z" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
              Columns
            </button>
            ${this.showColumnSelector ? html`
              <div class="column-selector-dropdown" @click="${(e: Event) => e.stopPropagation()}">
                <h4>Show/Hide Columns</h4>
                <div class="column-option">
                  <input
                    type="checkbox"
                    id="col-photo"
                    .checked="${this.visibleColumns.photo}"
                    @change="${() => this.toggleColumn('photo')}"
                  />
                  <label for="col-photo">Photo</label>
                </div>
                <div class="column-option">
                  <input
                    type="checkbox"
                    id="col-label"
                    .checked="${this.visibleColumns.label}"
                    @change="${() => this.toggleColumn('label')}"
                  />
                  <label for="col-label">Label</label>
                </div>
                <div class="column-option">
                  <input
                    type="checkbox"
                    id="col-name"
                    .checked="${this.visibleColumns.name}"
                    disabled
                    title="Name column cannot be hidden"
                  />
                  <label for="col-name">Name (required)</label>
                </div>
                <div class="column-option">
                  <input
                    type="checkbox"
                    id="col-category"
                    .checked="${this.visibleColumns.category}"
                    @change="${() => this.toggleColumn('category')}"
                  />
                  <label for="col-category">Category</label>
                </div>
                <div class="column-option">
                  <input
                    type="checkbox"
                    id="col-location"
                    .checked="${this.visibleColumns.location}"
                    @change="${() => this.toggleColumn('location')}"
                  />
                  <label for="col-location">Location</label>
                </div>
                <div class="column-option">
                  <input
                    type="checkbox"
                    id="col-quantity"
                    .checked="${this.visibleColumns.quantity}"
                    @change="${() => this.toggleColumn('quantity')}"
                  />
                  <label for="col-quantity">Quantity</label>
                </div>
                <div class="column-option">
                  <input
                    type="checkbox"
                    id="col-price"
                    .checked="${this.visibleColumns.price}"
                    @change="${() => this.toggleColumn('price')}"
                  />
                  <label for="col-price">Price</label>
                </div>
                <div class="column-option">
                  <input
                    type="checkbox"
                    id="col-expiration"
                    .checked="${this.visibleColumns.expiration}"
                    @change="${() => this.toggleColumn('expiration')}"
                  />
                  <label for="col-expiration">Expiration</label>
                </div>
                <div class="column-option">
                  <input
                    type="checkbox"
                    id="col-created"
                    .checked="${this.visibleColumns.created}"
                    @change="${() => this.toggleColumn('created')}"
                  />
                  <label for="col-created">Created</label>
                </div>
                ${this.customFieldDefs.length > 0 ? html`
                  <hr style="border: none; border-top: 1px solid var(--color-border-primary); margin: var(--spacing-md) 0;">
                  <h4 style="margin: 0 0 var(--spacing-md) 0; color: var(--color-text-secondary); font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.5px;">Custom Fields</h4>
                  ${this.customFieldDefs.map(field => html`
                    <div class="column-option">
                      <input
                        type="checkbox"
                        id="col-custom-${field.id}"
                        .checked="${this.visibleColumns[`custom_${field.id}`] || false}"
                        @change="${() => this.toggleColumn(`custom_${field.id}`)}"
                      />
                      <label for="col-custom-${field.id}">${field.name}</label>
                    </div>
                  `)}
                ` : ''}
              </div>
            ` : ''}
          </div>
          <app-button variant="primary" @button-click="${this.showAddForm}">
            Add Item
          </app-button>
        </div>
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
          <select .value="${this.sortBy}" @change="${(e: Event) => this.handleSortChange(e)}">
            <option value="name">Name</option>
            <option value="created_at">Date Created</option>
            <option value="purchase_date">Purchase Date</option>
            <option value="expiration_date">Expiration Date</option>
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
                ${this.visibleColumns.photo ? html`<th>Photo</th>` : ''}
                ${this.visibleColumns.label ? html`<th>Label</th>` : ''}
                ${this.visibleColumns.name ? html`<th class="name-column">Name</th>` : ''}
                ${this.visibleColumns.category ? html`<th>Category</th>` : ''}
                ${this.visibleColumns.location ? html`<th>Location</th>` : ''}
                ${this.visibleColumns.quantity ? html`<th>Quantity</th>` : ''}
                ${this.visibleColumns.price ? html`<th>Price</th>` : ''}
                ${this.visibleColumns.expiration ? html`<th>Expiration</th>` : ''}
                ${this.visibleColumns.created ? html`<th>Created</th>` : ''}
                ${this.customFieldDefs.map(field => 
                  this.visibleColumns[`custom_${field.id}`] ? html`<th>${field.name}</th>` : ''
                )}
                <th class="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.filteredAndSortedItems.map(item => html`
                <tr @click="${(e: Event) => this.handleRowClick(item, e)}">
                  ${this.visibleColumns.photo ? html`
                    <td>
                      ${item.first_photo ? html`
                        <img class="item-photo" src="/api/photos/files/${item.first_photo}" alt="${item.name}" />
                      ` : html`
                        <div class="no-photo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>no-photo</title><g fill="#FFFFFF" stroke-miterlimit="10"><path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" d="M5.525,10.475 C4.892,9.842,4.5,8.967,4.5,8c0-1.933,1.567-3.5,3.5-3.5c0.966,0,1.841,0.392,2.475,1.025"></path> <path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" d="M11.355,7 C11.449,7.317,11.5,7.652,11.5,8c0,1.933-1.567,3.5-3.5,3.5c-0.348,0-0.683-0.051-1-0.145"></path> <path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" d="M5.5,13.5h9 c0.552,0,1-0.448,1-1v-9"></path> <path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" d="M13.5,2.5h-2l-1-2h-5 l-1,2h-3c-0.552,0-1,0.448-1,1v9c0,0.552,0.448,1,1,1h1"></path> <line fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" x1="0.5" y1="15.5" x2="15.5" y2="0.5"></line></g></svg></div>
                      `}
                    </td>
                  ` : ''}
                  ${this.visibleColumns.label ? html`
                    <td>
                      ${item.label_id ? html`
                        <span class="badge badge--label">${item.label_id}</span>
                      ` : html`
                        <span class="empty-label">—</span>
                      `}
                    </td>
                  ` : ''}
                  ${this.visibleColumns.name ? html`
                    <td class="name-column">
                      <div class="item-name">${item.name}</div>
                    </td>
                  ` : ''}
                  ${this.visibleColumns.category ? html`
                    <td>
                      <div class="item-category">${item.category?.name || '—'}</div>
                    </td>
                  ` : ''}
                  ${this.visibleColumns.location ? html`
                    <td>
                      <div class="item-location">${item.location?.name || '—'}</div>
                    </td>
                  ` : ''}
                  ${this.visibleColumns.quantity ? html`
                    <td>
                      <div class="item-quantity">${item.quantity || 1}</div>
                    </td>
                  ` : ''}
                  ${this.visibleColumns.price ? html`
                    <td>
                      <div class="item-price">
                        ${item.purchase_price ? this.formatCurrency(item.purchase_price) : '—'}
                      </div>
                    </td>
                  ` : ''}
                  ${this.visibleColumns.expiration ? html`
                    <td>
                      <div class="item-expiration ${item.expiration_date ? this.getExpirationClass(item.expiration_date) : ''}">
                        ${item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : '—'}
                      </div>
                    </td>
                  ` : ''}
                  ${this.visibleColumns.created ? html`
                    <td>
                      <div class="item-date">${new Date(item.created_at).toLocaleDateString()}</div>
                    </td>
                  ` : ''}
                  ${this.customFieldDefs.map(field => 
                    this.visibleColumns[`custom_${field.id}`] ? html`
                      <td>
                        <div class="item-custom-field" style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">
                          ${this.renderCustomFieldValue(field, item)}
                        </div>
                      </td>
                    ` : ''
                  )}
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
            
            ${!this.editingItem ? html`
              <div class="amazon-import-section">
                <h3>Import from Amazon</h3>
                <div class="amazon-url-input">
                  <input
                    type="url"
                    .value="${this.amazonUrl}"
                    @input="${(e: Event) => this.amazonUrl = (e.target as HTMLInputElement).value}"
                    placeholder="Paste Amazon product URL here..."
                    ?disabled="${this.loadingAmazonData}"
                  />
                  <app-button 
                    type="button" 
                    variant="secondary" 
                    ?loading="${this.loadingAmazonData}"
                    ?disabled="${!this.amazonUrl.trim() || this.loadingAmazonData}"
                    @button-click="${this.handleAmazonUrlParse}"
                  >
                    ${this.loadingAmazonData ? 'Loading...' : 'Import'}
                  </app-button>
                </div>
                <p class="amazon-help">Enter an Amazon product URL to automatically fill the form fields below.</p>
              </div>
            ` : ''}
            
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
                    @change="${this.handleInputChange}"
                  >
                    <option value="" ?selected="${!this.formData.location_id}">Select location</option>
                    ${this.locations.map(loc => html`
                      <option value="${loc.id}" ?selected="${this.formData.location_id === loc.id}">${loc.name}</option>
                    `)}
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="category_id">Category</label>
                  <select
                    id="category_id"
                    name="category_id"
                    @change="${this.handleInputChange}"
                  >
                    <option value="" ?selected="${!this.formData.category_id}">Select category</option>
                    ${this.categories.map(cat => html`
                      <option value="${cat.id}" ?selected="${this.formData.category_id === cat.id}">${cat.name}</option>
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
                
                <div class="form-group">
                  <label for="expiration_date">Expiration Date</label>
                  <input
                    type="date"
                    id="expiration_date"
                    name="expiration_date"
                    .value="${this.formData.expiration_date}"
                    @input="${this.handleInputChange}"
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