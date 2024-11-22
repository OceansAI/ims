'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Customer } from '@/types';
import { useCustomers } from '@/lib/hooks/use-customers';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface DeleteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
}

export function DeleteCustomerDialog({
  open,
  onOpenChange,
  customer,
}: DeleteCustomerDialogProps) {
  const { removeCustomer } = useCustomers();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete logo if exists
      if (customer.logo_url) {
        const logoPath = customer.logo_url.split('/').pop();
        if (logoPath) {
          await supabase.storage
            .from('customer-documents')
            .remove([`logos/${logoPath}`]);
        }
      }

      // Delete documents if any
      if (customer.documents?.length > 0) {
        const documentPaths = customer.documents.map(doc => doc.url.split('/').pop());
        await supabase.storage
          .from('customer-documents')
          .remove(documentPaths.filter(Boolean) as string[]);
      }

      // Delete customer record
      await removeCustomer(customer.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Customer</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {customer.name}? This action cannot be undone
            and will remove all associated data including documents and images.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}