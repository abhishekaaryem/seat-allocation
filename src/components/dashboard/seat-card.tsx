import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Student } from "@/lib/types";
import { AlertTriangle, User } from "lucide-react";
import React from "react";

type SeatCardProps = {
  student: Student | null;
  seatNumber: string;
  isConflict: boolean;
  branchColor: string;
  isBeingDragged?: boolean;
  children?: React.ReactNode;
};

export default function SeatCard({ student, seatNumber, isConflict, branchColor, isBeingDragged, children }: SeatCardProps) {
  if (!student) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="aspect-square bg-muted/50 border-dashed flex flex-col items-center justify-center p-1 text-center">
              <User className="w-5 h-5 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground/60 mt-1">{seatNumber}</p>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Empty Seat</p>
            <p>Seat: {seatNumber}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "aspect-square flex flex-col items-center justify-center p-2 text-center transition-all duration-200 cursor-grab active:cursor-grabbing relative",
              isConflict ? "ring-2 ring-destructive ring-offset-2 ring-offset-background" : "ring-1 ring-transparent",
              isBeingDragged && "opacity-30 scale-95"
            )}
            style={{ backgroundColor: isConflict ? "hsl(var(--destructive)/0.1)" : branchColor }}
          >
            {children}
            <CardContent className="p-0 flex flex-col items-center justify-center gap-1 w-full min-h-0">
              <div className="relative w-full px-1 flex-1 flex flex-col justify-center items-center">
                {isConflict && <AlertTriangle className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 text-destructive" />}
                <p className="text-sm font-bold text-foreground break-words leading-tight">{student.name}</p>
              </div>
              <p className="text-[11px] text-foreground/80">{student.branch}</p>
              <p className="text-xs font-medium text-foreground/60">{seatNumber}</p>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{student.name}</p>
          <p>Seat Number: {seatNumber}</p>
          <p>Branch: {student.branch}</p>
          <p>Student ID: {student.id}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
