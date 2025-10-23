'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { FileText, ClipboardCheck, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { RowInput } from 'jspdf-autotable';
import type { Hall, SeatingArrangement, Student } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { generateSeatingArrangement } from '@/lib/seating-algorithm';


declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function ReportsPage() {
  const firestore = useFirestore();
  const hallsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'halls') : null, [firestore]);
  const studentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'students') : null, [firestore]);

  const { data: halls } = useCollection<Hall>(hallsQuery);
  const { data: students } = useCollection<Student>(studentsQuery);

  const handleDownloadSeatingChart = () => {
    if (!students || !halls) return;
    const doc = new jsPDF();
    const seatingArrangement = generateSeatingArrangement(students, halls);

    halls.forEach((hall, index) => {
      if (index > 0) {
        doc.addPage();
      }
      doc.setFontSize(16);
      doc.text("Seating Chart Report", 14, 16);
      
      let startY = 22;

      doc.setFontSize(14);
      doc.text(hall.name, 14, startY + 6);
      startY += 12;

      const hallArrangement = seatingArrangement.filter(seat => seat.hallId === hall.id);
      
      const body: RowInput[] = [];
      let seatCounter = 0;
      for (let r = 0; r < hall.rows; r++) {
        const row: string[] = [];
        for (let c = 0; c < hall.cols; c++) {
          seatCounter++;
          const seat = hallArrangement.find(s => s.row === r && s.col === c);
          
          if (seat) {
            row.push(`${seatCounter}\n${seat.student.name}\n(${seat.student.branch})`);
          } else {
            row.push(`${seatCounter}\n(Empty)`);
          }
        }
        body.push(row);
      }

      doc.autoTable({
        startY: startY,
        head: [Array.from({length: hall.cols}, (_, i) => `Col ${i+1}`)],
        body: body,
        theme: 'grid',
        styles: {
          halign: 'center',
          valign: 'middle',
          fontSize: 8,
          cellPadding: 2,
        },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.cell.text.length > 0) {
              if (data.cell.text[0].includes('Empty')) {
                data.cell.styles.fillColor = '#f2f2f2';
              }
            }
        },
      });
    });

    doc.save('seating-chart.pdf');
  };

  const handleDownloadAttendanceSheets = () => {
    if (!students || !halls) return;
    const doc = new jsPDF();
    const seatingArrangement = generateSeatingArrangement(students, halls);
    
    doc.text("Attendance Sheets", 14, 16);
    
    halls.forEach((hall, index) => {
        if (index > 0) {
            doc.addPage();
        }
        doc.text(`Attendance Sheet - ${hall.name}`, 14, 16);

        const hallSeats = seatingArrangement
            .filter(seat => seat.hallId === hall.id)
            .sort((a, b) => a.student.id.localeCompare(b.student.id));

        doc.autoTable({
            startY: 20,
            head: [['Seat No.', 'Student ID', 'Name', 'Branch', 'Signature']],
            body: hallSeats.map(seat => {
              const seatNumber = seat.row * hall.cols + seat.col + 1;
              return [seatNumber, seat.student.id, seat.student.name, seat.student.branch, ''];
            }),
            theme: 'striped',
            styles: {
                fontSize: 10,
            },
            headStyles: {
                fillColor: [41, 128, 185]
            },
            columnStyles: {
                4: {
                    cellWidth: 40
                }
            }
        });
    });

    doc.save('attendance-sheets.pdf');
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Report Generation"
        description="Generate and download PDF reports for seating and attendance."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Seating Chart Report
            </CardTitle>
            <CardDescription>
              Generate a detailed PDF of the complete seating arrangement for all halls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDownloadSeatingChart} disabled={!students || !halls}>
              <Download className="mr-2 h-4 w-4" />
              Download Seating Chart
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Attendance Sheet
            </CardTitle>
            <CardDescription>
              Generate printable attendance sheets for each hall, including student details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDownloadAttendanceSheets} disabled={!students || !halls}>
              <Download className="mr-2 h-4 w-4" />
              Download Attendance Sheets
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
