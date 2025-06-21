import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../components/button.js';

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

@customElement('account-settings-page')
export class AccountSettingsPage extends LitElement {
  @state()
  private loading = false;

  @state()
  private formData = {
    workspaceName: ''
  };

  @state()
  private userProfile: any = null;

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
  deletingAccount = false;

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
      margin-bottom: var(--spacing-2xl);
    }

    .header h1 {
      margin: 0;
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .section {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      padding: var(--spacing-2xl);
      margin-bottom: var(--spacing-xl);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
    }

    .section-title {
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .section-title .icon {
      width: 20px;
      height: 20px;
      opacity: 0.8;
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

    .form-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-xl);
      border-top: 1px solid var(--color-border-primary);
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .preview-box {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-md);
      padding: 1rem;
    }

    .preview-label {
      background: var(--color-accent-primary);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-family: 'Courier New', monospace;
      margin-left: 0.5rem;
    }

    .success-message {
      background: var(--color-success-bg);
      color: var(--color-success-text);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-xl);
      font-size: var(--font-size-sm);
      border: 1px solid var(--color-success-border);
    }

    .error-message {
      background: var(--color-danger-bg);
      color: var(--color-danger-text);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-xl);
      font-size: var(--font-size-sm);
      border: 1px solid var(--color-danger-border);
    }

    .help-text {
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
      margin-top: 0.25rem;
      display: block;
    }

    .danger-zone {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid #30363d;
    }

    .danger-zone-content {
      background: rgba(248, 81, 73, 0.05);
      border: 1px solid rgba(248, 81, 73, 0.2);
      border-radius: var(--radius-lg);
      padding: var(--spacing-2xl);
    }

    .danger-zone h2 {
      color: #f85149;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      margin: 0 0 var(--spacing-lg) 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .danger-zone-warning {
      margin-bottom: var(--spacing-xl);
    }

    .danger-zone-warning h4 {
      color: #f85149;
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .danger-zone-warning p {
      color: var(--color-text-secondary);
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: var(--line-height-relaxed);
    }

    .danger-zone-warning ul {
      margin: var(--spacing-md) 0 0 0;
      padding-left: var(--spacing-lg);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .danger-zone-warning li {
      margin-bottom: var(--spacing-xs);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadUserProfile();
    this.loadLabelSettings();
    this.loadCurrencySettings();
  }

  private async loadUserProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.userProfile = await response.json();
        this.formData = {
          ...this.formData,
          workspaceName: this.userProfile.workspaceName || ''
        };
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

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

  private async handleWorkspaceUpdate(e: Event) {
    e.preventDefault();
    
    if (!this.formData.workspaceName.trim()) {
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/workspace', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceName: this.formData.workspaceName })
      });

      if (response.ok) {
        // Update local profile data
        this.userProfile = {
          ...this.userProfile,
          workspaceName: this.formData.workspaceName
        };
        
        // Notify navbar to update
        this.dispatchEvent(new CustomEvent('workspace-updated', { 
          detail: { workspaceName: this.formData.workspaceName },
          bubbles: true,
          composed: true
        }));
        
        this.showSuccessMessage('Workspace name updated successfully!');
      } else {
        this.showErrorMessage('Failed to update workspace name');
      }
    } catch (error) {
      console.error('Error updating workspace:', error);
      this.showErrorMessage('An error occurred while updating workspace name');
    } finally {
      this.loading = false;
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
        this.showSuccessMessage('Label settings saved successfully!');
      } else {
        console.error('Failed to save label settings');
        this.showErrorMessage('Failed to save label settings');
      }
    } catch (error) {
      console.error('Error saving label settings:', error);
      this.showErrorMessage('Error saving label settings');
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
        this.showSuccessMessage('Currency settings saved successfully!');
      } else {
        console.error('Failed to save currency settings');
        this.showErrorMessage('Failed to save currency settings');
      }
    } catch (error) {
      console.error('Error saving currency settings:', error);
      this.showErrorMessage('Error saving currency settings');
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

  private async handleDeleteAccount() {
    // First confirmation
    const firstConfirm = confirm(
      "⚠️ WARNING: This will permanently delete your entire account and workspace!\n\n" +
      "This action will delete:\n" +
      "• All your items and their photos\n" +
      "• All categories and locations\n" +
      "• All custom fields\n" +
      "• Your entire workspace\n" +
      "• Your user account\n\n" +
      "This action CANNOT be undone.\n\n" +
      "Are you absolutely sure you want to continue?"
    );

    if (!firstConfirm) return;

    // Second confirmation with typing requirement
    const confirmText = "DELETE MY ACCOUNT";
    const typedConfirmation = prompt(
      `To confirm account deletion, please type exactly: ${confirmText}\n\n` +
      "This will permanently delete ALL your data and cannot be undone.",
      ""
    );

    if (typedConfirmation !== confirmText) {
      if (typedConfirmation !== null) {
        alert("Confirmation text did not match. Account deletion cancelled.");
      }
      return;
    }

    // Final confirmation
    const finalConfirm = confirm(
      "🚨 FINAL WARNING 🚨\n\n" +
      "You are about to permanently delete your account and ALL data.\n" +
      "This action is IRREVERSIBLE.\n\n" +
      "Click OK to proceed with deletion, or Cancel to abort."
    );

    if (!finalConfirm) return;

    this.deletingAccount = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('token');
        
        // Show success message
        alert('Your account and all data have been permanently deleted.');
        
        // Redirect to login page
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        console.error('Failed to delete account:', errorData);
        alert(`Failed to delete account: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Network error occurred while trying to delete account. Please try again.');
    } finally {
      this.deletingAccount = false;
    }
  }

  private showSuccessMessage(message: string) {
    const successDiv = this.shadowRoot?.querySelector('.success-message') as HTMLElement;
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'block';
      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 5000);
    }
  }

  private showErrorMessage(message: string) {
    const errorDiv = this.shadowRoot?.querySelector('.error-message') as HTMLElement;
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }

  render() {
    return html`
      <div class="header">
        <h1>Account Settings</h1>
      </div>

      <div class="success-message" style="display: none;"></div>
      <div class="error-message" style="display: none;"></div>

      <!-- Workspace Settings Section -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" class="icon">
              <rect x="2" y="3" width="12" height="10" rx="2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 7h2" stroke="currentColor" stroke-linecap="round"/>
            </svg>
            Workspace Settings
          </h2>
          <app-button variant="primary" @button-click="${this.handleWorkspaceUpdate}" ?loading="${this.loading}">
            Update Workspace
          </app-button>
        </div>
        
        <div class="form-group">
          <label for="workspaceName">Workspace Name</label>
          <input
            type="text"
            id="workspaceName"
            .value="${this.formData.workspaceName}"
            @input="${(e: Event) => {
              const target = e.target as HTMLInputElement;
              this.formData = { ...this.formData, workspaceName: target.value };
            }}"
            placeholder="Enter workspace name"
            required
          />
        </div>
      </div>

      <!-- Currency Settings Section -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" class="icon">
              <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 5v6M10.5 6.5h-3a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Currency Settings
          </h2>
          <app-button variant="primary" @button-click="${this.saveCurrencySettings}" ?loading="${this.currencySettingsLoading}">
            Save Currency Settings
          </app-button>
        </div>

        <div class="grid-2">
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
            <small class="help-text">
              Choose the currency to display prices in throughout the application
            </small>
          </div>
          
          <div class="form-group">
            <label>Preview</label>
            <div class="preview-box">
              <strong>Example:</strong> 
              <span class="preview-label">
                ${this.formatCurrencyPreview(123.45)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Label Settings Section -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" class="icon">
              <polygon fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" points="3.5,0.5 8.5,1.5 15.5,8.5 8.5,15.5 1.5,8.5 0.5,3.5 "/>
              <circle fill="currentColor" cx="5" cy="5" r="1"/>
            </svg>
            Label Settings
          </h2>
          <app-button variant="primary" @button-click="${this.saveLabelSettings}" ?loading="${this.labelSettingsLoading}">
            Save Label Settings
          </app-button>
        </div>

        <div class="grid-2">
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
            <small class="help-text">
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
            <small class="help-text">
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
            <small class="help-text">
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
            <small class="help-text">
              Next number to assign to new items
            </small>
          </div>
        </div>
        
        ${this.previewLabel ? html`
          <div class="preview-box">
            <strong>Preview:</strong> 
            <span class="preview-label">
              ${this.previewLabel}
            </span>
          </div>
        ` : ''}
      </div>

      <!-- Danger Zone -->
      <div class="danger-zone">
        <div class="danger-zone-content">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>warning-sign</title><g fill="currentColor"><circle data-stroke="none" cx="8" cy="12" r="1" fill="currentColor" stroke="none"></circle><line x1="8" y1="4.5" x2="8" y2="9.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></line><path d="M.741,12.776,6.97,1.208a1.17,1.17,0,0,1,2.06,0l6.229,11.568a1.17,1.17,0,0,1-1.03,1.724H1.771A1.17,1.17,0,0,1,.741,12.776Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
            Danger Zone
          </h2>
          
          <div class="danger-zone-warning">
            <h4>Permanent Account Deletion</h4>
            <p>Once you delete your account, there is no going back. This action will permanently:</p>
            <ul>
              <li>Delete all your items, photos, and attachments</li>
              <li>Remove all categories, locations, and custom fields</li>
              <li>Destroy your entire workspace and all associated data</li>
              <li>Cancel any active subscriptions or services</li>
              <li>Delete your user account and profile</li>
            </ul>
            <p><strong>This action cannot be undone and your data cannot be recovered.</strong></p>
          </div>

          <div style="display: flex; justify-content: flex-start;">
            <app-button 
              variant="danger" 
              class="danger-button"
              ?loading="${this.deletingAccount}"
              @button-click="${this.handleDeleteAccount}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
              </svg>
              ${this.deletingAccount ? 'Deleting Account...' : 'Delete Account & All Data'}
            </app-button>
          </div>
        </div>
      </div>
    `;
  }
} 