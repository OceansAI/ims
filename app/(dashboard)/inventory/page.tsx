'use client';

import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useProducts } from '@/lib/hooks/use-products';
import { Customer, ProductCategory } from '@/types';
import { format } from 'date-fns';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { X } from 'lucide-react';

type InventoryRow = {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  customer: Customer;
  qtyOnHand: number;
  dateReceived: Date | null;
  storageRate: number;
};

export default function InventoryPage() {
  const { items } = useInventory();
  const { products } = useProducts();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);

  const columns = useMemo<ColumnDef<InventoryRow>[]>(
    () => [
      {
        accessorKey: 'productName',
        header: 'Product',
      },
      {
        accessorKey: 'category',
        header: 'Category',
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
      },
      {
        accessorKey: 'qtyOnHand',
        header: 'Qty on Hand',
      },
      {
        accessorKey: 'dateReceived',
        header: 'Last Received',
        cell: ({ row }) => {
          const date = row.getValue('dateReceived') as Date | null;
          return date ? format(date, 'MMM d, yyyy') : '-';
        },
      },
      {
        accessorKey: 'storageRate',
        header: 'Storage Rate',
        cell: ({ row }) => {
          const rate = row.getValue('storageRate') as number;
          return `$${rate.toFixed(2)}`;
        },
      },
    ],
    []
  );

  // Transform data for the table
  const data = useMemo(() => 
    items
      .filter(item => item.qtyOnHand > 0)
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          id: item.id,
          productId: item.productId,
          productName: product?.name || 'Unknown Product',
          category: product?.category || ProductCategory.SpareParts,
          customer: product?.customerId as Customer || Customer.GreenTech,
          qtyOnHand: item.qtyOnHand,
          dateReceived: item.dateReceived ? new Date(item.dateReceived) : null,
          storageRate: item.storageRate,
        };
      }),
    [items, products]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
  });

  const clearFilters = () => {
    setColumnFilters([]);
    setDateRange(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Current Stock</h1>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Select
  value={(table.getColumn('category')?.getFilterValue() as string) || 'all-categories'}
  onValueChange={(value) =>
    table.getColumn('category')?.setFilterValue(value === 'all-categories' ? undefined : value)
  }
>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="All categories" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all-categories">All Categories</SelectItem>
    {Object.values(ProductCategory).map((category) => (
      <SelectItem key={category} value={category}>
        {category}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

<Select
  value={(table.getColumn('customer')?.getFilterValue() as string) || 'all-customers'}
  onValueChange={(value) =>
    table.getColumn('customer')?.setFilterValue(value === 'all-customers' ? undefined : value)
  }
>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="All customers" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all-customers">All Customers</SelectItem>
    {Object.values(Customer).map((customer) => (
      <SelectItem key={customer} value={customer}>
        {customer}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="w-full sm:w-auto"
        />

        {(columnFilters.length > 0 || dateRange) && (
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
  <TableRow>
    {table.getAllColumns().map((column) => (
      <TableHead key={column.id}>
        {flexRender(column.columnDef.header, column)}
      </TableHead>
    ))}
  </TableRow>
</TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}