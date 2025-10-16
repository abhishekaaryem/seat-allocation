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
  import type { Hall } from "@/lib/types";
  
  type HallFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hall?: Hall | null;
  };
  
  export function HallFormDialog({ open, onOpenChange, hall }: HallFormDialogProps) {
    const isEditing = !!hall;
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Hall" : "Add New Hall"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the details for this hall." : "Fill in the details for the new hall."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" defaultValue={hall?.name || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                Capacity
              </Label>
              <Input id="capacity" type="number" defaultValue={hall?.capacity || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rows" className="text-right">
                Rows
              </Label>
              <Input id="rows" type="number" defaultValue={hall?.rows || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cols" className="text-right">
                Columns
              </Label>
              <Input id="cols" type="number" defaultValue={hall?.cols || ""} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEditing ? "Save Changes" : "Create Hall"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  