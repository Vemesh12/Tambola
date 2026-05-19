import { TAMBOLA_NUMBERS } from "@/lib/numbers";

type NumberBoardProps = {
  calledNumbers: number[];
};

export function NumberBoard({ calledNumbers }: NumberBoardProps) {
  const called = new Set(calledNumbers);
  const latestNumber = calledNumbers.at(-1);

  return (
    <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
      {TAMBOLA_NUMBERS.map((number) => {
        const isCalled = called.has(number);
        const isLatest = latestNumber === number;

        return (
          <div
            key={number}
            className={[
              "flex aspect-square min-h-8 items-center justify-center rounded border text-xs font-black sm:text-sm",
              isLatest
                ? "border-gulal bg-gulal text-white shadow-soft"
                : isCalled
                  ? "border-mint bg-mint text-white"
                  : "border-ink/10 bg-white/72 text-ink/45"
            ].join(" ")}
          >
            {number}
          </div>
        );
      })}
    </div>
  );
}
