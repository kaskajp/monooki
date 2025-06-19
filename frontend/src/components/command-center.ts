import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './button.js';

interface SearchResult {
  id: string;
  title: string;
  type: 'item' | 'location' | 'category';
  subtitle?: string;
  url: string;
}

@customElement('command-center')
export class CommandCenter extends LitElement {
  @state()
  private isOpen = false;

  @state()
  private searchQuery = '';

  @state()
  private searchResults: SearchResult[] = [];

  @state()
  private isLoading = false;

  @state()
  private selectedIndex = 0;

  static styles = css`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 10vh;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
    }

    .overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .command-panel {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 600px;
      max-height: 70vh;
      overflow: hidden;
      box-shadow: var(--shadow-xl);
      transform: scale(0.95);
      transition: transform 0.2s ease;
    }

    .overlay.open .command-panel {
      transform: scale(1);
    }

    .search-input {
      width: 100%;
      padding: 1.5rem;
      background: transparent;
      border: none;
      outline: none;
      font-size: 18px;
      color: var(--color-text-primary);
      border-bottom: 1px solid var(--color-border-primary);
    }

    .search-input::placeholder {
      color: var(--color-text-secondary);
    }

    .results-container {
      max-height: 400px;
      overflow-y: auto;
    }

    .section {
      border-bottom: 1px solid var(--color-border-primary);
    }

    .section:last-child {
      border-bottom: none;
    }

    .section-header {
      padding: 1rem 1.5rem 0.5rem;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .result-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      transition: background-color 0.15s ease;
    }

    .result-item:hover,
    .result-item.selected {
      background: var(--color-bg-tertiary);
    }

    .result-icon {
      width: 16px;
      height: 16px;
      margin-right: 0.75rem;
      color: var(--color-text-secondary);
    }

    .result-content {
      flex: 1;
    }

    .result-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-primary);
      margin: 0 0 2px 0;
    }

    .result-subtitle {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .result-type {
      font-size: 11px;
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-left: auto;
      padding-left: 1rem;
    }

    .quick-actions {
      padding: 1rem 1.5rem;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .quick-action-btn {
      padding: 0.75rem;
      text-align: center;
      font-size: 12px;
    }

    .empty-state {
      padding: 2rem 1.5rem;
      text-align: center;
      color: var(--color-text-secondary);
    }

    .loading {
      padding: 1rem 1.5rem;
      text-align: center;
      color: var(--color-text-secondary);
    }

    .kbd {
      display: inline-block;
      padding: 2px 6px;
      background: var(--color-bg-tertiary);
      border: 1px solid var(--color-border-primary);
      border-radius: 4px;
      font-size: 11px;
      font-family: monospace;
      color: var(--color-text-secondary);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.handleGlobalKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
  }

  private handleGlobalKeyDown = (e: KeyboardEvent) => {
    // Handle CMD+K to open command center
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      this.open();
      return;
    }

    // Handle keys when command center is open
    if (this.isOpen) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.selectedIndex = Math.min(this.selectedIndex + 1, this.getAllSelectableItems().length - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
          break;
        case 'Enter':
          // Only handle Enter if we're not focused on the search input
          const activeElement = document.activeElement;
          const searchInput = this.shadowRoot?.querySelector('.search-input');
          if (activeElement !== searchInput) {
            e.preventDefault();
            this.executeSelected();
          }
          break;
        case 'Escape':
          e.preventDefault();
          this.close();
          break;
      }
    }
  };

  private getAllSelectableItems() {
    const quickActions = 3; // Number of quick action buttons
    return [...Array(quickActions), ...this.searchResults];
  }

  private executeSelected() {
    const allItems = this.getAllSelectableItems();
    const selectedItem = allItems[this.selectedIndex];
    
    if (this.selectedIndex < 3) {
      // Quick actions
      const actions = ['items', 'locations', 'categories'];
      this.navigateToCreate(actions[this.selectedIndex]);
    } else {
      // Search results
      const result = this.searchResults[this.selectedIndex - 3];
      if (result) {
        this.navigateToResult(result);
      }
    }
  }

  private open() {
    this.isOpen = true;
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedIndex = 0;
    
    // Focus search input after animation
    setTimeout(() => {
      const input = this.shadowRoot?.querySelector('.search-input') as HTMLInputElement;
      input?.focus();
    }, 100);
  }

  private close() {
    this.isOpen = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedIndex = 0;
  }

  private async handleSearch(e: Event) {
    const input = e.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.selectedIndex = 0;

    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.isLoading = true;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Search across all data types
      const [itemsResponse, locationsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/items', { headers }),
        fetch('/api/locations', { headers }),
        fetch('/api/categories', { headers })
      ]);

      if (itemsResponse.ok && locationsResponse.ok && categoriesResponse.ok) {
        const [items, locations, categories] = await Promise.all([
          itemsResponse.json(),
          locationsResponse.json(),
          categoriesResponse.json()
        ]);

        const query = this.searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        // Search items
        items.forEach((item: any) => {
          if (item.name.toLowerCase().includes(query) || 
              item.description?.toLowerCase().includes(query)) {
            results.push({
              id: item.id,
              title: item.name,
              subtitle: item.description,
              type: 'item',
              url: `/items/${item.id}`
            });
          }
        });

        // Search locations
        locations.forEach((location: any) => {
          if (location.name.toLowerCase().includes(query) || 
              location.description?.toLowerCase().includes(query)) {
            results.push({
              id: location.id,
              title: location.name,
              subtitle: location.description,
              type: 'location',
              url: `/locations`
            });
          }
        });

        // Search categories
        categories.forEach((category: any) => {
          if (category.name.toLowerCase().includes(query) || 
              category.description?.toLowerCase().includes(query)) {
            results.push({
              id: category.id,
              title: category.name,
              subtitle: category.description,
              type: 'category',
              url: `/categories`
            });
          }
        });

        this.searchResults = results.slice(0, 10); // Limit to 10 results
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private navigateToResult(result: SearchResult) {
    this.close();
    // Dispatch navigation event
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { url: result.url },
      bubbles: true
    }));
  }

  private navigateToCreate(type: string) {
    this.close();
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { url: `/${type}`, action: 'create' },
      bubbles: true
    }));
  }

  private getResultIcon(type: string) {
    switch (type) {
      case 'item':
        return html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="result-icon"><title>16 file copies</title><g stroke-miterlimit="10" fill="currentColor" class="nc-icon-wrapper"><rect x="2.5" y="4.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="9" height="11"></rect> <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" points="4.5,2.5 13.5,2.5 13.5,13.5 " data-color="color-2"></polyline> <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" points="7.5,0.5 15.5,0.5 15.5,10.5 " data-color="color-2"></polyline></g></svg>`;
      case 'location':
        return html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="result-icon"><title>16 position marker</title><g fill="currentColor" class="nc-icon-wrapper"><line x1="8.5" y1="12.5" x2="8.5" y2="8.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></line> <circle cx="8.5" cy="4.5" r="4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></circle> <path d="M11,11.681c2.066.316,3.5,1.012,3.5,1.819,0,1.105-2.686,2-6,2s-6-.895-6-2c0-.807,1.434-1.5,3.5-1.819" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-color="color-2"></path></g></svg>`;
      case 'category':
        return html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="result-icon"><title>16 tag cut</title><g stroke-miterlimit="10" fill="currentColor" class="nc-icon-wrapper"><polygon fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" points="3.5,0.5 8.5,1.5 15.5,8.5 8.5,15.5 1.5,8.5 0.5,3.5 " data-cap="butt"></polygon> <circle fill="currentColor" cx="5" cy="5" r="1" data-color="color-2" data-stroke="none"></circle></g></svg>`;
      default:
        return html``;
    }
  }

  render() {
    return html`
      <div class="overlay ${this.isOpen ? 'open' : ''}" @click="${this.handleOverlayClick}">
        <div class="command-panel" @click="${(e: Event) => e.stopPropagation()}">
          <input
            type="text"
            class="search-input"
            placeholder="Search items, locations, categories... or create new"
            .value="${this.searchQuery}"
            @input="${this.handleSearch}"
          />

          <div class="results-container">
            ${!this.searchQuery ? html`
              <div class="section">
                <div class="section-header">Quick Actions</div>
                <div class="quick-actions">
                  <app-button 
                    class="quick-action-btn ${this.selectedIndex === 0 ? 'selected' : ''}"
                    variant="secondary" 
                    size="sm"
                    @click="${() => this.navigateToCreate('items')}"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 file copies</title><g stroke-miterlimit="10" fill="currentColor" class="nc-icon-wrapper"><rect x="2.5" y="4.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="9" height="11"></rect> <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" points="4.5,2.5 13.5,2.5 13.5,13.5 " data-color="color-2"></polyline> <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" points="7.5,0.5 15.5,0.5 15.5,10.5 " data-color="color-2"></polyline></g></svg>
                    New Item
                  </app-button>
                  <app-button 
                    class="quick-action-btn ${this.selectedIndex === 1 ? 'selected' : ''}"
                    variant="secondary" 
                    size="sm"
                    @click="${() => this.navigateToCreate('locations')}"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 position marker</title><g fill="currentColor" class="nc-icon-wrapper"><line x1="8.5" y1="12.5" x2="8.5" y2="8.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></line> <circle cx="8.5" cy="4.5" r="4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></circle> <path d="M11,11.681c2.066.316,3.5,1.012,3.5,1.819,0,1.105-2.686,2-6,2s-6-.895-6-2c0-.807,1.434-1.5,3.5-1.819" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-color="color-2"></path></g></svg>
                    New Location
                  </app-button>
                  <app-button 
                    class="quick-action-btn ${this.selectedIndex === 2 ? 'selected' : ''}"
                    variant="secondary" 
                    size="sm"
                    @click="${() => this.navigateToCreate('categories')}"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><title>16 tag cut</title><g stroke-miterlimit="10" fill="currentColor" class="nc-icon-wrapper"><polygon fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" points="3.5,0.5 8.5,1.5 15.5,8.5 8.5,15.5 1.5,8.5 0.5,3.5 " data-cap="butt"></polygon> <circle fill="currentColor" cx="5" cy="5" r="1" data-color="color-2" data-stroke="none"></circle></g></svg>
                    New Category
                  </app-button>
                </div>
              </div>
              <div class="section">
                <div class="empty-state">
                  <p>Type to search or use <span class="kbd">↑</span><span class="kbd">↓</span> to navigate</p>
                  <p><span class="kbd">⌘K</span> to open • <span class="kbd">ESC</span> to close</p>
                </div>
              </div>
            ` : html`
              ${this.isLoading ? html`
                <div class="loading">Searching...</div>
              ` : ''}
              
              ${this.searchResults.length > 0 ? html`
                <div class="section">
                  <div class="section-header">Search Results</div>
                  ${this.searchResults.map((result, index) => html`
                    <button 
                      class="result-item ${this.selectedIndex === index + 3 ? 'selected' : ''}"
                      @click="${() => this.navigateToResult(result)}"
                    >
                      ${this.getResultIcon(result.type)}
                      <div class="result-content">
                        <div class="result-title">${result.title}</div>
                        ${result.subtitle ? html`<div class="result-subtitle">${result.subtitle}</div>` : ''}
                      </div>
                      <div class="result-type">${result.type}</div>
                    </button>
                  `)}
                </div>
              ` : !this.isLoading ? html`
                <div class="section">
                  <div class="empty-state">
                    <p>No results found for "${this.searchQuery}"</p>
                  </div>
                </div>
              ` : ''}
            `}
          </div>
        </div>
      </div>
    `;
  }

  private handleOverlayClick() {
    this.close();
  }
} 