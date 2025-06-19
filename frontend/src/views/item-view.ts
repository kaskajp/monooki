import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
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

@customElement('item-view')
export class ItemView extends LitElement {
  @property()
  itemId = '';

  @state()
  private item: Item | null = null;

  @state()
  private customFieldDefs: CustomField[] = [];

  @state()
  private loading = true;

  @state()
  private selectedPhotoIndex = 0;

  @state()
  private showPhotoModal = false;

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
      align-items: flex-start;
      margin-bottom: var(--spacing-2xl);
      gap: var(--spacing-xl);
    }

    .header-content {
      flex: 1;
    }

    .header h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .header p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      line-height: var(--line-height-relaxed);
    }

    .actions {
      display: flex;
      gap: var(--spacing-md);
    }

    .content {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: var(--spacing-2xl);
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .photos-section {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .photos-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border-primary);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .photos-header h3 {
      margin: 0;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }

    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
    }

    .photo-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      transition: transform var(--transition-normal);
    }

    .photo-item:hover {
      transform: scale(1.05);
    }

    .photo-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .photo-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity var(--transition-normal);
    }

    .photo-item:hover .photo-overlay {
      opacity: 1;
    }

    .photo-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--spacing-xl);
    }

    .photo-modal img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: var(--radius-md);
    }

    .photo-modal-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.7);
      border: none;
      color: white;
      padding: var(--spacing-lg);
      cursor: pointer;
      border-radius: var(--radius-md);
      font-size: var(--font-size-xl);
    }

    .photo-modal-nav.prev {
      left: var(--spacing-xl);
    }

    .photo-modal-nav.next {
      right: var(--spacing-xl);
    }

    .photo-modal-close {
      position: absolute;
      top: var(--spacing-xl);
      right: var(--spacing-xl);
      background: rgba(0, 0, 0, 0.7);
      border: none;
      color: white;
      padding: var(--spacing-md);
      cursor: pointer;
      border-radius: var(--radius-md);
      font-size: var(--font-size-lg);
    }

    .no-photos {
      padding: var(--spacing-2xl);
      text-align: center;
      color: var(--color-text-secondary);
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .info-card {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .info-card-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border-primary);
      background: var(--color-bg-tertiary);
    }

    .info-card-header h3 {
      margin: 0;
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: var(--font-size-xs);
    }

    .info-card-content {
      padding: var(--spacing-lg);
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-md);
      gap: var(--spacing-md);
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
      min-width: 100px;
    }

    .info-value {
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      text-align: right;
      flex: 1;
      word-break: break-word;
    }

    .info-value.empty {
      color: var(--color-text-tertiary);
      font-style: italic;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--color-text-secondary);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--spacing-lg);
      transition: color var(--transition-normal);
    }

    .back-link:hover {
      color: var(--color-text-primary);
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: var(--color-text-secondary);
    }

    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: var(--color-text-secondary);
      text-align: center;
    }

    .custom-fields {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
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

    @media (max-width: 768px) {
      .content {
        grid-template-columns: 1fr;
      }
      
      .header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .actions {
        width: 100%;
        justify-content: flex-start;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (this.itemId) {
      this.loadItem();
      this.loadCustomFields();
    }
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('itemId') && this.itemId) {
      // Only reload if itemId actually changed to a different value
      const oldItemId = changedProperties.get('itemId');
      if (oldItemId !== this.itemId) {
        this.loadItem();
        this.loadCustomFields();
      }
    }
  }

  private async loadItem() {
    if (!this.itemId) return;
    
    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/items/${this.itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load item');
      }

      this.item = await response.json();
    } catch (error) {
      console.error('Failed to load item:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadCustomFields() {
    // First try to get cached data from ItemsPage
    try {
      // Import ItemsPage class to access cached data
      const { ItemsPage } = await import('./items.js');
      const cachedFields = ItemsPage.getCachedCustomFields();
      
      if (cachedFields) {
        this.customFieldDefs = cachedFields;
        return;
      }
    } catch (error) {
      console.log('Could not access cached custom fields, loading fresh data');
    }

    // Fallback to API call if no cache available
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/custom-fields', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.customFieldDefs = await response.json();
      }
    } catch (error) {
      console.error('Failed to load custom fields:', error);
    }
  }

  private handleEdit() {
    this.dispatchEvent(new CustomEvent('edit-item', {
      detail: { itemId: this.itemId },
      bubbles: true
    }));
  }

  private async handleDelete() {
    if (!this.item) return;
    
    if (!confirm(`Are you sure you want to delete "${this.item.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/items/${this.itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      this.dispatchEvent(new CustomEvent('item-deleted', {
        detail: { itemId: this.itemId },
        bubbles: true
      }));
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    }
  }

  private openPhotoModal(index: number) {
    this.selectedPhotoIndex = index;
    this.showPhotoModal = true;
  }

  private closePhotoModal() {
    this.showPhotoModal = false;
  }

  private nextPhoto() {
    if (this.item?.photos && this.selectedPhotoIndex < this.item.photos.length - 1) {
      this.selectedPhotoIndex++;
    }
  }

  private prevPhoto() {
    if (this.selectedPhotoIndex > 0) {
      this.selectedPhotoIndex--;
    }
  }

  private formatDate(dateString: string) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  private formatCurrency(amount: number) {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  private renderCustomFields() {
    if (!this.item?.custom_fields || !this.customFieldDefs.length) {
      return html``;
    }

    const customFieldsWithValues = this.customFieldDefs.filter(field => 
      this.item?.custom_fields?.[field.id] !== undefined
    );

    if (!customFieldsWithValues.length) {
      return html``;
    }

    return html`
      <div class="info-card">
        <div class="info-card-header">
          <h3>Custom Fields</h3>
        </div>
        <div class="info-card-content">
          <div class="custom-fields">
            ${customFieldsWithValues.map(field => html`
              <div class="info-item">
                <span class="info-label">${field.name}</span>
                <span class="info-value">
                  ${this.formatCustomFieldValue(field, this.item?.custom_fields?.[field.id])}
                </span>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  private formatCustomFieldValue(field: CustomField, value: any) {
    if (value === undefined || value === null || value === '') {
      return html`<span class="empty">—</span>`;
    }

    switch (field.field_type) {
      case 'checkbox':
        return value ? 'Yes' : 'No';
      case 'date':
        return this.formatDate(value);
      case 'number':
        return value.toString();
      default:
        return value.toString();
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading">
          <p>Loading item...</p>
        </div>
      `;
    }

    if (!this.item) {
      return html`
        <div class="error">
          <h2>Item not found</h2>
          <p>The item you're looking for doesn't exist or you don't have permission to view it.</p>
          <app-button href="/items">← Back to Items</app-button>
        </div>
      `;
    }

    return html`
      <a href="/items" class="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
        </svg>
        Back to Items
      </a>

      <div class="header">
        <div class="header-content">
          <h1>${this.item.name}</h1>
          ${this.item.description ? html`<p>${this.item.description}</p>` : ''}
        </div>
        <div class="actions">
          <app-button @click="${this.handleEdit}" variant="secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 pen 01</title><g fill="currentColor" class="nc-icon-wrapper"><path d="M13.5,6.5l-7,7H3v-3.5l7-7L13.5,6.5z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path> <path d="m10.5,3.5l3,3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-color="color-2"></path></g></svg>
            Edit
          </app-button>
          <app-button @click="${this.handleDelete}" variant="danger">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 trash can</title><g fill="currentColor" class="nc-icon-wrapper"><polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" points="4.5,5.5 4.5,14.5 11.5,14.5 11.5,5.5 "></polyline> <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" points="6.5,5.5 6.5,3.5 9.5,3.5 9.5,5.5 "></polyline> <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" x1="2.5" y1="5.5" x2="13.5" y2="5.5" data-color="color-2"></line></g></svg>
            Delete
          </app-button>
        </div>
      </div>

      <div class="content">
        <div class="main-content">
          <div class="photos-section">
            <div class="photos-header">
              <h3>Photos</h3>
              <span>${this.item.photos?.length || 0} photo(s)</span>
            </div>
            ${this.item.photos?.length ? html`
              <div class="photos-grid">
                ${this.item.photos.map((photo, index) => html`
                  <div class="photo-item" @click="${() => this.openPhotoModal(index)}">
                    <img src="/api/photos/files/${photo.filename}" alt="${photo.original_name}" />
                    <div class="photo-overlay">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M11 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm9 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM8 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                      </svg>
                    </div>
                  </div>
                `)}
              </div>
            ` : html`
              <div class="no-photos">
                <p>No photos uploaded</p>
              </div>
            `}
          </div>
        </div>

        <div class="sidebar">
          <div class="info-card">
            <div class="info-card-header">
              <h3>Basic Information</h3>
            </div>
            <div class="info-card-content">
              ${this.item.label_id ? html`
                <div class="info-item">
                  <span class="info-label">Label ID</span>
                  <span class="info-value">
                    <span class="badge badge--label">${this.item.label_id}</span>
                  </span>
                </div>
              ` : ''}
              <div class="info-item">
                <span class="info-label">Category</span>
                <span class="info-value ${!this.item.category ? 'empty' : ''}">
                  ${this.item.category?.name || '—'}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Location</span>
                <span class="info-value ${!this.item.location ? 'empty' : ''}">
                  ${this.item.location?.name || '—'}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Quantity</span>
                <span class="info-value ${!this.item.quantity ? 'empty' : ''}">
                  ${this.item.quantity || '—'}
                </span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-card-header">
              <h3>Product Details</h3>
            </div>
            <div class="info-card-content">
              <div class="info-item">
                <span class="info-label">Model Number</span>
                <span class="info-value ${!this.item.model_number ? 'empty' : ''}">
                  ${this.item.model_number || '—'}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Serial Number</span>
                <span class="info-value ${!this.item.serial_number ? 'empty' : ''}">
                  ${this.item.serial_number || '—'}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Warranty</span>
                <span class="info-value ${!this.item.warranty ? 'empty' : ''}">
                  ${this.item.warranty || '—'}
                </span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-card-header">
              <h3>Purchase Information</h3>
            </div>
            <div class="info-card-content">
              <div class="info-item">
                <span class="info-label">Purchase Date</span>
                <span class="info-value ${!this.item.purchase_date ? 'empty' : ''}">
                  ${this.item.purchase_date ? this.formatDate(this.item.purchase_date) : '—'}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Purchase Price</span>
                <span class="info-value ${!this.item.purchase_price ? 'empty' : ''}">
                  ${this.item.purchase_price ? this.formatCurrency(this.item.purchase_price) : '—'}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Purchase Location</span>
                <span class="info-value ${!this.item.purchase_location ? 'empty' : ''}">
                  ${this.item.purchase_location || '—'}
                </span>
              </div>
            </div>
          </div>

          ${this.renderCustomFields()}

          <div class="info-card">
            <div class="info-card-header">
              <h3>Timestamps</h3>
            </div>
            <div class="info-card-content">
              <div class="info-item">
                <span class="info-label">Created</span>
                <span class="info-value">
                  ${this.formatDate(this.item.created_at)}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Updated</span>
                <span class="info-value">
                  ${this.formatDate(this.item.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${this.showPhotoModal && this.item.photos?.length ? html`
        <div class="photo-modal" @click="${this.closePhotoModal}">
          <img 
            src="/api/photos/files/${this.item.photos[this.selectedPhotoIndex].filename}" 
            alt="${this.item.photos[this.selectedPhotoIndex].original_name}"
            @click="${(e: Event) => e.stopPropagation()}"
          />
          ${this.item.photos.length > 1 ? html`
            <button class="photo-modal-nav prev" @click="${(e: Event) => { e.stopPropagation(); this.prevPhoto(); }}"
              ?disabled="${this.selectedPhotoIndex === 0}">
              ‹
            </button>
            <button class="photo-modal-nav next" @click="${(e: Event) => { e.stopPropagation(); this.nextPhoto(); }}"
              ?disabled="${this.selectedPhotoIndex === this.item.photos.length - 1}">
              ›
            </button>
          ` : ''}
          <button class="photo-modal-close" @click="${this.closePhotoModal}">×</button>
        </div>
      ` : ''}
    `;
  }
} 