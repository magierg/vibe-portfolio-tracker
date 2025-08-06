'use client';

import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getUserInvestments } from '@/services/investments';
import { 
  calculatePortfolioSummary, 
  calculatePortfolioHistory,
  getTopPerformingInvestments,
  calculateDiversificationScore,
  calculateProviderAllocation 
} from '@/services/portfolio';
import { Investment, PortfolioSummary } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatNZD, formatPercentage, INVESTMENT_TYPE_COLORS } from '@/lib/constants';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar 
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Target } from 'lucide-react';

interface AnalyticsPageProps {}

export default function AnalyticsPage({}: AnalyticsPageProps) {
  const [user] = useAuthState(auth);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const userInvestments = await getUserInvestments(user.uid);
        setInvestments(userInvestments);
        
        const summary = calculatePortfolioSummary(userInvestments);
        setPortfolioSummary(summary);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!portfolioSummary || investments.length === 0) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Detailed insights into your investment portfolio
            </p>
          </div>
          
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analytics Available</h3>
              <p className="text-muted-foreground">
                Add some investments to see detailed analytics and insights
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const portfolioHistory = calculatePortfolioHistory(investments, 30);
  const topInvestments = getTopPerformingInvestments(investments, 5);
  const diversificationScore = calculateDiversificationScore(investments);
  const providerAllocation = calculateProviderAllocation(investments);

  // Prepare chart data
  const pieChartData = portfolioSummary.assetAllocation.map(allocation => ({
    name: allocation.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: allocation.value,
    percentage: allocation.percentage,
    color: allocation.color,
  }));

  const lineChartData = portfolioHistory.map(point => ({
    date: point.date.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' }),
    value: point.totalValue,
  }));

  const providerChartData = providerAllocation.slice(0, 6).map(provider => ({
    name: provider.provider.length > 15 ? provider.provider.substring(0, 15) + '...' : provider.provider,
    value: provider.value,
    percentage: provider.percentage,
  }));

  return (
    <DashboardLayout activeTab="analytics">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights into your investment portfolio
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatNZD(portfolioSummary.totalNetWorth)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <PieChartIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Asset Types</p>
                  <p className="text-2xl font-bold">{portfolioSummary.assetAllocation.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diversification</p>
                  <p className="text-2xl font-bold">{diversificationScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Holdings</p>
                  <p className="text-2xl font-bold">{investments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Allocation Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatNZD(value), 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Value Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Value (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => [formatNZD(value), 'Portfolio Value']} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Provider Allocation */}
          <Card>
            <CardHeader>
              <CardTitle>Provider Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={providerChartData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatNZD(value)} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip formatter={(value: number) => [formatNZD(value), 'Value']} />
                    <Bar dataKey="value" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Investments */}
          <Card>
            <CardHeader>
              <CardTitle>Top Investments by Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topInvestments.map((investment, index) => (
                  <div key={investment.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{investment.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {investment.type.replace('-', ' ')} • {investment.provider}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNZD(investment.totalValue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPercentage((investment.totalValue / portfolioSummary.totalNetWorth) * 100)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{diversificationScore}/100</p>
                <p className="text-sm text-muted-foreground">Diversification Score</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {diversificationScore >= 80 ? 'Excellent' : 
                   diversificationScore >= 60 ? 'Good' : 
                   diversificationScore >= 40 ? 'Fair' : 'Needs Improvement'}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatNZD(portfolioSummary.totalNetWorth / investments.length)}</p>
                <p className="text-sm text-muted-foreground">Average Investment</p>
                <p className="text-xs text-muted-foreground mt-1">Per holding</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{providerAllocation.length}</p>
                <p className="text-sm text-muted-foreground">Providers</p>
                <p className="text-xs text-muted-foreground mt-1">Total providers used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
