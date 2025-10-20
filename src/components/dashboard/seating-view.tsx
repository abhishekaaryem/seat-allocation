'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Loader2 } from 'lucide-react';
import type { Hall, SeatingArrangement, AssignedSeat } from '@/lib/types';
import SeatCard from './seat-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from 'lucide-react';

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
  onArrangementUpdate: (arrangement: SeatingArrangement) => void;
  isLoading: boolean;
};

type SeatDragItem = {
  type: 'seat',
  seat: AssignedSeat
} | {
  type: 'empty',
  hallId: string,
  row: number,
  col: number
}


export default function SeatingView({ halls, seatingArrangement, onArrangementUpdate, isLoading }: SeatingViewProps) {
  const [draggedItem, setDraggedItem] = useState<SeatDragItem | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: SeatDragItem) => {
    e.dataTransfer.effectAllowed = 'move';
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(img, 0, 0);
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetHallId: string, targetRow: number, targetCol: number) => {
    e.preventDefault();
    if (!draggedItem || !seatingArrangement) return;

    const newArrangement = [...seatingArrangement];

    // Find what's at the target location
    const targetSeatIndex = newArrangement.findIndex(
      s => s.hallId === targetHallId && s.row === targetRow && s.col === targetCol
    );
    const targetSeat = targetSeatIndex !== -1 ? newArrangement[targetSeatIndex] : null;

    if (draggedItem.type === 'seat') {
      const draggedSeat = draggedItem.seat;
      
      // Prevent dropping on the same seat
      if (draggedSeat.hallId === targetHallId && draggedSeat.row === targetRow && draggedSeat.col === targetCol) {
        setDraggedItem(null);
        return;
      }

      const draggedSeatIndex = newArrangement.findIndex(s => s === draggedSeat);
      if (draggedSeatIndex === -1) return;

      if (targetSeat) { // Target is occupied, so swap
        const draggedOriginalStudent = newArrangement[draggedSeatIndex].student;
        newArrangement[draggedSeatIndex].student = targetSeat.student;
        newArrangement[targetSeatIndex].student = draggedOriginalStudent;
      } else { // Target is empty, so move
        newArrangement[draggedSeatIndex].hallId = targetHallId;
        newArrangement[draggedSeatIndex].row = targetRow;
        newArrangement[draggedSeatIndex].col = targetCol;
      }
    }
    
    onArrangementUpdate(newArrangement);
    setDraggedItem(null);
  }, [draggedItem, seatingArrangement, onArrangementUpdate]);

  const handleUnassign = useCallback((seatToUnassign: AssignedSeat) => {
    if (!seatingArrangement) return;

    const newArrangement = seatingArrangement.filter(
        seat => seat.student.id !== seatToUnassign.student.id
    );
    onArrangementUpdate(newArrangement);
  }, [seatingArrangement, onArrangementUpdate]);


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
            <h3 className="text-xl font-semibold mt-4">No Arrangement Available</h3>
            <p className="text-muted-foreground mt-1">
                The seating arrangement could not be generated.
            </p>
        </Card>
    );
  }

  const getIsBeingDragged = (seat: AssignedSeat | null) => {
    if (!draggedItem || draggedItem.type !== 'seat' || !seat) return false;
    return draggedItem.seat.student.id === seat.student.id;
  };

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
                row: row,
                col: col,
                assignedSeat: assignedSeat || null,
                isConflict: conflicts.has(`${hall.id}-${row}-${col}`),
                isBeingDragged: getIsBeingDragged(assignedSeat),
              };
            });

            return (
              <TabsContent key={hall.id} value={hall.id}>
                <div className="overflow-x-auto">
                    <div
                        className="grid gap-2 p-1"
                        style={{
                            gridTemplateColumns: `repeat(${hall.cols}, minmax(80px, 1fr))`,
                            width: `${hall.cols * 88}px`,
                        }}
                    >
                        {seatsInHall.map((seatInfo) => (
                          <div
                            key={seatInfo.key}
                            draggable={true}
                            onDragStart={(e) => {
                                const dragItem: SeatDragItem = seatInfo.assignedSeat 
                                  ? { type: 'seat', seat: seatInfo.assignedSeat }
                                  : { type: 'empty', hallId: hall.id, row: seatInfo.row, col: seatInfo.col };
                                handleDragStart(e, dragItem);
                            }}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, hall.id, seatInfo.row, seatInfo.col)}
                          >
                            <SeatCard
                              student={seatInfo.assignedSeat?.student || null}
                              isConflict={seatInfo.isConflict}
                              branchColor={seatInfo.assignedSeat?.student ? BRANCH_COLORS[seatInfo.assignedSeat.student.branch] : ''}
                              isBeingDragged={seatInfo.isBeingDragged}
                            >
                               {seatInfo.assignedSeat && (
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="absolute top-1 right-1 p-0.5 rounded-full bg-black/10 text-foreground/60 hover:bg-black/20 hover:text-foreground z-10">
                                            <MoreVertical size={14}/>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleUnassign(seatInfo.assignedSeat!)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Unassign</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                 </DropdownMenu>
                               )}
                            </SeatCard>
                          </div>
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
