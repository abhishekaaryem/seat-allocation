'use client';

import { useState, useCallback, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import StatsCards from '@/components/dashboard/stats-cards';
import SeatingView from '@/components/dashboard/seating-view';
import type { Hall, Student, SeatingArrangement, AssignedSeat } from '@/lib/types';
import { halls as initialHalls, students as initialStudents } from '@/lib/placeholder-data';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Consistent seating arrangement generation
function generateSeatingArrangement(students: Student[], halls: Hall[]): SeatingArrangement {
  // Sort students and halls for consistency
  const sortedStudents = [...students].sort((a, b) => a.id.localeCompare(b.id));
  const sortedHalls = [...halls].sort((a, b) => a.id.localeCompare(b.id));
  
  const arrangement: SeatingArrangement = [];
  let studentIndex = 0;

  for (const hall of sortedHalls) {
    if (studentIndex >= sortedStudents.length) break;

    const seatsInHall = hall.rows * hall.cols;
    for (let i = 0; i < seatsInHall; i++) {
      if (studentIndex >= sortedStudents.length) break;

      arrangement.push({
        hallId: hall.id,
        row: Math.floor(i / hall.cols),
        col: i % hall.cols,
        student: sortedStudents[studentIndex],
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const newArrangement = generateSeatingArrangement(students, halls);
    setSeatingArrangement(newArrangement);
    setIsLoading(false);
  }, [students, halls]);
  
  const handleUpdateArrangement = useCallback((newArrangement: SeatingArrangement) => {
    setSeatingArrangement(newArrangement);
  }, []);

  const totalSeats = halls.reduce((acc, hall) => acc + hall.capacity, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="Overview of the seating allocation. Drag and drop to make adjustments."
      />
      
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
        onArrangementUpdate={handleUpdateArrangement}
        isLoading={isLoading}
      />
    </div>
  );
}
