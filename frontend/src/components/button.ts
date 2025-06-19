import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-button')
export class AppButton extends LitElement {
  @property({ type: String })
  variant: 'primary' | 'secondary' | 'danger' = 'primary';

  @property({ type: String })
  size: 'sm' | 'md' | 'lg' = 'md';

  @property({ type: String })
  href?: string;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  type: 'button' | 'submit' | 'reset' = 'button';

  @property({ type: Boolean })
  loading = false;

  @property({ type: Boolean, attribute: 'icon-only' })
  iconOnly = false;

  static styles = css`
    :host {
      display: inline-block;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: var(--font-family-primary);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
      transition: all var(--transition-normal);
      line-height: 1;
      box-sizing: border-box;
    }

    /* Sizes */
    .btn--sm {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-xs);
    }

    .btn--md {
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: var(--font-size-sm);
    }

    .btn--lg {
      padding: var(--spacing-lg) var(--spacing-xl);
      font-size: var(--font-size-base);
    }

    /* Icon-only variants */
    .btn--icon-only {
      aspect-ratio: 1;
      justify-content: center;
    }

    .btn--icon-only.btn--sm {
      padding: var(--spacing-sm);
    }

    .btn--icon-only.btn--md {
      padding: var(--spacing-md);
    }

    .btn--icon-only.btn--lg {
      padding: var(--spacing-lg);
    }

    /* Variants */
    .btn--primary {
      background: var(--btn-primary-bg);
      color: var(--btn-primary-text);
      border: 1px solid var(--btn-primary-bg);
    }

    .btn--primary:hover:not(:disabled) {
      background: var(--btn-primary-bg-hover);
      border-color: var(--btn-primary-bg-hover);
    }

    .btn--secondary {
      background: var(--btn-secondary-bg);
      color: var(--btn-secondary-text);
      border: 1px solid var(--btn-secondary-border);
    }

    .btn--secondary:hover:not(:disabled) {
      background: var(--btn-secondary-bg-hover);
      border-color: var(--btn-secondary-bg-hover);
    }

    .btn--danger {
      background: var(--btn-danger-bg);
      color: var(--btn-danger-text);
      border: 1px solid var(--btn-danger-bg);
    }

    .btn--danger:hover:not(:disabled) {
      background: var(--btn-danger-bg-hover);
      border-color: var(--btn-danger-bg-hover);
    }

    .btn:disabled {
      background: var(--color-bg-tertiary);
      color: var(--color-text-secondary);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn:disabled:hover {
      background: var(--color-bg-tertiary);
      border-color: var(--color-border-primary);
    }

    ::slotted(svg) {
      width: 16px;
      height: 16px;
      opacity: 0.8;
    }

    .btn--sm ::slotted(svg) {
      width: 14px;
      height: 14px;
    }

    .btn--lg ::slotted(svg) {
      width: 18px;
      height: 18px;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .btn--sm .loading-spinner {
      width: 14px;
      height: 14px;
    }

    .btn--lg .loading-spinner {
      width: 18px;
      height: 18px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  private handleClick(e: Event) {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Dispatch custom click event
    this.dispatchEvent(new CustomEvent('button-click', {
      detail: { originalEvent: e },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const classes = `btn btn--${this.variant} btn--${this.size}${this.iconOnly ? ' btn--icon-only' : ''}`;

    if (this.href && !this.disabled) {
      return html`
        <a
          href="${this.href}"
          class="${classes}"
          @click="${this.handleClick}"
        >
          ${this.loading ? html`<div class="loading-spinner"></div>` : ''}
          <slot></slot>
        </a>
      `;
    }

    return html`
      <button
        type="${this.type}"
        class="${classes}"
        ?disabled="${this.disabled || this.loading}"
        @click="${this.handleClick}"
      >
        ${this.loading ? html`<div class="loading-spinner"></div>` : ''}
        <slot></slot>
      </button>
    `;
  }
} 