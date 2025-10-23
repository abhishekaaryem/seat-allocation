'use client';

import { useState, useCallback, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import StatsCards from '@/components/dashboard/stats-cards';
import SeatingView from '@/components/dashboard/seating-view';
import type { Hall, Student, SeatingArrangement } from '@/lib/types';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { generateSeatingArrangement } from '@/lib/seating-algorithm';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const firestore = useFirestore();
  const hallsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'halls') : null, [firestore]);
  const studentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'students') : null, [firestore]);

  const { data: halls, isLoading: hallsLoading } = useCollection<Hall>(hallsQuery);
  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);
  
  const [seatingArrangement, setSeatingArrangement] = useState<SeatingArrangement | null>(null);
  
  const isLoading = hallsLoading || studentsLoading;

  const handleGenerateArrangement = useCallback(() => {
    if (halls && students) {
      const newArrangement = generateSeatingArrangement(students, halls);
      setSeatingArrangement(newArrangement);
    }
  }, [students, halls]);

  useEffect(() => {
    handleGenerateArrangement();
  }, [handleGenerateArrangement]);
  
  const handleUpdateArrangement = useCallback((newArrangement: SeatingArrangement) => {
    setSeatingArrangement(newArrangement);
  }, []);

  const totalSeats = halls?.reduce((acc, hall) => acc + hall.capacity, 0) || 0;
  const totalStudents = students?.length || 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="Overview of the seating allocation. Drag and drop to make adjustments."
      >
        <Button onClick={handleGenerateArrangement} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate Plan
        </Button>
      </PageHeader>
      
      {totalStudents > totalSeats && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Capacity Exceeded</AlertTitle>
          <AlertDescription>
            There are {totalStudents} students but only {totalSeats} available seats. Some students will not be assigned a seat.
          </AlertDescription>
        </Alert>
      )}

      <StatsCards 
        halls={halls || []} 
        students={students || []} 
        seatingArrangement={seatingArrangement}
      />

      <SeatingView 
        halls={halls || []} 
        seatingArrangement={seatingArrangement}
        onArrangementUpdate={handleUpdateArrangement}
        isLoading={isLoading}
      />
    </div>
  );
}
