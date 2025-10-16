import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";

type DataUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DataUploadDialog({ open, onOpenChange }: DataUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Data</DialogTitle>
          <DialogDescription>
            Upload Excel files for student data and hall capacity. The system will process them automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="student-data">Student Data (.xlsx)</Label>
            <Input id="student-data" type="file" accept=".xlsx, .xls, .csv" />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="hall-data">Hall Capacity (.xlsx)</Label>
            <Input id="hall-data" type="file" accept=".xlsx, .xls, .csv" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload and Process
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
