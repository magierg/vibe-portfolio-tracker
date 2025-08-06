import { Investment, PortfolioSummary, AssetAllocation, PortfolioHistory } from '@/types';
import { INVESTMENT_TYPE_COLORS } from '@/lib/constants';

// Calculate portfolio summary from investments
export function calculatePortfolioSummary(investments: Investment[]): PortfolioSummary {
  if (investments.length === 0) {
    return {
      totalNetWorth: 0,
      totalGainLoss: 0,
      totalGainLossPercentage: 0,
      assetAllocation: [],
      lastUpdated: new Date(),
    };
  }

  const totalNetWorth = investments.reduce((sum, investment) => sum + investment.totalValue, 0);
  
  // Calculate asset allocation
  const typeValueMap = new Map<string, number>();
  
  investments.forEach((investment) => {
    const currentValue = typeValueMap.get(investment.type) || 0;
    typeValueMap.set(investment.type, currentValue + investment.totalValue);
  });

  const assetAllocation: AssetAllocation[] = Array.from(typeValueMap.entries()).map(([type, value]) => ({
    type: type as any,
    value,
    percentage: (value / totalNetWorth) * 100,
    color: INVESTMENT_TYPE_COLORS[type as keyof typeof INVESTMENT_TYPE_COLORS] || '#6B7280',
  }));

  // For gain/loss calculation, we would need historical data or purchase prices
  // For now, we'll set these to 0 as we don't have this data structure yet
  const totalGainLoss = 0;
  const totalGainLossPercentage = 0;

  return {
    totalNetWorth,
    totalGainLoss,
    totalGainLossPercentage,
    assetAllocation,
    lastUpdated: new Date(),
  };
}

// Calculate portfolio value over time (mock implementation)
export function calculatePortfolioHistory(
  investments: Investment[],
  days: number = 30
): PortfolioHistory[] {
  const history: PortfolioHistory[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Mock calculation - in a real app, you'd have historical price data
    const baseValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
    const randomVariation = (Math.random() - 0.5) * 0.1; // ±5% random variation
    const totalValue = baseValue * (1 + randomVariation);

    history.push({
      date,
      totalValue,
      investments: investments.map(inv => ({
        id: inv.id,
        value: inv.totalValue * (1 + randomVariation),
      })),
    });
  }

  return history;
}

// Get top performing investments
export function getTopPerformingInvestments(
  investments: Investment[],
  limit: number = 5
): Investment[] {
  return investments
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, limit);
}

// Calculate diversification score (0-100)
export function calculateDiversificationScore(investments: Investment[]): number {
  if (investments.length === 0) return 0;

  const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  
  // Calculate concentration risk
  const concentrationRisk = investments.reduce((risk, inv) => {
    const weight = inv.totalValue / totalValue;
    return risk + (weight * weight);
  }, 0);

  // Convert to diversification score (lower concentration = higher diversification)
  const diversificationScore = Math.max(0, 100 - (concentrationRisk * 100));
  
  return Math.round(diversificationScore);
}

// Calculate allocation by provider
export function calculateProviderAllocation(investments: Investment[]) {
  const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  
  if (totalValue === 0) return [];

  const providerMap = new Map<string, number>();
  
  investments.forEach((investment) => {
    const currentValue = providerMap.get(investment.provider) || 0;
    providerMap.set(investment.provider, currentValue + investment.totalValue);
  });

  return Array.from(providerMap.entries())
    .map(([provider, value]) => ({
      provider,
      value,
      percentage: (value / totalValue) * 100,
    }))
    .sort((a, b) => b.value - a.value);
}

// Calculate monthly savings rate (would need historical data)
export function calculateMonthlySavingsRate(investments: Investment[]): number {
  // Mock implementation - in reality, you'd track monthly contributions
  const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  const estimatedMonthlySavings = totalValue * 0.05; // Assume 5% monthly growth
  
  return estimatedMonthlySavings;
}

// Get investment summary statistics
export function getInvestmentStats(investments: Investment[]) {
  const totalInvestments = investments.length;
  const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  const averageInvestmentSize = totalInvestments > 0 ? totalValue / totalInvestments : 0;
  
  const oldestInvestment = investments.reduce((oldest, inv) => 
    inv.purchaseDate < oldest.purchaseDate ? inv : oldest
  , investments[0]);

  const newestInvestment = investments.reduce((newest, inv) => 
    inv.purchaseDate > newest.purchaseDate ? inv : newest
  , investments[0]);

  return {
    totalInvestments,
    totalValue,
    averageInvestmentSize,
    oldestInvestment: oldestInvestment?.purchaseDate,
    newestInvestment: newestInvestment?.purchaseDate,
  };
}
