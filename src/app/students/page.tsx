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
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';


export default function StudentsPage() {
  const firestore = useFirestore();
  const studentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'students') : null, [firestore]);
  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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
    
    if (studentData.id && selectedStudent) { // Editing
        const studentRef = doc(firestore, 'students', selectedStudent.id);
        const { id, ...dataToUpdate } = studentData;
        setDocumentNonBlocking(studentRef, dataToUpdate, { merge: true });
        toast({ title: "Student Updated", description: `${studentData.name} has been updated successfully.` });
    } else if (studentData.id) { // Adding with specific ID
        const studentRef = doc(firestore, 'students', studentData.id);
        const { id, ...dataToAdd } = studentData;
        setDocumentNonBlocking(studentRef, dataToAdd, {});
        toast({ title: "Student Added", description: `${studentData.name} has been added successfully.` });
    }
    handleCloseForm();
  };

  const handleDataUploaded = ({ students: uploadedStudents }: { students?: Student[] }) => {
    if (!firestore || !uploadedStudents) return;

    const studentsCollection = collection(firestore, 'students');
    uploadedStudents.forEach(student => {
        const studentRef = doc(studentsCollection, student.id);
        setDocumentNonBlocking(studentRef, student, { merge: true });
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

      <StudentsTable students={students || []} onEdit={handleOpenForm} isLoading={studentsLoading} />
      
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
    </div>
  );
}
