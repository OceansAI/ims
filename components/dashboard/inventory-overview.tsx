'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useProducts } from '@/lib/hooks/use-products';
import { useStorageRates } from '@/lib/hooks/use-storage-rates';

export function InventoryOverview() {
  const { items } = useInventory();
  const { getProductById } = useProducts();
  const { getCurrentRate } = useStorageRates();

  // Sort items by quantity on hand (descending)
  const sortedItems = [...items]
    .sort((a, b) => b.qtyOnHand - a.qtyOnHand)
    .slice(0, 5); // Show top 5 items

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Overview</CardTitle>
        <CardDescription>Top items by quantity on hand</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => {
              const product = getProductById(item.productId);
              const rate = getCurrentRate(item.productId);
              const value = item.qtyOnHand * rate;

              return (
                <TableRow key={item.id}>
                  <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                  <TableCell>{item.qtyOnHand}</TableCell>
                  <TableCell>${value.toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}