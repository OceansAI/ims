'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, MoreHorizontal, Pencil, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { useProducts } from '@/lib/hooks/use-products';
import { Product, ProductCategory, Customer } from '@/types';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table';
import { ViewProductDialog } from './view-product-dialog';
import { EditProductDialog } from './edit-product-dialog';
import { DeleteProductDialog } from './delete-product-dialog';
import { ProductImagesDialog } from './product-images-dialog';

export function ProductList() {
  const { products, loading } = useProducts();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imagesDialogOpen, setImagesDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const hasImages = row.original.images && row.original.images.length > 0;
        return (
          <div className="flex items-center gap-2">
            <span>{row.getValue('name')}</span>
            {hasImages && (
              <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                <ImageIcon className="h-3 w-3" />
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <span>{row.original.category}</span>,
    },
    {
      accessorKey: 'customer_id',
      header: 'Customer',
      cell: ({ row }) => <span>{row.original.customer_id}</span>,
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleImages(row.original)}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Manage Images
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(row.original)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
  });

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleImages = (product: Product) => {
    setSelectedProduct(product);
    setImagesDialogOpen(true);
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Filter products..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

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
  value={(table.getColumn('customer_id')?.getFilterValue() as string) || 'all-customers'}
  onValueChange={(value) =>
    table.getColumn('customer_id')?.setFilterValue(value === 'all-customers' ? undefined : value)
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


        {(columnFilters.length > 0) && (
          <Button 
            variant="ghost" 
            onClick={() => setColumnFilters([])}
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
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
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {selectedProduct && (
        <>
          <ViewProductDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            product={selectedProduct}
          />

          <EditProductDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            product={selectedProduct}
          />

          <DeleteProductDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            product={selectedProduct}
          />

          <ProductImagesDialog
            open={imagesDialogOpen}
            onOpenChange={setImagesDialogOpen}
            product={selectedProduct}
          />
        </>
      )}
    </div>
  );
}