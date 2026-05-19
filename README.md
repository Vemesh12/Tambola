# Tambola Online

Tambola Online is being implemented week by week from the build document.

Completed so far:

- Week 1: Next.js project setup, Tailwind styling, environment template, and Supabase schema.
- Week 2: Tambola ticket generation, unique room code generation, and room creation API.
- Week 3: Player join API, session persistence, host waiting room, and player waiting room.
- Week 4: Host game screen, start-game API, call-number API, number board, and called list.
- Week 5: Player game screen, player ticket loading, called-number board, and ticket marking.
- Week 6: Win detection, claim API, claim buttons, and winner lists.
- Week 7: Pusher realtime events and live page refresh subscriptions.

## Folder Structure

- `app/` - Next.js App Router pages and future API routes.
- `components/` - Shared UI components for later weeks.
- `lib/` - Shared clients, environment helpers, and future game logic.
- `supabase/schema.sql` - Week 1 database schema to run in Supabase SQL Editor.

No separate backend folder is needed right now. Next.js API routes will live under `app/api` when Week 2 starts.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in Supabase and Pusher values.

3. Run the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Supabase Setup

Create a Supabase project, open SQL Editor, and run the contents of:

```text
supabase/schema.sql
```

## API Routes

### `POST /api/rooms/create`

Creates a room in Supabase and returns a generated preview ticket.

Request:

```json
{
  "hostName": "Priya"
}
```

### `POST /api/rooms/join`

Joins an existing waiting room and creates or updates a player for the browser session.

Request:

```json
{
  "code": "TM4829",
  "name": "Rahul",
  "sessionId": "optional-existing-browser-session"
}
```

### `GET /api/rooms/[code]`

Returns room state with the current player list.

### `POST /api/rooms/[code]/start`

Moves a waiting room into `playing` status.

### `POST /api/rooms/[code]/call`

Calls the next random unused number and saves it to `called_numbers`.

### `GET /api/rooms/[code]/players/[playerId]`

Returns a specific player's ticket, marked numbers, and current room state.

### `POST /api/rooms/[code]/players/[playerId]/mark`

Toggles a called ticket number in the player's marked list.

### `POST /api/rooms/[code]/claim`

Validates a player's ticket for a prize and saves the winner.

Request:

```json
{
  "playerId": "player-uuid",
  "prizeType": "early_five"
}
```

## Realtime Events

All Pusher events publish on `room-[code]`, for example `room-TM4829`.

- `player-joined` - refreshes waiting rooms.
- `game-started` - refreshes waiting rooms and player game state.
- `number-called` - refreshes host/player game screens.
- `winner-claimed` - refreshes winner lists on host/player game screens.

Response:

```json
{
  "room": {
    "code": "TM4829"
  },
  "previewTicket": [[4, null, 12, null, 31, null, 61, null, 82]]
}
```

## Week Plan

- Week 1: Project setup, environment template, Supabase schema. Done.
- Week 2: Ticket generation and room creation API. Done.
- Week 3: Join flow and waiting room. Done.
- Week 4: Host game screen and number calling. Done.
- Week 5: Player game screen and ticket marking. Done.
- Week 6: Win detection and claim flow. Done.
- Week 7: Real-time Pusher integration. Done.
- Week 8: Polish, deploy, and test.
