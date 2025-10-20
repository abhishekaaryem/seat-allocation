'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { FileText, ClipboardCheck, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { RowInput } from 'jspdf-autotable';
import { halls, students } from '@/lib/placeholder-data';
import type { Hall, SeatingArrangement, Student } from '@/lib/types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

function generateSeatingArrangement(students: Student[], halls: Hall[]): SeatingArrangement {
  const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
  const arrangement: SeatingArrangement = [];
  let studentIndex = 0;

  for (const hall of halls) {
    if (studentIndex >= shuffledStudents.length) break;

    const seatsInHall = hall.rows * hall.cols;
    for (let i = 0; i < seatsInHall; i++) {
      if (studentIndex >= shuffledStudents.length) break;

      arrangement.push({
        hallId: hall.id,
        row: Math.floor(i / hall.cols),
        col: i % hall.cols,
        student: shuffledStudents[studentIndex],
      });
      studentIndex++;
    }
  }
  return arrangement;
}

export default function ReportsPage() {
  const handleDownloadSeatingChart = () => {
    const doc = new jsPDF();
    const seatingArrangement = generateSeatingArrangement(students, halls);

    doc.text("Seating Chart Report", 14, 16);
    let startY = 22;

    halls.forEach((hall, index) => {
      if (index > 0) {
        doc.addPage();
        startY = 22; // Reset Y for new page
      }
      doc.setFontSize(12);
      doc.text(hall.name, 14, startY);

      const hallArrangement = seatingArrangement.filter(seat => seat.hallId === hall.id);
      
      const body: RowInput[] = [];
      for (let r = 0; r < hall.rows; r++) {
        const row: string[] = [];
        for (let c = 0; c < hall.cols; c++) {
          const seat = hallArrangement.find(s => s.row === r && s.col === c);
          row.push(seat ? `${seat.student.id}\n(${seat.student.branch})` : 'Empty');
        }
        body.push(row);
      }

      doc.autoTable({
        startY: startY + 4,
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

      // @ts-ignore
      startY = doc.autoTable.previous.finalY + 10;
    });

    doc.save('seating-chart.pdf');
  };

  const handleDownloadAttendanceSheets = () => {
    const doc = new jsPDF();
    const seatingArrangement = generateSeatingArrangement(students, halls);
    
    doc.text("Attendance Sheets", 14, 16);
    
    halls.forEach((hall, index) => {
        if (index > 0) {
            doc.addPage();
        }
        doc.text(`Attendance Sheet - ${hall.name}`, 14, 16);

        const hallStudents = seatingArrangement
            .filter(seat => seat.hallId === hall.id)
            .sort((a, b) => a.student.id.localeCompare(b.student.id))
            .map(seat => seat.student);

        doc.autoTable({
            startY: 20,
            head: [['Student ID', 'Name', 'Branch', 'Signature']],
            body: hallStudents.map(student => [student.id, student.name, student.branch, '']),
            theme: 'striped',
            styles: {
                fontSize: 10,
            },
            headStyles: {
                fillColor: [41, 128, 185]
            },
            columnStyles: {
                3: {
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
            <Button onClick={handleDownloadSeatingChart}>
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
            <Button onClick={handleDownloadAttendanceSheets}>
              <Download className="mr-2 h-4 w-4" />
              Download Attendance Sheets
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
