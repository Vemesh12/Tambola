type PlayerListProps = {
  players: {
    id: string;
    name: string;
    joined_at: string;
  }[];
};

export function PlayerList({ players }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink/18 bg-white/60 p-4 text-sm font-semibold text-ink/58">
        No players joined yet.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {players.map((player, index) => (
        <div
          key={player.id}
          className="flex items-center justify-between rounded-md border border-ink/10 bg-white/75 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-mint text-sm font-black text-white">
              {index + 1}
            </span>
            <span className="font-bold text-ink">{player.name}</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
            joined
          </span>
        </div>
      ))}
    </div>
  );
}
