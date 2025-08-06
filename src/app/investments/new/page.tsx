'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { createInvestment } from '@/services/investments';
import { investmentSchema, InvestmentFormData } from '@/lib/validations';
import { NZ_INVESTMENT_PROVIDERS, getProvidersByType } from '@/lib/constants';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewInvestmentPage() {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
  });

  const selectedType = watch('type');
  const units = watch('units');
  const unitPrice = watch('unitPrice');

  // Auto-calculate total value when units or unit price changes
  React.useEffect(() => {
    if (units && unitPrice) {
      setValue('totalValue', units * unitPrice);
    }
  }, [units, unitPrice, setValue]);

  const onSubmit = async (data: InvestmentFormData) => {
    if (!user) {
      toast.error('You must be logged in to add investments');
      return;
    }

    setIsLoading(true);
    try {
      await createInvestment(user.uid, data);
      toast.success('Investment added successfully!');
      router.push('/investments');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add investment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const filteredProviders = selectedType 
    ? getProvidersByType(selectedType) 
    : NZ_INVESTMENT_PROVIDERS;

  return (
    <DashboardLayout activeTab="add">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New Investment</h1>
            <p className="text-muted-foreground">
              Track a new investment in your portfolio
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Investment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Investment Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Investment Name</label>
                <Input
                  {...register('name')}
                  placeholder="e.g., Simplicity Growth Fund"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Investment Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Investment Type</label>
                <select
                  {...register('type')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                >
                  <option value="">Select investment type</option>
                  <option value="managed-fund">Managed Fund</option>
                  <option value="etf">ETF</option>
                  <option value="property">Property</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              {/* Provider */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Provider</label>
                <select
                  {...register('provider')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                >
                  <option value="">Select provider</option>
                  {filteredProviders.map((provider) => (
                    <option key={provider.id} value={provider.name}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                {errors.provider && (
                  <p className="text-sm text-destructive">{errors.provider.message}</p>
                )}
              </div>

              {/* Units and Unit Price (optional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Units (Optional)</label>
                  <Input
                    {...register('units', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="e.g., 100"
                    disabled={isLoading}
                  />
                  {errors.units && (
                    <p className="text-sm text-destructive">{errors.units.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit Price (Optional)</label>
                  <Input
                    {...register('unitPrice', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="e.g., 1.50"
                    disabled={isLoading}
                  />
                  {errors.unitPrice && (
                    <p className="text-sm text-destructive">{errors.unitPrice.message}</p>
                  )}
                </div>
              </div>

              {/* Total Value */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Value (NZD)</label>
                <Input
                  {...register('totalValue', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="e.g., 1500.00"
                  disabled={isLoading}
                />
                {errors.totalValue && (
                  <p className="text-sm text-destructive">{errors.totalValue.message}</p>
                )}
                {units && unitPrice && (
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated: {units} × ${unitPrice} = ${(units * unitPrice).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Purchase Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase Date</label>
                <Input
                  {...register('purchaseDate', { valueAsDate: true })}
                  type="date"
                  disabled={isLoading}
                />
                {errors.purchaseDate && (
                  <p className="text-sm text-destructive">{errors.purchaseDate.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Adding Investment...' : 'Add Investment'}
                </Button>
                <Button type="button" variant="outline" onClick={handleBack}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
