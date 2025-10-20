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
import { useToast } from '@/hooks/use-toast';

export default function HallsPage() {
    const [halls, setHalls] = useState<Hall[]>(initialHalls);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const { toast } = useToast();

    const handleOpenForm = (hall: Hall | null = null) => {
        setSelectedHall(hall);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedHall(null);
    };

    const handleSaveHall = (hallData: Omit<Hall, 'id'>, hallId?: string) => {
        if (hallId) {
            // Editing existing hall
            setHalls(halls.map(h => h.id === hallId ? { ...h, ...hallData, id: hallId } : h));
            toast({ title: "Hall Updated", description: `${hallData.name} has been updated successfully.` });
        } else {
            // Adding new hall
            const newHall: Hall = {
                ...hallData,
                id: `hall-${Date.now()}` // Simple unique ID generation
            };
            setHalls([...halls, newHall]);
            toast({ title: "Hall Added", description: `${newHall.name} has been added successfully.` });
        }
        handleCloseForm();
    };

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
            <Button onClick={() => handleOpenForm()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Hall
            </Button>
        </div>
      </PageHeader>
      <HallsTable halls={halls} onEdit={handleOpenForm} />
      <HallFormDialog 
        open={isFormOpen} 
        onOpenChange={handleCloseForm} 
        hall={selectedHall}
        onSave={handleSaveHall}
      />
      <DataUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        uploadType="halls"
        onDataUploaded={({ halls: uploadedHalls }) => {
          if (uploadedHalls) {
            setHalls(uploadedHalls);
            toast({ title: "Success", description: "Hall data has been uploaded." });
          }
        }}
      />
    </div>
  );
}
