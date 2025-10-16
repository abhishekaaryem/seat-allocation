import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { FileText, ClipboardCheck, Download } from 'lucide-react';

export default function ReportsPage() {
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
            <Button>
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
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Attendance Sheets
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
