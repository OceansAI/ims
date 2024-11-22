'use client';

import { useState } from 'react';
import { CustomerList } from '@/components/customers/customer-list';
import { AddCustomerDialog } from '@/components/customers/add-customer-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function CustomersPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <CustomerList />
      
      <AddCustomerDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
    </div>
  );
}