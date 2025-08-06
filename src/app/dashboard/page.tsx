'use client';

import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getUserInvestments } from '@/services/investments';
import { calculatePortfolioSummary } from '@/services/portfolio';
import { Investment, PortfolioSummary } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatNZD, formatPercentage } from '@/lib/constants';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType = 'neutral', icon }: StatCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp size={16} />;
      case 'negative':
        return <TrendingDown size={16} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 text-sm ${getChangeColor()}`}>
                {getChangeIcon()}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AssetAllocationCardProps {
  portfolioSummary: PortfolioSummary;
}

function AssetAllocationCard({ portfolioSummary }: AssetAllocationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart size={20} />
          Asset Allocation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {portfolioSummary.assetAllocation.map((allocation) => (
            <div key={allocation.type} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: allocation.color }}
                />
                <span className="text-sm font-medium capitalize">
                  {allocation.type.replace('-', ' ')}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatNZD(allocation.value)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(allocation.percentage)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentInvestmentsProps {
  investments: Investment[];
}

function RecentInvestments({ investments }: RecentInvestmentsProps) {
  const recentInvestments = investments.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Investments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentInvestments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No investments yet</p>
          ) : (
            recentInvestments.map((investment) => (
              <div key={investment.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{investment.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {investment.type.replace('-', ' ')} • {investment.provider}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatNZD(investment.totalValue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(investment.purchaseDate).toLocaleDateString('en-NZ')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
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
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!portfolioSummary) {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load portfolio data</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your investment portfolio.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Net Worth"
            value={formatNZD(portfolioSummary.totalNetWorth)}
            icon={<DollarSign size={24} />}
          />
          <StatCard
            title="Total Investments"
            value={investments.length.toString()}
            icon={<TrendingUp size={24} />}
          />
          <StatCard
            title="Asset Types"
            value={portfolioSummary.assetAllocation.length.toString()}
            icon={<PieChart size={24} />}
          />
          <StatCard
            title="Portfolio Gain/Loss"
            value={formatNZD(portfolioSummary.totalGainLoss)}
            change={formatPercentage(portfolioSummary.totalGainLossPercentage)}
            changeType={portfolioSummary.totalGainLoss >= 0 ? 'positive' : 'negative'}
            icon={portfolioSummary.totalGainLoss >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          />
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssetAllocationCard portfolioSummary={portfolioSummary} />
          <RecentInvestments investments={investments} />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/investments/new"
                className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
              >
                <TrendingUp className="mx-auto mb-2" size={24} />
                <p className="font-medium">Add Investment</p>
                <p className="text-sm text-muted-foreground">Track a new investment</p>
              </a>
              <a
                href="/investments"
                className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
              >
                <PieChart className="mx-auto mb-2" size={24} />
                <p className="font-medium">View All Investments</p>
                <p className="text-sm text-muted-foreground">Manage your portfolio</p>
              </a>
              <a
                href="/analytics"
                className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
              >
                <DollarSign className="mx-auto mb-2" size={24} />
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-muted-foreground">Detailed insights</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
