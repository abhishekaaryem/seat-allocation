import type { Hall, Student, SeatingArrangement, AssignedSeat } from './types';

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array The array to shuffle.
 */
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * A more advanced algorithm to generate a seating arrangement with an attempt to minimize conflicts.
 * Conflicts are defined as two students of the same branch sitting next to each other horizontally.
 *
 * @param students - The list of students to be seated.
 * @param halls - The list of available exam halls.
 * @returns A generated seating arrangement.
 */
export function generateSeatingArrangement(
  students: Student[],
  halls: Hall[]
): SeatingArrangement {
  if (!students || !halls || students.length === 0 || halls.length === 0) {
    return [];
  }

  // Create a mutable copy of students and shuffle them to improve branch distribution
  const studentPool = shuffle(students);
  const sortedHalls = [...halls].sort((a, b) => a.id.localeCompare(b.id));

  const arrangement: SeatingArrangement = [];
  const occupiedSeats = new Map<string, AssignedSeat>(); // "hallId-row-col" -> AssignedSeat

  let studentIndex = 0;

  for (const hall of sortedHalls) {
    for (let r = 0; r < hall.rows; r++) {
      for (let c = 0; c < hall.cols; c++) {
        if (studentIndex >= studentPool.length) {
          break; // All students have been seated
        }

        let currentStudent = studentPool[studentIndex];
        let placed = false;
        let attempt = 0;
        const maxAttempts = Math.min(10, studentPool.length - studentIndex - 1);

        // Try to place the student without conflict
        while (!placed && attempt <= maxAttempts) {
          const leftNeighborKey = `${hall.id}-${r}-${c - 1}`;
          const leftNeighbor = occupiedSeats.get(leftNeighborKey);

          if (leftNeighbor && leftNeighbor.student.branch === currentStudent.branch) {
            // Conflict found. Try to swap with a future student.
            const swapIndex = studentIndex + attempt + 1;
            if (swapIndex < studentPool.length) {
              const nextStudent = studentPool[swapIndex];
              // Check if swapping would resolve the conflict
              if (leftNeighbor.student.branch !== nextStudent.branch) {
                // Swap and use the new student
                [studentPool[studentIndex], studentPool[swapIndex]] = [studentPool[swapIndex], studentPool[studentIndex]];
                currentStudent = studentPool[studentIndex];
              }
            }
            attempt++;
          } else {
            placed = true;
          }
        }
        
        const newSeat: AssignedSeat = {
            hallId: hall.id,
            row: r,
            col: c,
            student: currentStudent,
        };

        arrangement.push(newSeat);
        occupiedSeats.set(`${hall.id}-${r}-${c}`, newSeat);
        studentIndex++;
      }
      if (studentIndex >= studentPool.length) break;
    }
    if (studentIndex >= studentPool.length) break;
  }

  return arrangement;
}
