'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { students as initialStudents } from '@/lib/placeholder-data';
import { Upload } from 'lucide-react';
import StudentsTable from '@/components/students-table';
import { DataUploadDialog } from '@/components/data-upload-dialog';
import type { Student } from '@/lib/types';


export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Student Management"
        description="View and manage the list of students for the exam."
      >
        <Button onClick={() => setIsUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Students
        </Button>
      </PageHeader>

      <StudentsTable students={students} />
      
      <DataUploadDialog 
        open={isUploadOpen} 
        onOpenChange={setIsUploadOpen} 
        uploadType="students"
        onDataUploaded={({students, halls}) => {
            if (students) setStudents(students);
        }}
      />
    </div>
  );
}
