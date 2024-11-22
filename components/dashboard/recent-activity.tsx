'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useProducts } from '@/lib/hooks/use-products';
import { format } from 'date-fns';

export function RecentActivity() {
  const { movements } = useInventory();
  const { getProductById } = useProducts();

  // Get the 5 most recent movements
  const recentMovements = [...movements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest inventory movements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentMovements.map((movement) => {
            const product = getProductById(movement.inventoryItemId);

            return (
              <div
                key={movement.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`rounded-full p-2 ${
                      movement.type === 'INBOUND'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {movement.type === 'INBOUND' ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{product?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-muted-foreground">
                      {movement.type === 'INBOUND' ? 'Received' : 'Shipped'}{' '}
                      {movement.quantity} units
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(movement.date), 'MMM d, yyyy')}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}