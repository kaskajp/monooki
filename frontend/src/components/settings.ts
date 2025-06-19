import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

interface CustomField {
  id: string;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'textarea' | 'checkbox' | 'enum';
  required: boolean;
  options?: string[];
  created_at: string;
  updated_at: string;
}

@customElement('settings-page')
export class SettingsPage extends LitElement {
  @state()
  customFields: CustomField[] = [];

  @state()
  loading = false;

  @state()
  showForm = false;

  @state()
  editingField: CustomField | null = null;

  @state()
  formData = {
    name: '',
    field_type: 'text' as 'text' | 'number' | 'date' | 'textarea' | 'checkbox' | 'enum',
    required: false,
    options: [] as string[]
  };

  @state()
  newOption = '';

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

    .custom-fields-list {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .custom-field-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-xl);
      border-bottom: 1px solid var(--color-border-primary);
      transition: background var(--transition-normal);
    }

    .custom-field-item:hover {
      background: var(--color-bg-primary);
    }

    .custom-field-item:last-child {
      border-bottom: none;
    }

    .custom-field-info h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--color-text-primary);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
    }

    .custom-field-meta {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .custom-field-type {
      background: var(--color-bg-tertiary);
      color: var(--color-accent-primary);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
      font-size: 11px;
      text-transform: uppercase;
      font-weight: var(--font-weight-medium);
      border: 1px solid var(--color-border-primary);
    }

    .required-badge {
      background: var(--color-danger);
      color: white;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
      font-size: 10px;
      font-weight: var(--font-weight-medium);
    }

    .custom-field-actions {
      display: flex;
      gap: 0.5rem;
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

    .form-group input::placeholder {
      color: var(--form-placeholder);
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--form-border-focus);
      box-shadow: var(--shadow-focus);
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    .checkbox-group label {
      margin: 0;
      font-size: 14px;
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

    .section {
      margin-bottom: 2rem;
    }

    .section-title {
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #30363d;
      font-size: 20px;
      font-weight: 600;
      color: #f0f6fc;
    }

    .btn-small {
      padding: 0.5rem 0.75rem;
      font-size: 12px;
    }

    .options-section {
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      background: var(--color-bg-primary);
      margin-top: var(--spacing-lg);
    }

    .options-section h4 {
      margin: 0 0 var(--spacing-lg) 0;
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
    }

    .option-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid var(--color-border-primary);
    }

    .option-item:last-of-type {
      border-bottom: none;
      margin-bottom: var(--spacing-lg);
    }

    .option-text {
      flex: 1;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }

    .add-option {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .add-option input {
      flex: 1;
      margin: 0;
    }

    .field-options {
      margin-top: 0.5rem;
      color: #8b949e;
      font-size: 12px;
      font-style: italic;
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadCustomFields();
  }

  private async loadCustomFields() {
    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/custom-fields', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.customFields = await response.json();
      } else {
        console.error('Failed to load custom fields');
      }
    } catch (error) {
      console.error('Error loading custom fields:', error);
    } finally {
      this.loading = false;
    }
  }

  private showAddForm() {
    this.editingField = null;
    this.formData = { name: '', field_type: 'text', required: false, options: [] };
    this.newOption = '';
    this.showForm = true;
  }

  private showEditForm(field: CustomField) {
    this.editingField = field;
    this.formData = {
      name: field.name,
      field_type: field.field_type,
      required: field.required,
      options: field.options ? [...field.options] : []
    };
    this.newOption = '';
    this.showForm = true;
  }

  private hideForm() {
    this.showForm = false;
    this.editingField = null;
    this.formData = { name: '', field_type: 'text', required: false, options: [] };
    this.newOption = '';
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!this.formData.name.trim()) {
      return;
    }

    // Validate enum options
    if (this.formData.field_type === 'enum' && this.formData.options.length === 0) {
      alert('Enum fields must have at least one option');
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const url = this.editingField 
        ? `/api/custom-fields/${this.editingField.id}`
        : '/api/custom-fields';
      
      // Prepare data for submission
      const submitData = {
        name: this.formData.name,
        field_type: this.formData.field_type,
        required: this.formData.required,
        ...(this.formData.field_type === 'enum' && { options: this.formData.options })
      };
      
      const response = await fetch(url, {
        method: this.editingField ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await this.loadCustomFields();
        this.hideForm();
      } else {
        const errorData = await response.json();
        console.error('Failed to save custom field:', errorData);
        alert(`Error: ${errorData.error || 'Failed to save custom field'}`);
      }
    } catch (error) {
      console.error('Error saving custom field:', error);
      alert('Error saving custom field');
    } finally {
      this.loading = false;
    }
  }

  private async deleteCustomField(field: CustomField) {
    if (!confirm(`Are you sure you want to delete the custom field "${field.name}"? This will remove this field from all items.`)) {
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/custom-fields/${field.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await this.loadCustomFields();
      } else {
        console.error('Failed to delete custom field');
      }
    } catch (error) {
      console.error('Error deleting custom field:', error);
    } finally {
      this.loading = false;
    }
  }

  private handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    this.formData = { ...this.formData, [target.name]: value };
    
    // Clear options if field type is not enum
    if (target.name === 'field_type' && value !== 'enum') {
      this.formData = { ...this.formData, options: [] };
    }
  }

  private addOption() {
    if (this.newOption.trim() && !this.formData.options.includes(this.newOption.trim())) {
      this.formData = { 
        ...this.formData, 
        options: [...this.formData.options, this.newOption.trim()] 
      };
      this.newOption = '';
    }
  }

  private removeOption(index: number) {
    this.formData = {
      ...this.formData,
      options: this.formData.options.filter((_, i) => i !== index)
    };
  }

  private handleNewOptionKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.addOption();
    }
  }

  render() {
    if (this.loading && !this.customFields.length) {
      return html`<div class="loading">Loading settings...</div>`;
    }

    return html`
      <h1>Settings</h1>

      <div class="section">
        <div class="header">
          <h2 class="section-title">Custom Fields for Items</h2>
          <button class="btn btn-primary" @click="${this.showAddForm}">
            Add Custom Field
          </button>
        </div>

        ${this.customFields.length === 0 ? html`
          <div class="empty-state">
            <p>No custom fields defined yet. Create custom fields to add additional information to your items.</p>
          </div>
        ` : html`
          <div class="custom-fields-list">
            ${this.customFields.map(field => html`
              <div class="custom-field-item">
                <div class="custom-field-info">
                  <h3>${field.name}</h3>
                  <div class="custom-field-meta">
                    <span class="custom-field-type">${field.field_type}</span>
                    ${field.required ? html`<span class="required-badge">Required</span>` : ''}
                  </div>
                  ${field.field_type === 'enum' && field.options ? html`
                    <div class="field-options">
                      <small>Options: ${field.options.join(', ')}</small>
                    </div>
                  ` : ''}
                </div>
                <div class="custom-field-actions">
                  <button class="btn btn-secondary" @click="${() => this.showEditForm(field)}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 pen 01</title><g fill="#FFFFFF" class="nc-icon-wrapper"><line id="butt_color" data-name="butt color" x1="13" y1="7" x2="9" y2="3" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" data-cap="butt" data-color="color-2"></line> <polygon points="5.5 14.5 0.5 15.5 1.5 10.5 11.5 0.5 15.5 4.5 5.5 14.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" data-cap="butt"></polygon></g></svg>
                  </button>
                  <button class="btn btn-danger" @click="${() => this.deleteCustomField(field)}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 trash can</title><g fill="#FFFFFF" class="nc-icon-wrapper"><path d="M2.5,5.5l.865,8.649A1.5,1.5,0,0,0,4.857,15.5h6.286a1.5,1.5,0,0,0,1.492-1.351L13.5,5.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></path><line data-color="color-2" x1="0.5" y1="3.5" x2="15.5" y2="3.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></line><polyline data-color="color-2" points="5.5 3.5 5.5 0.5 10.5 0.5 10.5 3.5" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"></polyline> </g></svg>
                  </button>
                </div>
              </div>
            `)}
          </div>
        `}
      </div>

      ${this.showForm ? html`
        <div class="form-overlay" @click="${(e: Event) => e.target === e.currentTarget && this.hideForm()}">
          <div class="form-container">
            <h2>${this.editingField ? 'Edit' : 'Add'} Custom Field</h2>
            <form @submit="${this.handleSubmit}">
              <div class="form-group">
                <label for="name">Field Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  .value="${this.formData.name}"
                  @input="${this.handleInputChange}"
                  required
                  placeholder="e.g., Warranty Expiry, Brand, Color"
                />
              </div>
              
              <div class="form-group">
                <label for="field_type">Field Type</label>
                <select
                  id="field_type"
                  name="field_type"
                  .value="${this.formData.field_type}"
                  @change="${this.handleInputChange}"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="textarea">Long Text</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="enum">Select (Dropdown)</option>
                </select>
              </div>

              <div class="form-group">
                <div class="checkbox-group">
                  <input
                    type="checkbox"
                    id="required"
                    name="required"
                    .checked="${this.formData.required}"
                    @change="${this.handleInputChange}"
                  />
                  <label for="required">Required field</label>
                </div>
              </div>

              ${this.formData.field_type === 'enum' ? html`
                <div class="form-group">
                  <label>Options</label>
                  <div class="options-section">
                    ${this.formData.options.map((option, index) => html`
                      <div class="option-item">
                        <span class="option-text">${option}</span>
                        <button type="button" class="btn btn-danger btn-small" @click="${() => this.removeOption(index)}">
                          Remove
                        </button>
                      </div>
                    `)}
                    <div class="add-option">
                      <input
                        type="text"
                        placeholder="Add new option"
                        .value="${this.newOption}"
                        @input="${(e: Event) => this.newOption = (e.target as HTMLInputElement).value}"
                        @keydown="${this.handleNewOptionKeyDown}"
                      />
                      <button type="button" class="btn btn-secondary btn-small" @click="${this.addOption}">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ` : ''}

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="${this.hideForm}">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" ?disabled="${this.loading}">
                  ${this.loading ? 'Saving...' : (this.editingField ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}
    `;
  }
} 