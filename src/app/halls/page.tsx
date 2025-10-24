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
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function HallsPage() {
    const firestore = useFirestore();
    const hallsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'halls') : null, [firestore]);
    const { data: halls, isLoading: hallsLoading } = useCollection<Hall>(hallsQuery);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [hallToDelete, setHallToDelete] = useState<Hall | null>(null);
    const { toast } = useToast();

    const handleOpenForm = (hall: Hall | null = null) => {
        setSelectedHall(hall);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedHall(null);
    };

    const handleSaveHall = (hallData: Hall) => {
        if (!firestore) return;
        const hallRef = doc(firestore, 'halls', hallData.id);
        const { id, ...data } = hallData;

        if (selectedHall) { // Editing existing hall
            setDocumentNonBlocking(hallRef, data, { merge: true });
            toast({ title: "Hall Updated", description: `${hallData.name} has been updated successfully.` });
        } else { // Adding new hall from form
            setDocumentNonBlocking(hallRef, data, { merge: true });
            toast({ title: "Hall Added", description: `${hallData.name} has been added successfully.` });
        }
        handleCloseForm();
    };
    
    const handleSaveHallWithId = (hallData: Hall) => {
        if (!firestore) return;
        const hallRef = doc(firestore, 'halls', hallData.id);
        const { id, ...data } = hallData;
        setDocumentNonBlocking(hallRef, data, { merge: true });
    };

    const handleDeleteHall = () => {
        if (!firestore || !hallToDelete) return;

        const hallRef = doc(firestore, 'halls', hallToDelete.id);
        deleteDocumentNonBlocking(hallRef);
        
        toast({ title: "Hall Deleted", description: `${hallToDelete.name} has been deleted.` });
        setHallToDelete(null);
    };

    const handleDataUploaded = ({ halls: uploadedHalls }: { halls?: Hall[] }) => {
        if (!firestore || !uploadedHalls) return;

        uploadedHalls.forEach(hall => {
            if (hall.id) {
                handleSaveHallWithId(hall);
            } else {
                console.warn("Skipping hall without ID:", hall);
            }
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
      <HallsTable 
        halls={halls || []} 
        onEdit={handleOpenForm} 
        onDelete={setHallToDelete}
        isLoading={hallsLoading} 
      />
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
       <AlertDialog open={!!hallToDelete} onOpenChange={() => setHallToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hall
              "{hallToDelete?.name}" and remove all associated seating data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setHallToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHall}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
