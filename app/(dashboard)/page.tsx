'use client';

import { DashboardMetrics } from '@/components/dashboard/metrics';
import { InventoryOverview } from '@/components/dashboard/inventory-overview';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { useAuth } from '@/components/auth/auth-provider';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user?.email}
        </p>
      </div>
      
      <DashboardMetrics />
      <div className="grid gap-6 md:grid-cols-2">
        <InventoryOverview />
        <RecentActivity />
      </div>
    </div>
  );
}