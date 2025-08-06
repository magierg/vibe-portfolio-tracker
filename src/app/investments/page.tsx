'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getUserInvestments, deleteInvestment } from '@/services/investments';
import { Investment } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatNZD, formatDate } from '@/lib/constants';
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface InvestmentCardProps {
  investment: Investment;
  onDelete: (id: string) => void;
}

function InvestmentCard({ investment, onDelete }: InvestmentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this investment?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteInvestment(investment.id, investment.userId);
      onDelete(investment.id);
      toast.success('Investment deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete investment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{investment.name}</h3>
            <p className="text-sm text-muted-foreground capitalize mb-2">
              {investment.type.replace('-', ' ')} • {investment.provider}
            </p>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">
                {formatNZD(investment.totalValue)}
              </p>
              
              {investment.units && investment.unitPrice && (
                <p className="text-sm text-muted-foreground">
                  {investment.units} units @ {formatNZD(investment.unitPrice)} each
                </p>
              )}
              
              <p className="text-xs text-muted-foreground">
                Purchased: {formatDate(new Date(investment.purchaseDate))}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/investments/${investment.id}/edit`}>
              <Button variant="outline" size="icon">
                <Edit size={16} />
              </Button>
            </Link>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InvestmentsPage() {
  const [user] = useAuthState(auth);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchInvestments() {
      if (!user) return;

      try {
        const userInvestments = await getUserInvestments(user.uid);
        setInvestments(userInvestments);
      } catch (error) {
        console.error('Error fetching investments:', error);
        toast.error('Failed to load investments');
      } finally {
        setLoading(false);
      }
    }

    fetchInvestments();
  }, [user]);

  const handleInvestmentDeleted = (deletedId: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== deletedId));
  };

  const filteredInvestments = filter === 'all' 
    ? investments 
    : investments.filter(inv => inv.type === filter);

  const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);

  if (loading) {
    return (
      <DashboardLayout activeTab="investments">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="investments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Investments</h1>
            <p className="text-muted-foreground">
              Manage your investment portfolio
            </p>
          </div>
          <Link href="/investments/new">
            <Button>
              <Plus size={16} className="mr-2" />
              Add Investment
            </Button>
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatNZD(totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Investments</p>
                  <p className="text-2xl font-bold">{investments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Value</p>
                  <p className="text-2xl font-bold">
                    {investments.length > 0 ? formatNZD(totalValue / investments.length) : formatNZD(0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Filter by type:</span>
              <div className="flex gap-2">
                {['all', 'managed-fund', 'etf', 'property'].map((type) => (
                  <Button
                    key={type}
                    variant={filter === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(type)}
                  >
                    {type === 'all' ? 'All' : type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investments List */}
        {filteredInvestments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {filter === 'all' ? 'No investments yet' : `No ${filter.replace('-', ' ')} investments`}
              </h3>
              <p className="text-muted-foreground mb-6">
                {filter === 'all' 
                  ? 'Start building your portfolio by adding your first investment'
                  : `You haven't added any ${filter.replace('-', ' ')} investments yet`
                }
              </p>
              <Link href="/investments/new">
                <Button>
                  <Plus size={16} className="mr-2" />
                  Add Your First Investment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInvestments.map((investment) => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                onDelete={handleInvestmentDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
