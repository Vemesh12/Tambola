export type TicketCell = number | null;
export type TicketGrid = TicketCell[][];

export type RoomStatus = "waiting" | "playing" | "finished";

export type RoomRecord = {
  id: string;
  code: string;
  host_name: string;
  status: RoomStatus;
  called_numbers: number[];
  created_at: string;
};

export type PlayerRecord = {
  id: string;
  room_id: string;
  name: string;
  session_id: string;
  ticket: {
    rows: TicketGrid;
  };
  marked: number[];
  joined_at: string;
};

export type PrizeType =
  | "early_five"
  | "corners"
  | "top"
  | "middle"
  | "bottom"
  | "full_house";

export type WinnerRecord = {
  id: string;
  room_id: string;
  player_id: string | null;
  player_name: string;
  prize_type: PrizeType;
  claimed_at: string;
};
