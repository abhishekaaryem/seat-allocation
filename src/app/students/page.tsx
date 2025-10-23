'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle, Upload } from 'lucide-react';
import StudentsTable from '@/components/students-table';
import { DataUploadDialog } from '@/components/data-upload-dialog';
import type { Student } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { StudentFormDialog } from '@/components/student-form-dialog';
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

export default function StudentsPage() {
  const firestore = useFirestore();
  const studentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'students') : null, [firestore]);
  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const { toast } = useToast();

  const handleOpenForm = (student: Student | null = null) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
      setIsFormOpen(false);
      setSelectedStudent(null);
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id'> & { id?: string }) => {
    if (!firestore) return;
    
    // Editing an existing student
    if (studentData.id && selectedStudent) { 
        const studentRef = doc(firestore, 'students', selectedStudent.id);
        // Do not update the ID, only other fields
        const { id, ...dataToUpdate } = studentData;
        setDocumentNonBlocking(studentRef, dataToUpdate, { merge: true });
        toast({ title: "Student Updated", description: `${studentData.name} has been updated successfully.` });
    } else if (studentData.id) { // Adding a new student with a specific ID (from form or upload)
        const studentRef = doc(firestore, 'students', studentData.id);
        const { id, ...dataToAdd } = studentData;
        setDocumentNonBlocking(studentRef, dataToAdd, { merge: true }); // Use merge to be safe
        toast({ title: "Student Added", description: `${studentData.name} has been added successfully.` });
    }
    handleCloseForm();
  };

  const handleDeleteStudent = () => {
    if (!firestore || !studentToDelete) return;

    const studentRef = doc(firestore, 'students', studentToDelete.id);
    deleteDocumentNonBlocking(studentRef);
    
    toast({ title: "Student Deleted", description: `${studentToDelete.name} has been deleted.` });
    setStudentToDelete(null);
  };

  const handleDataUploaded = ({ students: uploadedStudents }: { students?: Student[] }) => {
    if (!firestore || !uploadedStudents) return;

    uploadedStudents.forEach(student => {
      if (student.id) {
        handleSaveStudent(student);
      } else {
        console.warn("Skipping student without ID:", student);
      }
    });
    
    toast({ title: "Success", description: "Student data is being uploaded." });
  };


  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Student Management"
        description="View and manage the list of students for the exam."
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Students
          </Button>
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </PageHeader>

      <StudentsTable students={students || []} onEdit={handleOpenForm} onDelete={setStudentToDelete} isLoading={studentsLoading} />
      
      <DataUploadDialog 
        open={isUploadOpen} 
        onOpenChange={setIsUploadOpen} 
        uploadType="students"
        onDataUploaded={handleDataUploaded}
      />
      <StudentFormDialog
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        student={selectedStudent}
        onSave={handleSaveStudent}
      />
      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student
              "{studentToDelete?.name}" and remove their data from all records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStudentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
