'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Product } from '@/types';
import { format } from 'date-fns';
import { Package, Barcode, User, Box } from 'lucide-react';
import Image from 'next/image';

interface ViewProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function ViewProductDialog({
  open,
  onOpenChange,
  product,
}: ViewProductDialogProps) {
  const primaryImage = product.images?.find(img => img.primary);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="aspect-square relative rounded-lg border overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Basic Information
              </h3>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Name</dt>
                  <dd className="text-sm font-medium">{product.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Category</dt>
                  <dd className="text-sm font-medium">{product.category}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Description</dt>
                  <dd className="text-sm font-medium">{product.description || 'No description provided'}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Barcode className="h-4 w-4" />
                Identification
              </h3>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">SKU</dt>
                  <dd className="text-sm font-medium">{product.sku}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Customer</dt>
                  <dd className="text-sm font-medium">{product.customer_id}</dd>
                </div>
              </dl>
            </div>

            {(product.dimensions || product.weight) && (
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  Physical Properties
                </h3>
                <dl className="mt-2 space-y-2">
                  {product.dimensions && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Dimensions</dt>
                      <dd className="text-sm font-medium">{product.dimensions}</dd>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Weight</dt>
                      <dd className="text-sm font-medium">{product.weight} kg</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p>Created: {format(new Date(product.created_at), 'PPpp')}</p>
              <p>Last Updated: {format(new Date(product.updated_at), 'PPpp')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}