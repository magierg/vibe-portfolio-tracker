import { InvestmentProvider } from '@/types';

// NZ-specific investment providers
export const NZ_INVESTMENT_PROVIDERS: InvestmentProvider[] = [
  // Managed Funds
  { id: 'simplicity', name: 'Simplicity', type: 'managed-fund', country: 'NZ' },
  { id: 'kernel', name: 'Kernel Wealth', type: 'managed-fund', country: 'NZ' },
  { id: 'generate', name: 'Generate', type: 'managed-fund', country: 'NZ' },
  { id: 'milford', name: 'Milford Asset Management', type: 'managed-fund', country: 'NZ' },
  { id: 'fisher-funds', name: 'Fisher Funds', type: 'managed-fund', country: 'NZ' },
  { id: 'superlife', name: 'SuperLife', type: 'managed-fund', country: 'NZ' },
  { id: 'aon', name: 'Aon KiwiSaver', type: 'managed-fund', country: 'NZ' },
  
  // ETFs - NZX Listed
  { id: 'smartshares', name: 'Smartshares', type: 'etf', country: 'NZ' },
  { id: 'vanguard-nz', name: 'Vanguard (NZ)', type: 'etf', country: 'NZ' },
  { id: 'blackrock-nz', name: 'iShares (NZ)', type: 'etf', country: 'NZ' },
  
  // International ETFs
  { id: 'vanguard-us', name: 'Vanguard (US)', type: 'etf', country: 'US' },
  { id: 'blackrock-us', name: 'iShares (US)', type: 'etf', country: 'US' },
  { id: 'vanguard-au', name: 'Vanguard (AU)', type: 'etf', country: 'AU' },
  
  // Property
  { id: 'residential-property', name: 'Residential Property', type: 'property', country: 'NZ' },
  { id: 'commercial-property', name: 'Commercial Property', type: 'property', country: 'NZ' },
  { id: 'property-syndicate', name: 'Property Syndicate', type: 'property', country: 'NZ' },
];

// Investment type colors for charts
export const INVESTMENT_TYPE_COLORS = {
  'managed-fund': '#3B82F6', // Blue
  'etf': '#10B981', // Green
  'property': '#F59E0B', // Orange
} as const;

// Currency formatting for NZ
export const formatNZD = (amount: number): string => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Percentage formatting
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

// Date formatting
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-NZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Get provider by ID
export const getProviderById = (id: string): InvestmentProvider | undefined => {
  return NZ_INVESTMENT_PROVIDERS.find(provider => provider.id === id);
};

// Get providers by type
export const getProvidersByType = (type: string): InvestmentProvider[] => {
  return NZ_INVESTMENT_PROVIDERS.filter(provider => provider.type === type);
};
