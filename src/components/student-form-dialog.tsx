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
import type { Student } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
  
type StudentFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student?: Student | null;
    onSave: (data: Omit<Student, 'id'> & { id?: string }) => void;
};

const studentSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: "Name is required." }),
    branch: z.enum(['CSE', 'ECE', 'ME', 'CE', 'EEE'], {
        required_error: "Branch is required."
    }),
});

type StudentFormData = z.infer<typeof studentSchema>;
  
export function StudentFormDialog({ open, onOpenChange, student, onSave }: StudentFormDialogProps) {
    const isEditing = !!student;

    const form = useForm<StudentFormData>({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            id: '',
            name: '',
            branch: undefined,
        }
    });

    useEffect(() => {
        if (open && student) {
            form.reset(student);
        } else if (open && !student) {
            form.reset({ id: '', name: '', branch: undefined });
        }
    }, [open, student, form]);

    const { isSubmitting } = useFormState({ control: form.control });

    const onSubmit = (data: StudentFormData) => {
        onSave(data);
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Student" : "Add New Student"}</DialogTitle>
                <DialogDescription>
                {isEditing ? "Update the details for this student." : "Fill in the details for the new student."}
                </DialogDescription>
            </DialogHeader>
            
            {!isEditing && (
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Student ID</FormLabel>
                    <FormControl>
                      <Input {...field} className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-4 text-right" />
                  </FormItem>
                )}
              />
            )}

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
              name="branch"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Branch</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="ECE">ECE</SelectItem>
                      <SelectItem value="ME">ME</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="EEE">EEE</SelectItem>
                    </SelectContent>
                  </Select>
                   <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            
            <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                    {isEditing ? "Save Changes" : "Create Student"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
        </DialogContent>
      </Dialog>
    );
}
