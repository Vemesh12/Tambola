export const TAMBOLA_NUMBERS = Array.from({ length: 90 }, (_, index) => index + 1);

export function pickNextNumber(calledNumbers: number[]) {
  const called = new Set(calledNumbers);
  const availableNumbers = TAMBOLA_NUMBERS.filter((number) => !called.has(number));

  if (availableNumbers.length === 0) {
    return null;
  }

  return availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
}
