// Currency utility functions and constants

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

// Common currencies with their information
export const CURRENCIES: CurrencyInfo[] = [
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

/**
 * Format currency amount using the appropriate locale and currency code
 */
export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  if (!amount) return '';
  
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  const locale = currency?.locale || 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};

/**
 * Get currency information by code
 */
export const getCurrencyInfo = (currencyCode: string): CurrencyInfo | undefined => {
  return CURRENCIES.find(c => c.code === currencyCode);
};

/**
 * Get all available currencies sorted by name
 */
export const getAvailableCurrencies = (): CurrencyInfo[] => {
  return [...CURRENCIES].sort((a, b) => a.name.localeCompare(b.name));
}; 