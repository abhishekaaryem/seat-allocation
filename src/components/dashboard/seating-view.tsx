'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import type { Hall, SeatingArrangement } from '@/lib/types';
import SeatCard from './seat-card';

const BRANCH_COLORS = {
  CSE: 'hsl(210, 40%, 90%)',
  ECE: 'hsl(140, 40%, 90%)',
  ME: 'hsl(30, 40%, 90%)',
  CE: 'hsl(60, 40%, 90%)',
  EEE: 'hsl(340, 40%, 90%)',
};

type SeatingViewProps = {
  halls: Hall[];
  seatingArrangement: SeatingArrangement | null;
  isLoading: boolean;
};

export default function SeatingView({ halls, seatingArrangement, isLoading }: SeatingViewProps) {

  const conflicts = useMemo(() => {
    const conflictSet = new Set<string>();
    if (!seatingArrangement) return conflictSet;

    const seatMap = new Map<string, string>(); // 'hallId-row-col' -> branch
    seatingArrangement.forEach(seat => {
      seatMap.set(`${seat.hallId}-${seat.row}-${seat.col}`, seat.student.branch);
    });

    for (const seat of seatingArrangement) {
      const key = `${seat.hallId}-${seat.row}-${seat.col}`;
      const neighbors = [
        `${seat.hallId}-${seat.row}-${seat.col - 1}`, // left
        `${seat.hallId}-${seat.row}-${seat.col + 1}`, // right
      ];

      for (const neighborKey of neighbors) {
        if (seatMap.has(neighborKey) && seatMap.get(neighborKey) === seat.student.branch) {
          conflictSet.add(key);
          conflictSet.add(neighborKey);
        }
      }
    }
    return conflictSet;
  }, [seatingArrangement]);

  if (isLoading) {
    return (
        <Card className="min-h-[400px] flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary"/>
            <p className="text-muted-foreground mt-4">Generating seating plan...</p>
        </Card>
    );
  }

  if (!seatingArrangement) {
    return (
        <Card className="min-h-[400px] flex flex-col items-center justify-center text-center">
            <Info className="h-12 w-12 text-muted-foreground"/>
            <h3 className="text-xl font-semibold mt-4">Ready to Arrange</h3>
            <p className="text-muted-foreground mt-1">
                Click "Generate Seating Plan" to automatically allocate seats.
            </p>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seating Arrangements</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={halls[0]?.id || ''}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {halls.map((hall) => (
              <TabsTrigger key={hall.id} value={hall.id}>
                {hall.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {halls.map((hall) => {
            const seatsInHall = Array.from({ length: hall.rows * hall.cols }, (_, i) => {
              const row = Math.floor(i / hall.cols);
              const col = i % hall.cols;
              const assignedSeat = seatingArrangement.find(
                (s) => s.hallId === hall.id && s.row === row && s.col === col
              );
              return {
                key: `${hall.id}-${row}-${col}`,
                student: assignedSeat?.student || null,
                isConflict: conflicts.has(`${hall.id}-${row}-${col}`),
              };
            });

            return (
              <TabsContent key={hall.id} value={hall.id}>
                <div className="overflow-x-auto">
                    <div
                        className="grid gap-2 p-1"
                        style={{
                            gridTemplateColumns: `repeat(${hall.cols}, minmax(60px, 1fr))`,
                            width: `${hall.cols * 68}px`,
                        }}
                    >
                        {seatsInHall.map((seat) => (
                            <SeatCard
                            key={seat.key}
                            student={seat.student}
                            isConflict={seat.isConflict}
                            branchColor={seat.student ? BRANCH_COLORS[seat.student.branch] : ''}
                            />
                        ))}
                    </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
