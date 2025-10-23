'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import HallsTable from '@/components/halls-table';
import { PageHeader } from '@/components/page-header';
import { PlusCircle, Upload } from 'lucide-react';
import { HallFormDialog } from '@/components/hall-form-dialog';
import { DataUploadDialog } from '@/components/data-upload-dialog';
import type { Hall } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export default function HallsPage() {
    const firestore = useFirestore();
    const hallsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'halls') : null, [firestore]);
    const { data: halls, isLoading: hallsLoading } = useCollection<Hall>(hallsQuery);

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
      if (!firestore) return;
        if (hallId) {
            // Editing existing hall
            const hallRef = doc(firestore, 'halls', hallId);
            setDocumentNonBlocking(hallRef, hallData, { merge: true });
            toast({ title: "Hall Updated", description: `${hallData.name} has been updated successfully.` });
        } else {
            // Adding new hall
            const hallsCollection = collection(firestore, 'halls');
            addDocumentNonBlocking(hallsCollection, hallData);
            toast({ title: "Hall Added", description: `${hallData.name} has been added successfully.` });
        }
        handleCloseForm();
    };

    const handleDataUploaded = ({ halls: uploadedHalls }: { halls?: Hall[] }) => {
        if (!firestore || !uploadedHalls) return;

        const hallsCollection = collection(firestore, 'halls');
        const promises = uploadedHalls.map(hall => {
            const hallRef = doc(hallsCollection, hall.id);
            return setDocumentNonBlocking(hallRef, hall, { merge: true });
        });
        
        toast({ title: "Success", description: "Hall data is being uploaded." });
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
      <HallsTable halls={halls || []} onEdit={handleOpenForm} isLoading={hallsLoading} />
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
        onDataUploaded={handleDataUploaded}
      />
    </div>
  );
}
