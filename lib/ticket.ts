import type { TicketGrid } from "@/lib/types";

const ROWS = 3;
const COLS = 9;
const NUMBERS_PER_ROW = 5;
const TOTAL_NUMBERS = ROWS * NUMBERS_PER_ROW;

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function pickRandomNumbers(min: number, max: number, count: number, exclude?: Set<number>) {
  const available = range(min, max).filter((n) => !(exclude && exclude.has(n)));
  if (available.length < count) {
    throw new Error('Not enough numbers to pick without repeats');
  }
  return shuffle(available).slice(0, count).sort((a, b) => a - b);
}

function columnRange(col: number) {
  return {
    min: col === 0 ? 1 : col * 10,
    max: col === COLS - 1 ? 90 : col * 10 + 9
  };
}

function createValidMask() {
  for (let attempt = 0; attempt < 200; attempt++) {
    const mask = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const rowCounts = Array(ROWS).fill(0);
    const colCounts = Array(COLS).fill(0);

    for (const col of shuffle(range(0, COLS - 1))) {
      const availableRows = shuffle(range(0, ROWS - 1)).filter(
        (row) => rowCounts[row] < NUMBERS_PER_ROW
      );
      const row = availableRows[0];

      if (row === undefined) {
        break;
      }

      mask[row][col] = true;
      rowCounts[row]++;
      colCounts[col]++;
    }

    while (rowCounts.reduce((total, count) => total + count, 0) < TOTAL_NUMBERS) {
      const availableCells = [];

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (!mask[row][col] && rowCounts[row] < NUMBERS_PER_ROW && colCounts[col] < ROWS) {
            availableCells.push({ row, col });
          }
        }
      }

      if (availableCells.length === 0) {
        break;
      }

      const cell = shuffle(availableCells)[0];
      mask[cell.row][cell.col] = true;
      rowCounts[cell.row]++;
      colCounts[cell.col]++;
    }

    const hasValidRows = rowCounts.every((count) => count === NUMBERS_PER_ROW);
    const hasValidColumns = colCounts.every((count) => count >= 1);

    if (hasValidRows && hasValidColumns) {
      return mask;
    }
  }

  throw new Error("Unable to generate a valid Tambola ticket mask");
}

export function generateTicket(exclude?: Set<number>): TicketGrid {
  const mask = createValidMask();
  const ticket: TicketGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  for (let col = 0; col < COLS; col++) {
    const rowsInColumn = mask
      .map((row, rowIndex) => (row[col] ? rowIndex : null))
      .filter((rowIndex): rowIndex is number => rowIndex !== null);
    const { min, max } = columnRange(col);
    const numbers = pickRandomNumbers(min, max, rowsInColumn.length, exclude);

    rowsInColumn.forEach((row, index) => {
      ticket[row][col] = numbers[index];
    });
  }

  return ticket;
}

export function validateTicket(ticket: TicketGrid) {
  if (ticket.length !== ROWS || ticket.some((row) => row.length !== COLS)) {
    return false;
  }

  const rowCounts = ticket.map((row) => row.filter((cell) => cell !== null).length);
  const colCounts = range(0, COLS - 1).map(
    (col) => ticket.filter((row) => row[col] !== null).length
  );

  const rowsAreValid = rowCounts.every((count) => count === NUMBERS_PER_ROW);
  const colsAreValid = colCounts.every((count) => count >= 1);
  const valuesAreValid = ticket.every((row) =>
    row.every((cell, col) => {
      if (cell === null) {
        return true;
      }

      const { min, max } = columnRange(col);
      return Number.isInteger(cell) && cell >= min && cell <= max;
    })
  );

  return rowsAreValid && colsAreValid && valuesAreValid;
}
