import { PRIZE_LABELS } from "@/lib/winCheck";
import type { PrizeType } from "@/lib/types";

type WinnersListProps = {
  winners: {
    id: string;
    player_name: string;
    prize_type: PrizeType;
    claimed_at: string;
  }[];
};

export function WinnersList({ winners }: WinnersListProps) {
  if (winners.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink/18 bg-white/60 p-4 text-sm font-semibold text-ink/58">
        No winners claimed yet.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {winners.map((winner) => (
        <div
          key={winner.id}
          className="rounded-md border border-gulal/20 bg-gulal/8 px-4 py-3"
        >
          <p className="text-sm font-black text-ink">{PRIZE_LABELS[winner.prize_type]}</p>
          <p className="mt-1 text-sm font-semibold text-ink/66">{winner.player_name}</p>
        </div>
      ))}
    </div>
  );
}
