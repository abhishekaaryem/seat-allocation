'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import HallsTable from '@/components/halls-table';
import { PageHeader } from '@/components/page-header';
import { halls as initialHalls } from '@/lib/placeholder-data';
import { PlusCircle } from 'lucide-react';
import { HallFormDialog } from '@/components/hall-form-dialog';
import type { Hall } from '@/lib/types';

export default function HallsPage() {
    const [halls] = useState<Hall[]>(initialHalls);
    const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Hall Management"
        description="Configure exam halls, their capacity, and layout."
      >
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Hall
        </Button>
      </PageHeader>
      <HallsTable halls={halls} />
      <HallFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}
