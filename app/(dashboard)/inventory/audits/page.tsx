'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AuditList } from '@/components/inventory/audit-list';
import { StartAuditDialog } from '@/components/inventory/start-audit-dialog';

export default function AuditsPage() {
  const [startAuditOpen, setStartAuditOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Audits</h1>
        <Button onClick={() => setStartAuditOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Start New Audit
        </Button>
      </div>

      <AuditList />
      
      <StartAuditDialog 
        open={startAuditOpen} 
        onOpenChange={setStartAuditOpen} 
      />
    </div>
  );
}