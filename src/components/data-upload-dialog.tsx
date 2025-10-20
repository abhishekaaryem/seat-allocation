'use client';
import { useState } from "react";
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
import { Loader2, UploadCloud, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import type { Hall, Student } from "@/lib/types";

type UploadType = 'students' | 'halls' | 'all';

type DataUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataUploaded: (data: { students?: Student[], halls?: Hall[] }) => void;
  uploadType?: UploadType;
};

export function DataUploadDialog({ open, onOpenChange, onDataUploaded, uploadType = 'all' }: DataUploadDialogProps) {
  const { toast } = useToast();
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [hallFile, setHallFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showStudents = uploadType === 'students' || uploadType === 'all';
  const showHalls = uploadType === 'halls' || uploadType === 'all';


  const handleProcessFiles = async () => {
    if (!studentFile && !hallFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select at least one file to upload.",
      });
      return;
    }

    setIsProcessing(true);
    const dataToUpload: { students?: Student[], halls?: Hall[] } = {};

    try {
      if (studentFile && showStudents) {
        const students = await parseFile<Student>(studentFile, ['id', 'name', 'branch']);
        dataToUpload.students = students;
      }
      if (hallFile && showHalls) {
        const halls = await parseFile<Hall>(hallFile, ['id', 'name', 'capacity', 'rows', 'cols']);
        // Ensure numeric types are correct
        dataToUpload.halls = halls.map(h => ({
            ...h,
            capacity: Number(h.capacity),
            rows: Number(h.rows),
            cols: Number(h.cols)
        }));
      }
      
      onDataUploaded(dataToUpload);
      toast({
        title: "Success",
        description: "Data has been uploaded and processed successfully.",
      });
      onOpenChange(false);
      // Reset file inputs
      setStudentFile(null);
      setHallFile(null);

    } catch (error) {
      console.error("File processing error:", error);
      toast({
        variant: "destructive",
        title: "Error processing file",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseFile = <T,>(file: File, expectedHeaders: (keyof T)[]): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

          if (jsonData.length === 0) {
            resolve([]);
            return;
          }

          // Validate headers
          const headers = Object.keys(jsonData[0]);
          const missingHeaders = expectedHeaders.filter(h => !headers.includes(h as string));
          if (missingHeaders.length > 0) {
              throw new Error(`Missing expected columns in ${file.name}: ${missingHeaders.join(', ')}`);
          }

          resolve(jsonData as T[]);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  const downloadTemplate = (type: 'students' | 'halls') => {
    const wb = XLSX.utils.book_new();
    let data, filename;

    if (type === 'students') {
        data = [
            { id: 'STU1001', name: 'John Doe', branch: 'CSE' }
        ];
        filename = 'student-template.xlsx';
    } else {
        data = [
            { id: 'hall-1', name: 'Main Hall', capacity: 100, rows: 10, cols: 10 }
        ];
        filename = 'hall-template.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filename);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Data</DialogTitle>
          <DialogDescription>
            Upload Excel (.xlsx, .csv) files. Ensure columns match the template format.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {showStudents && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="student-data">Student Data (id, name, branch)</Label>
                <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => downloadTemplate('students')}>
                  <Download className="mr-1 h-3 w-3" />
                  Template
                </Button>
              </div>
              <Input 
                id="student-data" 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={(e) => setStudentFile(e.target.files?.[0] || null)}
              />
            </div>
          )}
          {showHalls && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="hall-data">Hall Data (id, name, capacity, rows, cols)</Label>
                <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => downloadTemplate('halls')}>
                    <Download className="mr-1 h-3 w-3" />
                    Template
                </Button>
              </div>
              <Input 
                id="hall-data" 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={(e) => setHallFile(e.target.files?.[0] || null)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleProcessFiles} disabled={isProcessing}>
            {isProcessing ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload and Process
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
