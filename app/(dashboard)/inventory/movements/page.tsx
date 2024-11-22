'use client';

import { useState } from 'react';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useProducts } from '@/lib/hooks/use-products';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Plus, MoreHorizontal, Eye, Pencil, X } from 'lucide-react';
import { AddMovementDialog } from '@/components/inventory/add-movement-dialog';
import { EditMovementDialog } from '@/components/inventory/edit-movement-dialog';
import { MovementDetailsDialog } from '@/components/inventory/movement-details-dialog';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Customer } from '@/types';
import Link from 'next/link';

export default function MovementsPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { movements, getItemById } = useInventory();
  const { products, getProductById } = useProducts();

  const handleEditClick = (movementId: string) => {
    setSelectedMovementId(movementId);
    setEditDialogOpen(true);
  };

  const handleViewDetails = (movementId: string) => {
    setSelectedMovementId(movementId);
    setDetailsDialogOpen(true);
  };

  // Filter movements based on all filters
  const filteredMovements = movements.filter(movement => {
    const item = getItemById(movement.inventoryItemId);
    const product = item ? getProductById(item.productId) : null;
    let passes = true;

    // Date range filter
    if (dateRange) {
      const moveDate = new Date(movement.date);
      passes = passes && isWithinInterval(moveDate, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to),
      });
    }

    // Customer filter
    if (customerFilter !== 'all' && product) {
      passes = passes && product.customerId === customerFilter;
    }

    // Product filter
    if (productFilter !== 'all' && product) {
      passes = passes && product.id === productFilter;
    }

    // Movement type filter
    if (typeFilter !== 'all') {
      passes = passes && movement.type === typeFilter;
    }

    return passes;
  });

  const clearFilters = () => {
    setDateRange(null);
    setCustomerFilter('all');
    setProductFilter('all');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Movements</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Movement
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Select
          value={customerFilter}
          onValueChange={setCustomerFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All customers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {Object.values(Customer).map((customer) => (
              <SelectItem key={customer} value={customer}>
                {customer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={productFilter}
          onValueChange={setProductFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={typeFilter}
          onValueChange={setTypeFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="INBOUND">Inbound</SelectItem>
            <SelectItem value="OUTBOUND">Outbound</SelectItem>
          </SelectContent>
        </Select>

        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="w-full sm:w-auto"
        />

        {(dateRange || customerFilter !== 'all' || productFilter !== 'all' || typeFilter !== 'all') && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset Filters
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No movements found
                </TableCell>
              </TableRow>
            ) : (
              filteredMovements
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((movement) => {
                  const item = getItemById(movement.inventoryItemId);
                  const product = item ? getProductById(item.productId) : null;
                  const [carrierInfo] = movement.notes?.split('\n') || [];
                  const [carrier, reference] = carrierInfo?.split(' - ') || [];

                  return (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {format(new Date(movement.date), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={movement.type === 'INBOUND' ? 'success' : 'destructive'}
                        >
                          {movement.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product ? (
                          <Link 
                            href={`/products/${product.id}`}
                            className="text-primary hover:underline"
                          >
                            {product.name}
                          </Link>
                        ) : (
                          'Unknown Product'
                        )}
                      </TableCell>
                      <TableCell>
                        {product ? (
                          <Link
                            href={`/customers/${product.customerId}`}
                            className="text-primary hover:underline"
                          >
                            {product.customerId}
                          </Link>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>{carrier || '-'}</TableCell>
                      <TableCell>{reference || '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(movement.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(movement.id)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Movement
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </div>

      <AddMovementDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        onSuccess={() => setAddDialogOpen(false)}
      />

      {selectedMovementId && (
        <>
          <EditMovementDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            movementId={selectedMovementId}
            onSuccess={() => {
              setEditDialogOpen(false);
              setSelectedMovementId(null);
            }}
          />

          <MovementDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            movementId={selectedMovementId}
          />
        </>
      )}
    </div>
  );
}