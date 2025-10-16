import type { Hall, Student } from './types';

export const halls: Hall[] = [
  { id: 'hall-1', name: 'Main Auditorium', capacity: 24, rows: 4, cols: 6 },
  { id: 'hall-2', name: 'West Wing Hall', capacity: 16, rows: 4, cols: 4 },
  { id: 'hall-3', name: 'East Wing Hall', capacity: 16, rows: 4, cols: 4 },
];

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Saanvi', 'Aanya', 'Aadhya', 'Aaradhya', 'Ananya', 'Pari', 'Diya', 'Myra', 'Anika', 'Avani'];
const lastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Yadav', 'Reddy', 'Mehta', 'Jain'];
const branches: Array<Student['branch']> = ['CSE', 'ECE', 'ME', 'CE', 'EEE'];

function createStudent(id: number): Student {
    return {
        id: `STU${1000 + id}`,
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        branch: branches[id % branches.length],
    };
}

export const students: Student[] = Array.from({ length: 50 }, (_, i) => createStudent(i + 1));
