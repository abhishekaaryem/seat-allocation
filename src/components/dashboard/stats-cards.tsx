'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, GitBranch, AlertTriangle } from 'lucide-react';
import type { Hall, Student, SeatingArrangement } from '@/lib/types';

type StatsCardsProps = {
  students: Student[];
  halls: Hall[];
  seatingArrangement: SeatingArrangement | null;
};

export default function StatsCards({ students, halls, seatingArrangement }: StatsCardsProps) {
  const stats = useMemo(() => {
    const branches = new Set(students.map(s => s.branch));
    
    const conflicts = new Set<string>();
    if (seatingArrangement) {
        const seatMap = new Map<string, string>(); // 'hallId-row-col' -> branch
        seatingArrangement.forEach(seat => {
        seatMap.set(`${seat.hallId}-${seat.row}-${seat.col}`, seat.student.branch);
        });

        for (const seat of seatingArrangement) {
            const neighbors = [
                `${seat.hallId}-${seat.row}-${seat.col - 1}`, // left
                `${seat.hallId}-${seat.row}-${seat.col + 1}`, // right
            ];
            for (const neighborKey of neighbors) {
                if (seatMap.has(neighborKey) && seatMap.get(neighborKey) === seat.student.branch) {
                    conflicts.add(`${seat.hallId}-${seat.row}-${seat.col}`);
                    conflicts.add(neighborKey);
                }
            }
        }
    }

    return {
      totalStudents: students.length,
      totalHalls: halls.length,
      totalBranches: branches.size,
      totalConflicts: seatingArrangement ? conflicts.size : 0,
    };
  }, [students, halls, seatingArrangement]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Exam Halls</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalHalls}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Branches</CardTitle>
          <GitBranch className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBranches}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Seating Conflicts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stats.totalConflicts}</div>
        </CardContent>
      </Card>
    </div>
  );
}
