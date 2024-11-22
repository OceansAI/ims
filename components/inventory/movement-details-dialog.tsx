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
import { Separator } from '@/components/ui/separator';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useProducts } from '@/lib/hooks/use-products';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Package, Truck, FileText, Image as ImageIcon } from 'lucide-react';

interface MovementDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movementId: string;
}

export function MovementDetailsDialog({
  open,
  onOpenChange,
  movementId,
}: MovementDetailsDialogProps) {
  const { movements, getItemById } = useInventory();
  const { getProductById } = useProducts();

  const movement = movements.find(m => m.id === movementId);
  const item = movement ? getItemById(movement.inventoryItemId) : null;
  const product = item ? getProductById(item.productId) : null;

  if (!movement || !item || !product) return null;

  // Parse carrier and tracking info from notes
  const [carrierInfo, ...otherNotes] = movement.notes?.split('\n') || [];
  const [carrier, trackingNumber] = carrierInfo?.split(' - ') || [];
  const notes = otherNotes.join('\n');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Movement Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Movement Type and Date */}
          <div className="flex items-center justify-between">
            <Badge 
              variant={movement.type === 'INBOUND' ? 'success' : 'destructive'}
              className="flex items-center gap-1 px-4 py-1"
            >
              {movement.type === 'INBOUND' ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
              {movement.type}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(new Date(movement.date), 'PPpp')}
            </span>
          </div>

          {/* Product Information */}
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-start gap-4">
              <Package className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">Product Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <p className="text-sm font-medium">{product.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">SKU</label>
                    <p className="text-sm font-medium">{product.sku}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Category</label>
                    <p className="text-sm font-medium">{product.category}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Customer</label>
                    <p className="text-sm font-medium">{product.customerId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-start gap-4">
              <Truck className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">Shipping Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  <div>
                    <label className="text-sm text-muted-foreground">Carrier</label>
                    <p className="text-sm font-medium">{carrier}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Tracking Number</label>
                    <p className="text-sm font-medium">{trackingNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Quantity</label>
                    <p className="text-sm font-medium">{movement.quantity} units</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold">Notes</h3>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Attachments (placeholder for future implementation) */}
          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <ImageIcon className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">Attachments</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  No attachments available
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}