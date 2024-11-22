'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductList } from '@/components/products/product-list';
import { AddProductDialog } from '@/components/products/add-product-dialog';
import { Plus } from 'lucide-react';

export default function ProductsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      <ProductList />
      <AddProductDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}