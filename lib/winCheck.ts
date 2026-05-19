import type { PrizeType, TicketGrid } from "@/lib/types";

export const PRIZE_LABELS: Record<PrizeType, string> = {
  early_five: "Early Five",
  corners: "Four Corners",
  top: "Top Line",
  middle: "Middle Line",
  bottom: "Bottom Line",
  full_house: "Full House"
};

export const PRIZE_ORDER: PrizeType[] = [
  "early_five",
  "corners",
  "top",
  "middle",
  "bottom",
  "full_house"
];

function ticketNumbers(ticket: TicketGrid) {
  return ticket.flat().filter((cell): cell is number => cell !== null);
}

function rowNumbers(ticket: TicketGrid, rowIndex: number) {
  return ticket[rowIndex].filter((cell): cell is number => cell !== null);
}

function cornerNumbers(ticket: TicketGrid) {
  const corners = [
    ticket[0].find((cell) => cell !== null),
    [...ticket[0]].reverse().find((cell) => cell !== null),
    ticket[2].find((cell) => cell !== null),
    [...ticket[2]].reverse().find((cell) => cell !== null)
  ];

  return corners.filter((cell): cell is number => cell !== null);
}

function allMarked(numbers: number[], marked: Set<number>) {
  return numbers.length > 0 && numbers.every((number) => marked.has(number));
}

export function checkPrize(ticket: TicketGrid, markedNumbers: number[], prizeType: PrizeType) {
  const marked = new Set(markedNumbers);

  switch (prizeType) {
    case "early_five":
      return ticketNumbers(ticket).filter((number) => marked.has(number)).length >= 5;
    case "corners":
      return allMarked(cornerNumbers(ticket), marked);
    case "top":
      return allMarked(rowNumbers(ticket, 0), marked);
    case "middle":
      return allMarked(rowNumbers(ticket, 1), marked);
    case "bottom":
      return allMarked(rowNumbers(ticket, 2), marked);
    case "full_house":
      return allMarked(ticketNumbers(ticket), marked);
  }
}

export function getEligiblePrizes(ticket: TicketGrid, markedNumbers: number[]) {
  return PRIZE_ORDER.filter((prizeType) => checkPrize(ticket, markedNumbers, prizeType));
}
