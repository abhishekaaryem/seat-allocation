'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import HallsTable from '@/components/halls-table';
import { PageHeader } from '@/components/page-header';
import { halls as initialHalls } from '@/lib/placeholder-data';
import { PlusCircle, Upload } from 'lucide-react';
import { HallFormDialog } from '@/components/hall-form-dialog';
import { DataUploadDialog } from '@/components/data-upload-dialog';
import type { Hall } from '@/lib/types';

export default function HallsPage() {
    const [halls, setHalls] = useState<Hall[]>(initialHalls);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Hall Management"
        description="Configure exam halls, their capacity, and layout."
      >
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Halls
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Hall
            </Button>
        </div>
      </PageHeader>
      <HallsTable halls={halls} />
      <HallFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
      <DataUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        uploadType="halls"
        onDataUploaded={({ students, halls }) => {
          if (halls) setHalls(halls);
        }}
      />
    </div>
  );
}
