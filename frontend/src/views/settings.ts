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

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale: string;
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

  @state()
  labelSettings = {
    labelFormat: '{number}',
    labelPadding: 1,
    labelSeparator: '',
    labelNextNumber: 1
  };

  @state()
  previewLabel = '';

  @state()
  labelSettingsLoading = false;

  @state()
  currencySettings = {
    currency: 'USD'
  };

  @state()
  currencySettingsLoading = false;

  @state()
  availableCurrencies: CurrencyInfo[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
    { code: 'EUR', name: 'Euro', symbol: '€', locale: 'en-EU' },
    { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', locale: 'de-CH' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', locale: 'sv-SE' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', locale: 'en-NZ' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', locale: 'es-MX' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', locale: 'en-HK' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', locale: 'no-NO' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', locale: 'ko-KR' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', locale: 'tr-TR' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', locale: 'ru-RU' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', locale: 'pt-BR' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA' }
  ];

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
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    /* Table styles */
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

  private async loadLabelSettings() {
    this.labelSettingsLoading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/label-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const settings = await response.json();
        this.labelSettings = {
          labelFormat: settings.labelFormat,
          labelPadding: settings.labelPadding,
          labelSeparator: settings.labelSeparator,
          labelNextNumber: settings.labelNextNumber
        };
        await this.updatePreview();
      } else {
        console.error('Failed to load label settings');
      }
    } catch (error) {
      console.error('Error loading label settings:', error);
    } finally {
      this.labelSettingsLoading = false;
    }
  }

  private async updatePreview() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/preview-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          labelFormat: this.labelSettings.labelFormat,
          labelPadding: this.labelSettings.labelPadding,
          labelSeparator: this.labelSettings.labelSeparator,
          sampleNumber: this.labelSettings.labelNextNumber
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.previewLabel = data.preview;
      }
    } catch (error) {
      console.error('Error updating preview:', error);
    }
  }

  private async loadCurrencySettings() {
    this.currencySettingsLoading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/currency-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const settings = await response.json();
        this.currencySettings = {
          currency: settings.currency || 'USD'
        };
      } else {
        console.error('Failed to load currency settings');
      }
    } catch (error) {
      console.error('Error loading currency settings:', error);
    } finally {
      this.currencySettingsLoading = false;
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    await Promise.all([
      this.loadCustomFields(),
      this.loadLabelSettings(),
      this.loadCurrencySettings()
    ]);
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

  private async handleLabelSettingsChange(e: Event) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const value = target.type === 'number' ? parseInt(target.value) : target.value;
    
    this.labelSettings = { 
      ...this.labelSettings, 
      [target.name]: value 
    };
    
    // Update preview when settings change
    await this.updatePreview();
  }

  private async saveLabelSettings() {
    this.labelSettingsLoading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/label-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(this.labelSettings)
      });

      if (response.ok) {
        // Optional: Show success message
        console.log('Label settings saved successfully');
      } else {
        console.error('Failed to save label settings');
        alert('Failed to save label settings');
      }
    } catch (error) {
      console.error('Error saving label settings:', error);
      alert('Error saving label settings');
    } finally {
      this.labelSettingsLoading = false;
    }
  }

  private async handleCurrencySettingsChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.currencySettings = { 
      ...this.currencySettings, 
      currency: target.value 
    };
  }

  private async saveCurrencySettings() {
    this.currencySettingsLoading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/currency-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(this.currencySettings)
      });

      if (response.ok) {
        console.log('Currency settings saved successfully');
      } else {
        console.error('Failed to save currency settings');
        alert('Failed to save currency settings');
      }
    } catch (error) {
      console.error('Error saving currency settings:', error);
      alert('Error saving currency settings');
    } finally {
      this.currencySettingsLoading = false;
    }
  }

  private formatCurrencyPreview(amount: number): string {
    const currency = this.availableCurrencies.find(c => c.code === this.currencySettings.currency);
    const locale = currency?.locale || 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currencySettings.currency
    }).format(amount);
  }

  render() {
    if (this.loading && !this.customFields.length) {
      return html`<div class="loading">Loading settings...</div>`;
    }

    return html`
      <h1>Settings</h1>

      <div class="section">
        <div class="header">
          <h2 class="section-title">Currency Settings</h2>
          <app-button variant="primary" @button-click="${this.saveCurrencySettings}" ?loading="${this.currencySettingsLoading}">
            Save Currency Settings
          </app-button>
        </div>

        <div class="currency-settings-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label for="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                .value="${this.currencySettings.currency}"
                @change="${this.handleCurrencySettingsChange}"
              >
                ${this.availableCurrencies.map(currency => html`
                  <option value="${currency.code}" ?selected="${this.currencySettings.currency === currency.code}">
                    ${currency.name} (${currency.code}) - ${currency.symbol}
                  </option>
                `)}
              </select>
              <small style="color: var(--color-text-secondary); font-size: var(--font-size-xs); margin-top: 0.25rem; display: block;">
                Choose the currency to display prices in throughout the application
              </small>
            </div>
            
            <div class="form-group">
              <label>Preview</label>
              <div style="background: var(--color-bg-secondary); border: 1px solid var(--color-border-primary); border-radius: var(--radius-md); padding: 1rem;">
                <strong>Example:</strong> 
                <span style="background: var(--color-accent-primary); color: white; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-family: 'Courier New', monospace; margin-left: 0.5rem;">
                  ${this.formatCurrencyPreview(123.45)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="header">
          <h2 class="section-title">Label Settings</h2>
          <app-button variant="primary" @button-click="${this.saveLabelSettings}" ?loading="${this.labelSettingsLoading}">
            Save Label Settings
          </app-button>
        </div>

        <div class="label-settings-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label for="labelFormat">Label Format</label>
              <input
                type="text"
                id="labelFormat"
                name="labelFormat"
                .value="${this.labelSettings.labelFormat}"
                @input="${this.handleLabelSettingsChange}"
                placeholder="e.g., {number}, ITEM-{number}, {number}{separator}001"
              />
              <small style="color: var(--color-text-secondary); font-size: var(--font-size-xs); margin-top: 0.25rem; display: block;">
                Use {number} for the sequential number and {separator} for the separator
              </small>
            </div>
            
            <div class="form-group">
              <label for="labelPadding">Number Padding</label>
              <input
                type="number"
                id="labelPadding"
                name="labelPadding"
                .value="${this.labelSettings.labelPadding.toString()}"
                @input="${this.handleLabelSettingsChange}"
                min="1"
                max="10"
              />
              <small style="color: var(--color-text-secondary); font-size: var(--font-size-xs); margin-top: 0.25rem; display: block;">
                Number of digits (1 = 1, 3 = 001, 5 = 00001)
              </small>
            </div>
            
            <div class="form-group">
              <label for="labelSeparator">Separator</label>
              <input
                type="text"
                id="labelSeparator"
                name="labelSeparator"
                .value="${this.labelSettings.labelSeparator}"
                @input="${this.handleLabelSettingsChange}"
                placeholder="e.g., -, _, (leave empty for none)"
                maxlength="5"
              />
              <small style="color: var(--color-text-secondary); font-size: var(--font-size-xs); margin-top: 0.25rem; display: block;">
                Characters to use as separator (optional)
              </small>
            </div>
            
            <div class="form-group">
              <label for="labelNextNumber">Next Number</label>
              <input
                type="number"
                id="labelNextNumber"
                name="labelNextNumber"
                .value="${this.labelSettings.labelNextNumber.toString()}"
                @input="${this.handleLabelSettingsChange}"
                min="1"
              />
              <small style="color: var(--color-text-secondary); font-size: var(--font-size-xs); margin-top: 0.25rem; display: block;">
                Next number to assign to new items
              </small>
            </div>
          </div>
          
          ${this.previewLabel ? html`
            <div style="background: var(--color-bg-secondary); border: 1px solid var(--color-border-primary); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
              <strong>Preview:</strong> 
              <span style="background: var(--color-accent-primary); color: white; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-family: 'Courier New', monospace; margin-left: 0.5rem;">
                ${this.previewLabel}
              </span>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="section">
        <div class="header">
          <h2 class="section-title">Custom Fields for Items</h2>
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
                <app-button type="submit" variant="primary" ?loading="${this.loading}">
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