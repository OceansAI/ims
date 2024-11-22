'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useProducts } from '@/lib/hooks/use-products';
import { format } from 'date-fns';

interface ViewAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditId: string;
}

export function ViewAuditDialog({
  open,
  onOpenChange,
  auditId,
}: ViewAuditDialogProps) {
  const { getAuditById } = useInventory();
  const { getProductById } = useProducts();

  const audit = getAuditById(auditId);
  
  if (!audit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Audit Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(audit.date), 'PPpp')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge
                variant={audit.status === 'completed' ? 'success' : 'secondary'}
              >
                {audit.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Performed By</p>
              <p className="text-sm text-muted-foreground">
                {audit.performedBy}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm text-muted-foreground">
                {audit.notes || 'No notes provided'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Audit Results</h3>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Expected Qty</TableHead>
                    <TableHead>Actual Qty</TableHead>
                    <TableHead>Discrepancy</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audit.items.map((item) => {
                    const product = getProductById(item.productId);
                    const discrepancy = item.actualQty - item.expectedQty;

                    return (
                      <TableRow key={item.productId}>
                        <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                        <TableCell>{item.expectedQty}</TableCell>
                        <TableCell>{item.actualQty}</TableCell>
                        <TableCell>
                          <span
                            className={
                              discrepancy === 0
                                ? 'text-green-500'
                                : 'text-red-500'
                            }
                          >
                            {discrepancy > 0 ? '+' : ''}
                            {discrepancy}
                          </span>
                        </TableCell>
                        <TableCell>{item.notes || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}