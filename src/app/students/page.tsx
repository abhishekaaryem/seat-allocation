'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { students as initialStudents } from '@/lib/placeholder-data';
import { PlusCircle, Upload } from 'lucide-react';
import StudentsTable from '@/components/students-table';
import { DataUploadDialog } from '@/components/data-upload-dialog';
import type { Student } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { StudentFormDialog } from '@/components/student-form-dialog';


export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
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
    if (studentData.id) {
        // Editing existing student
        setStudents(students.map(s => s.id === studentData.id ? { ...s, ...studentData } as Student : s));
        toast({ title: "Student Updated", description: `${studentData.name} has been updated successfully.` });
    } else {
        // Adding new student
        const newStudent: Student = {
            ...studentData,
            id: `STU${Date.now()}` // Simple unique ID generation
        };
        setStudents([...students, newStudent]);
        toast({ title: "Student Added", description: `${newStudent.name} has been added successfully.` });
    }
    handleCloseForm();
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

      <StudentsTable students={students} onEdit={handleOpenForm} />
      
      <DataUploadDialog 
        open={isUploadOpen} 
        onOpenChange={setIsUploadOpen} 
        uploadType="students"
        onDataUploaded={({students: uploadedStudents}) => {
            if (uploadedStudents) {
              setStudents(uploadedStudents);
              toast({ title: "Success", description: "Student data has been uploaded." });
            }
        }}
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
