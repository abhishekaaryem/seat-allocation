export type Student = {
    id: string;
    name: string;
    branch: 'CSE' | 'ECE' | 'ME' | 'CE' | 'EEE';
};
  
export type Hall = {
    id: string;
    name: string;
    capacity: number;
    rows: number;
    cols: number;
};
  
// Represents a student assigned to a specific seat in a hall
export type AssignedSeat = {
    hallId: string;
    row: number;
    col: number;
    student: Student;
};
  
export type SeatingArrangement = AssignedSeat[];
