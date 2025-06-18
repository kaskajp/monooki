import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

interface CustomField {
  id: number;
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

    .custom-fields-list {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }

    .custom-field-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;
    }

    .custom-field-item:last-child {
      border-bottom: none;
    }

    .custom-field-info h3 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .custom-field-meta {
      font-size: 12px;
      color: #666;
    }

    .custom-field-type {
      background: #f8f9fa;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      text-transform: uppercase;
      margin-right: 8px;
    }

    .required-badge {
      background: #dc3545;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
    }

    .custom-field-actions {
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
    .form-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
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

    .section {
      margin-bottom: 32px;
    }

    .section-title {
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #eee;
    }

    .btn-small {
      padding: 4px 8px;
      font-size: 12px;
    }

    .options-section {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 12px;
    }

    .option-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .option-item:last-of-type {
      border-bottom: none;
      margin-bottom: 12px;
    }

    .option-text {
      flex: 1;
      font-size: 14px;
    }

    .add-option {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .add-option input {
      flex: 1;
      margin: 0;
    }

    .field-options {
      margin-top: 4px;
      color: #666;
      font-size: 12px;
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
                    Edit
                  </button>
                  <button class="btn btn-danger" @click="${() => this.deleteCustomField(field)}">
                    Delete
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