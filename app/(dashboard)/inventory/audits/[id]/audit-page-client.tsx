'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useProducts } from '@/lib/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuditPageClientProps {
  auditId: string;
}

export default function AuditPageClient({ auditId }: AuditPageClientProps) {
  const router = useRouter();
  const { getAuditById, completeAudit, items } = useInventory();
  const { products } = useProducts();
  const [auditItems, setAuditItems] = React.useState<{ [key: string]: { actualQty: number; notes: string } }>({});
  
  const audit = getAuditById(auditId);
  
  if (!audit) {
    return <div>Audit not found</div>;
  }

  if (audit.status === 'completed') {
    router.push('/inventory/audits');
    return null;
  }

  // Filter items based on customer if specified
  const relevantItems = items.filter(item => {
    if (!audit.customerId) return true;
    const product = products.find(p => p.id === item.productId);
    return product?.customerId === audit.customerId;
  });

  const handleQuantityChange = (itemId: string, value: string) => {
    setAuditItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        actualQty: parseInt(value) || 0
      }
    }));
  };

  const handleNotesChange = (itemId: string, value: string) => {
    setAuditItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes: value
      }
    }));
  };

  const handleComplete = () => {
    const auditResults = relevantItems.map(item => ({
      productId: item.productId,
      expectedQty: item.qtyOnHand,
      actualQty: auditItems[item.id]?.actualQty || item.qtyOnHand,
      notes: auditItems[item.id]?.notes || ''
    }));

    completeAudit(auditId, auditResults);
    toast({
      title: "Audit Completed",
      description: "The inventory audit has been completed successfully."
    });
    router.push('/inventory/audits');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Conduct Inventory Audit</h1>
        <Button onClick={handleComplete}>Complete Audit</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Expected Qty</TableHead>
              <TableHead>Actual Qty</TableHead>
              <TableHead>Discrepancy</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relevantItems.map(item => {
              const product = products.find(p => p.id === item.productId);
              const actualQty = auditItems[item.id]?.actualQty ?? item.qtyOnHand;
              const discrepancy = actualQty - item.qtyOnHand;
              
              return (
                <TableRow key={item.id}>
                  <TableCell>{product?.name}</TableCell>
                  <TableCell>{product?.category}</TableCell>
                  <TableCell>{item.qtyOnHand}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={actualQty}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    {discrepancy === 0 ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Match
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {discrepancy > 0 ? '+' : ''}{discrepancy}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Textarea
                      placeholder="Add notes about any discrepancies..."
                      value={auditItems[item.id]?.notes || ''}
                      onChange={(e) => handleNotesChange(item.id, e.target.value)}
                      className="h-8 min-h-0"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
