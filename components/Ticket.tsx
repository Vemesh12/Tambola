import type { TicketGrid } from "@/lib/types";

type TicketProps = {
  ticket: TicketGrid;
};

export function Ticket({ ticket }: TicketProps) {
  return (
    <div className="grid grid-cols-9 gap-1.5">
      {ticket.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={[
              "flex aspect-square items-center justify-center rounded border text-sm font-black sm:text-base",
              cell === null
                ? "border-transparent bg-ink/[0.045] text-transparent"
                : "border-ink/12 bg-white text-ink"
            ].join(" ")}
          >
            {cell}
          </div>
        ))
      )}
    </div>
  );
}
