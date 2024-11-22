'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useProducts } from '@/lib/hooks/use-products';
import { useStorageRates } from '@/lib/hooks/use-storage-rates';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useMemo } from 'react';

export function DashboardMetrics() {
  const { products } = useProducts();
  const { items, movements } = useInventory();
  const { getCurrentRate } = useStorageRates();

  // Calculate monthly movements
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthlyMovements = movements.filter(
      (movement) => {
        const moveDate = new Date(movement.date);
        return moveDate >= monthStart && moveDate <= monthEnd;
      }
    );

    const inboundThisMonth = monthlyMovements
      .filter((m) => m.type === 'INBOUND')
      .reduce((sum, m) => sum + m.quantity, 0);

    const outboundThisMonth = monthlyMovements
      .filter((m) => m.type === 'OUTBOUND')
      .reduce((sum, m) => sum + m.quantity, 0);

    return {
      inboundThisMonth,
      outboundThisMonth,
    };
  }, [movements]);

  // Calculate storage revenue
  const storageRevenue = useMemo(() => {
    return items.reduce((total, item) => {
      const rate = 25.00; // Default rate until getCurrentRate is properly implemented
      return total + (item.qty_on_hand * rate);
    }, 0);
  }, [items]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{products.length}</div>
          <p className="text-xs text-muted-foreground">
            Across all categories
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inbound This Month</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{monthlyStats.inboundThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            Items received
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outbound This Month</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-{monthlyStats.outboundThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            Items shipped
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${storageRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Current month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}