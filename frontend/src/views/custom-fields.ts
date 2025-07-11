import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../components/button.js';

interface CustomField {
  id: string;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'textarea' | 'checkbox' | 'enum';
  required: boolean;
  options?: string[];
  created_at: string;
  updated_at: string;
}

@customElement('custom-fields-page')
export class CustomFieldsPage extends LitElement {
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

    .form-group select {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b949e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 0.5rem center;
      background-size: 1rem;
      padding-right: 3rem;
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
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    /* Table styles */
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
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      position: relative;
      z-index: 10;
    }

    .item-name {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      font-size: var(--font-size-base);
    }

    .item-date {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
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

    .empty-label {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
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
      return html`<div class="loading">Loading custom fields...</div>`;
    }

    return html`
      <div class="header">
        <h1>Custom Fields</h1>
        <app-button variant="primary" @button-click="${this.showAddForm}">
          Add Custom Field
        </app-button>
      </div>

      ${this.customFields.length === 0 ? html`
        <div class="empty-state">
          <p>No custom fields defined yet. Create custom fields to add additional information to your items.</p>
        </div>
      ` : html`
        <div class="items-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Required</th>
                <th>Options</th>
                <th>Created</th>
                <th class="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.customFields.map(field => html`
                <tr>
                  <td>
                    <div class="item-name">${field.name}</div>
                  </td>
                  <td>
                    <span class="badge badge--type">${field.field_type}</span>
                  </td>
                  <td>
                    ${field.required ? html`
                      <span class="badge badge--required">Required</span>
                    ` : html`
                      <span class="badge badge--optional">Optional</span>
                    `}
                  </td>
                  <td>
                    ${field.field_type === 'enum' && field.options ? html`
                      <div class="field-options">
                        ${field.options.join(', ')}
                      </div>
                    ` : html`
                      <span class="empty-label">—</span>
                    `}
                  </td>
                  <td>
                    <div class="item-date">${new Date(field.created_at || Date.now()).toLocaleDateString()}</div>
                  </td>
                  <td class="actions-cell">
                    <div class="item-actions">
                      <app-button variant="secondary" size="sm" icon-only @button-click="${() => this.showEditForm(field)}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 pen 01</title><g fill="currentColor" class="nc-icon-wrapper"><line id="butt_color" data-name="butt color" x1="13" y1="7" x2="9" y2="3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-cap="butt" data-color="color-2"></line> <polygon points="5.5 14.5 0.5 15.5 1.5 10.5 11.5 0.5 15.5 4.5 5.5 14.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-cap="butt"></polygon></g></svg>
                      </app-button>
                      <app-button variant="danger" size="sm" icon-only @button-click="${() => this.deleteCustomField(field)}">
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
                        <app-button type="button" variant="danger" size="sm" @button-click="${() => this.removeOption(index)}">
                          Remove
                        </app-button>
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
                      <app-button type="button" variant="secondary" size="sm" @button-click="${this.addOption}">
                        Add
                      </app-button>
                    </div>
                  </div>
                </div>
              ` : ''}

              <div class="form-actions">
                <app-button type="button" variant="secondary" @button-click="${this.hideForm}">
                  Cancel
                </app-button>
                <app-button type="button" variant="primary" ?loading="${this.loading}" @button-click="${this.handleSubmit}">
                  ${this.editingField ? 'Update' : 'Create'}
                </app-button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}
    `;
  }
} 