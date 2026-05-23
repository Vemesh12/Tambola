"use client";

import type { TicketGrid } from "@/lib/types";

type PlayerTicketProps = {
  ticket: TicketGrid;
  calledNumbers: number[];
  markedNumbers: number[];
  onToggleNumber: (number: number) => void;
};

export function PlayerTicket({
  ticket,
  calledNumbers,
  markedNumbers,
  onToggleNumber
}: PlayerTicketProps) {
  const called = new Set(calledNumbers);
  const marked = new Set(markedNumbers);
  const latestNumber = calledNumbers.at(-1);

  return (
    <div className="grid grid-cols-9 gap-1.5">
      {ticket.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isCalled = cell !== null && called.has(cell);
          const isMarked = cell !== null && marked.has(cell);
          const isLatest = cell !== null && latestNumber === cell;

          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={[
                "flex aspect-square min-h-10 items-center justify-center rounded border text-sm font-black transition sm:text-base",
                cell === null
                  ? "cursor-default border-transparent bg-ink/[0.045] text-transparent"
                  : isMarked
                    ? "border-gulal bg-gulal text-white line-through cursor-pointer hover:bg-gulal/90"
                    : isLatest
                      ? "border-saffron border-2 bg-white text-ink cursor-pointer hover:bg-saffron/10 animate-pulse"
                      : isCalled
                        ? "border-ink bg-white text-ink cursor-pointer hover:bg-ink/5"
                        : "border-ink/10 bg-ink/[0.02] text-ink/25 cursor-not-allowed"
              ].join(" ")}
              disabled={cell === null || !isCalled}
              onClick={() => {
                if (cell !== null) {
                  onToggleNumber(cell);
                }
              }}
              type="button"
            >
              {cell}
            </button>
          );
        })
      )}
    </div>
  );
}
