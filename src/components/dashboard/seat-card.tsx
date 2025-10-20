import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Student } from "@/lib/types";
import { AlertTriangle, User } from "lucide-react";

type SeatCardProps = {
  student: Student | null;
  isConflict: boolean;
  branchColor: string;
  isBeingDragged?: boolean;
};

export default function SeatCard({ student, isConflict, branchColor, isBeingDragged }: SeatCardProps) {
  if (!student) {
    return (
      <Card className="aspect-square bg-muted/50 border-dashed flex items-center justify-center">
        <User className="w-6 h-6 text-muted-foreground/50" />
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "aspect-square flex flex-col items-center justify-center p-2 text-center transition-all duration-200 cursor-grab active:cursor-grabbing",
              isConflict ? "ring-2 ring-destructive ring-offset-2 ring-offset-background" : "ring-1 ring-transparent",
              isBeingDragged && "opacity-30 scale-95"
            )}
            style={{ backgroundColor: isConflict ? "hsl(var(--destructive)/0.1)" : branchColor }}
          >
            <CardContent className="p-0 flex flex-col items-center justify-center gap-1">
              {isConflict && <AlertTriangle className="w-4 h-4 text-destructive absolute top-1 right-1" />}
              <p className="text-xs font-bold text-foreground truncate">{student.id}</p>
              <p className="text-[10px] font-medium text-foreground/80">{student.branch}</p>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{student.name}</p>
          <p>Branch: {student.branch}</p>
          <p>Student ID: {student.id}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
