// Investment Types
export type InvestmentType = 'managed-fund' | 'etf' | 'property';

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  provider: string;
  units?: number;
  unitPrice?: number;
  totalValue: number;
  purchaseDate: Date;
  updatedAt: Date;
  createdAt: Date;
}

// NZ-specific providers
export interface InvestmentProvider {
  id: string;
  name: string;
  type: InvestmentType;
  country: 'NZ' | 'AU' | 'US' | 'OTHER';
}

// Portfolio Analytics
export interface PortfolioSummary {
  totalNetWorth: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  assetAllocation: AssetAllocation[];
  lastUpdated: Date;
}

export interface AssetAllocation {
  type: InvestmentType;
  value: number;
  percentage: number;
  color: string;
}

export interface PortfolioHistory {
  date: Date;
  totalValue: number;
  investments: {
    id: string;
    value: number;
  }[];
}

// User Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// Form Types
export interface CreateInvestmentForm {
  name: string;
  type: InvestmentType;
  provider: string;
  units?: number;
  unitPrice?: number;
  totalValue: number;
  purchaseDate: Date;
}

export interface UpdateInvestmentForm extends Partial<CreateInvestmentForm> {
  id: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}
