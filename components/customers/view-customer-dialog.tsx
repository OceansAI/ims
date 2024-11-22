'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Customer } from '@/types';
import { format } from 'date-fns';
import { Building2, User, Mail, Phone, FileText, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ViewCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
}

export function ViewCustomerDialog({
  open,
  onOpenChange,
  customer,
}: ViewCustomerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo and Basic Info */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="aspect-square relative rounded-lg border overflow-hidden">
              {customer.logo_url ? (
                <Image
                  src={customer.logo_url}
                  alt={`${customer.name} logo`}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge 
                variant={customer.active ? 'success' : 'secondary'}
                className="text-sm px-4 py-1"
              >
                {customer.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4" />
                Basic Information
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Name</dt>
                  <dd className="text-sm font-medium">{customer.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Code</dt>
                  <dd className="text-sm font-medium">{customer.code}</dd>
                </div>
              </dl>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <User className="h-4 w-4" />
                Contact Information
              </h3>
              <dl className="space-y-2">
                {customer.contact_name && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Contact Name</dt>
                    <dd className="text-sm font-medium">{customer.contact_name}</dd>
                  </div>
                )}
                {customer.contact_email && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd className="text-sm font-medium">
                      <a 
                        href={`mailto:${customer.contact_email}`}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        {customer.contact_email}
                      </a>
                    </dd>
                  </div>
                )}
                {customer.contact_phone && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Phone</dt>
                    <dd className="text-sm font-medium">
                      <a 
                        href={`tel:${customer.contact_phone}`}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {customer.contact_phone}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Documents Section */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4" />
            Documents
          </h3>
          
          <ScrollArea className="h-[200px] rounded-md border p-4">
            {customer.documents && customer.documents.length > 0 ? (
              <div className="space-y-4">
                {customer.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {format(new Date(doc.uploaded_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No documents uploaded
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Timestamps */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created: {format(new Date(customer.created_at), 'PPpp')}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Last Updated: {format(new Date(customer.updated_at), 'PPpp')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}