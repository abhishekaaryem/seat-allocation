import { useEffect } from 'react';
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
import { useForm, useFormState } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Hall } from "@/lib/types";
  
type HallFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hall?: Hall | null;
    onSave: (data: Hall) => void;
};

const hallSchema = z.object({
    id: z.string().min(1, { message: "ID is required." }),
    name: z.string().min(1, { message: "Name is required." }),
    capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1." }),
    rows: z.coerce.number().min(1, { message: "Rows must be at least 1." }),
    cols: z.coerce.number().min(1, { message: "Columns must be at least 1." }),
});

type HallFormData = z.infer<typeof hallSchema>;
  
export function HallFormDialog({ open, onOpenChange, hall, onSave }: HallFormDialogProps) {
    const isEditing = !!hall;

    const form = useForm<HallFormData>({
        resolver: zodResolver(hallSchema),
        defaultValues: {
            id: '',
            name: '',
            capacity: 0,
            rows: 0,
            cols: 0
        }
    });

    useEffect(() => {
        if (open && hall) {
            form.reset(hall);
        } else if (open && !hall) {
            form.reset({ id: '', name: '', capacity: 0, rows: 0, cols: 0 });
        }
    }, [open, hall, form]);

    const { isSubmitting } = useFormState({ control: form.control });

    const onSubmit = (data: HallFormData) => {
        onSave(data);
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Hall" : "Add New Hall"}</DialogTitle>
                <DialogDescription>
                {isEditing ? "Update the details for this hall." : "Fill in the details for the new hall."}
                </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Hall ID</FormLabel>
                  <FormControl>
                    <Input {...field} className="col-span-3" disabled={isEditing} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="col-span-3" />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="col-span-3" />
                  </FormControl>
                   <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rows"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Rows</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="col-span-3" />
                  </FormControl>
                   <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cols"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Columns</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="col-span-3" />
                  </FormControl>
                   <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            
            <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                    {isEditing ? "Save Changes" : "Create Hall"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
        </DialogContent>
      </Dialog>
    );
}
