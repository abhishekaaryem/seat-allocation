import type { Hall, Student } from './types';

export const halls: Hall[] = [
  { id: 'hall-1', name: 'Main Auditorium', capacity: 24, rows: 4, cols: 6 },
  { id: 'hall-2', name: 'West Wing Hall', capacity: 16, rows: 4, cols: 4 },
  { id: 'hall-3', name: 'East Wing Hall', capacity: 16, rows: 4, cols: 4 },
];

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Saanvi', 'Aanya', 'Aadhya', 'Aaradhya', 'Ananya', 'Pari', 'Diya', 'Myra', 'Anika', 'Avani'];
const lastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Yadav', 'Reddy', 'Mehta', 'Jain'];
const branches: Array<Student['branch']> = ['CSE', 'ECE', 'ME', 'CE', 'EEE'];

// Simple pseudo-random number generator with a seed
function seededRandom(seed: number) {
    let state = seed;
    return function() {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
    };
}

function createStudent(id: number, random: () => number): Student {
    return {
        id: `STU${1000 + id}`,
        name: `${firstNames[Math.floor(random() * firstNames.length)]} ${lastNames[Math.floor(random() * lastNames.length)]}`,
        branch: branches[id % branches.length],
    };
}

function generateStudents(): Student[] {
    const random = seededRandom(123); // Using a fixed seed
    return Array.from({ length: 50 }, (_, i) => createStudent(i + 1, random));
}


export const students: Student[] = generateStudents();
