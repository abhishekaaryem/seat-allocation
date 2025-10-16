'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import StatsCards from '@/components/dashboard/stats-cards';
import SeatingView from '@/components/dashboard/seating-view';
import { Button } from '@/components/ui/button';
import type { Hall, Student, SeatingArrangement } from '@/lib/types';
import { halls as initialHalls, students as initialStudents } from '@/lib/placeholder-data';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function generateSeatingArrangement(students: Student[], halls: Hall[]): SeatingArrangement {
  const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
  const arrangement: SeatingArrangement = [];
  let studentIndex = 0;

  for (const hall of halls) {
    if (studentIndex >= shuffledStudents.length) break;

    const seatsInHall = hall.rows * hall.cols;
    for (let i = 0; i < seatsInHall; i++) {
      if (studentIndex >= shuffledStudents.length) break;

      arrangement.push({
        hallId: hall.id,
        row: Math.floor(i / hall.cols),
        col: i % hall.cols,
        student: shuffledStudents[studentIndex],
      });
      studentIndex++;
    }
  }
  return arrangement;
}

export default function DashboardPage() {
  const [halls] = useState<Hall[]>(initialHalls);
  const [students] = useState<Student[]>(initialStudents);
  const [seatingArrangement, setSeatingArrangement] = useState<SeatingArrangement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePlan = useCallback(() => {
    setIsLoading(true);
    const newArrangement = generateSeatingArrangement(students, halls);
    setSeatingArrangement(newArrangement);
    setIsLoading(false);
  }, [students, halls]);
  
  const totalSeats = halls.reduce((acc, hall) => acc + hall.capacity, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="Overview of the seating allocation."
      >
        <Button onClick={handleGeneratePlan} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Seating Plan'
          )}
        </Button>
      </PageHeader>
      
      {students.length > totalSeats && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Capacity Exceeded</AlertTitle>
          <AlertDescription>
            There are {students.length} students but only {totalSeats} available seats. Some students will not be assigned a seat.
          </AlertDescription>
        </Alert>
      )}

      <StatsCards 
        halls={halls} 
        students={students} 
        seatingArrangement={seatingArrangement}
      />

      <SeatingView 
        halls={halls} 
        seatingArrangement={seatingArrangement} 
        isLoading={isLoading}
      />
    </div>
  );
}
