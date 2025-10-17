# SeatingSage - Exam Seating Arrangement Application

SeatingSage is a web application designed to streamline and automate the process of creating seating arrangements for examinations. It provides a user-friendly interface for managing exam halls, and students, generating seating plans, and producing downloadable reports.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **AI/Generative**: [Genkit](https://firebase.google.com/docs/genkit) (for potential future AI features)

## Project Overview

The primary goal of SeatingSage is to simplify the complex task of allocating seats to students for exams. It addresses several key challenges:

- **Manual Effort**: Reduces the time and effort spent on manually creating seating charts.
- **Error Prevention**: Minimizes human errors, such as placing students from the same branch next to each other.
- **Flexibility**: Allows for real-time adjustments to the seating plan via a drag-and-drop interface.
- **Reporting**: Generates essential documents like attendance sheets and visual seating charts.

## How It Works: The Application Flow

The application is divided into several key pages, each handling a specific part of the workflow.

### 1. Dashboard (Home Page)

- **Overview**: This is the main landing page. It provides a high-level statistical overview, including the total number of students, halls, branches, and any seating conflicts.
- **Seating Plan Generation**: The "Generate Seating Plan" button is the core feature. When clicked, it triggers a function that takes the list of all students and available halls and assigns each student to a seat. The algorithm prioritizes filling up halls one by one.
- **Conflict Detection**: The system automatically checks for conflicts. A "conflict" is defined as two students from the same academic branch being seated next to each other (horizontally). Conflicting seats are highlighted in red for easy identification.
- **Interactive Seating View**: After generation, the seating arrangement is displayed in a tabbed view, with each tab representing an exam hall.
- **Real-time Adjustments**: Users can drag and drop students from one seat to another (including empty seats) to manually resolve conflicts or make other adjustments. The conflict highlighting updates instantly.

### 2. Halls Page

- **Management**: This page allows administrators to manage exam halls.
- **View**: Displays a table of all existing halls with their name, capacity, and layout (rows x columns).
- **Add/Edit**: Users can add new halls or edit existing ones through a form dialog, specifying their dimensions and capacity.

### 3. Students Page

- **Management**: This page is for managing student data.
- **View**: It displays a paginated table of all registered students, showing their ID, name, and branch.
- **Upload**: A "Upload Data" button opens a dialog where users can upload student and hall data (e.g., from an Excel or CSV file), though the processing logic for this is a placeholder.

### 4. Reports Page

- **Generation**: This page provides tools to generate and download important documents.
- **Seating Chart Report**: Users can download a PDF that visually represents the seating arrangement for each hall. The chart shows which student is in which seat.
- **Attendance Sheet Report**: Users can download a PDF attendance sheet for each hall. The sheet lists all students assigned to that hall with columns for their ID, name, branch, and a space for their signature.

This comprehensive workflow ensures that managing exam seating is an efficient, intuitive, and error-free process.