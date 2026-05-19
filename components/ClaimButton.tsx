"use client";

import { PRIZE_LABELS } from "@/lib/winCheck";
import type { PrizeType } from "@/lib/types";

type ClaimButtonProps = {
  prizeType: PrizeType;
  disabled?: boolean;
  onClaim: (prizeType: PrizeType) => void;
};

export function ClaimButton({ prizeType, disabled, onClaim }: ClaimButtonProps) {
  return (
    <button
      className="h-11 rounded-md bg-gulal px-4 text-sm font-black text-white transition hover:bg-gulal/90 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={() => onClaim(prizeType)}
      type="button"
    >
      Claim {PRIZE_LABELS[prizeType]}
    </button>
  );
}
