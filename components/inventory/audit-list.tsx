'use client';

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
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Eye, MoreHorizontal, FileText, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { ViewAuditDialog } from './view-audit-dialog';
import { useInventory } from '@/lib/hooks/use-inventory';
import Link from 'next/link';

export function AuditList() {
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { audits } = useInventory();

  const handleViewAudit = (auditId: string) => {
    setSelectedAuditId(auditId);
    setViewDialogOpen(true);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Products Audited</TableHead>
            <TableHead>Discrepancies</TableHead>
            <TableHead>Performed By</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {audits?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No audits found. Start a new audit to track inventory accuracy.
              </TableCell>
            </TableRow>
          ) : (
            audits?.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell>
                  {format(new Date(audit.date), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={audit.status === 'completed' ? 'success' : 'secondary'}
                  >
                    {audit.status}
                  </Badge>
                </TableCell>
                <TableCell>{audit.itemsCount}</TableCell>
                <TableCell>
                  {audit.discrepanciesCount > 0 ? (
                    <span className="text-red-500 font-medium">
                      {audit.discrepanciesCount}
                    </span>
                  ) : (
                    <span className="text-green-500 font-medium">None</span>
                  )}
                </TableCell>
                <TableCell>{audit.performedBy}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {audit.status === 'in_progress' ? (
                        <DropdownMenuItem asChild>
                          <Link href={`/inventory/audits/${audit.id}`}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Continue Audit
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleViewAudit(audit.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      )}
                      {audit.status === 'completed' && (
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Download Report
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedAuditId && (
        <ViewAuditDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          auditId={selectedAuditId}
        />
      )}
    </div>
  );
}