# ChessVerse

ChessVerse is a high-performance, real-time multiplayer chess application built on the **PERN** stack. It features competitive matchmaking, AI-driven gameplay, and a room-recycling system to optimize server resources.

---

## Features

- **Real-time Multiplayer:** Low-latency gameplay synchronized via WebSockets across dedicated paths (PvP, AI, and Guest).
- **Matchmaking System:** Efficient player pairing using Redis-backed queues.
- **Efficient Room Lifecycle:** Advanced state management: `WAITING` → `FULL` → `ACTIVE` → `FINISHED`.
- **Room Recycling:** When a match is `CANCELLED`, the system reuses the existing room record to reduce database bloat.
- **Guest-to-User Migration:** Play instantly as a guest. Upon registration, guest game history is merged into the permanent user profile.
- **State Persistence:** **Zustand** manages complex game state and reconnection logic, while HTTP-only cookies and JWT ensure secure, persistent sessions.

---

## Tech Stack

| Layer                | Technology                                                     |
| :------------------- | :------------------------------------------------------------- |
| **Frontend**         | React 19, Zustand, Tailwind CSS, Framer Motion, TanStack Query |
| **Backend**          | Node.js, Express.js, TypeScript                                |
| **Database**         | PostgreSQL with Prisma ORM                                     |
| **Caching / Queues** | Redis                                                          |
| **Real-time**        | WebSockets (`ws` library)                                      |
| **DevOps**           | Docker, Docker Compose                                         |

---

## Project Structure

### Backend

```text
Backend/
├── prisma/
│   └── schema.prisma        # PostgreSQL models & relations
├── src/
│   ├── Classes/             # Core logic: RoomManager, GameManager, ComputerGameManager
│   ├── clients/             # Prisma & Redis client singleton instances
│   ├── controllers/         # Express routes (user-controller.ts, game-controller.ts)
│   ├── generated/           # Internal Prisma Client output
│   ├── middleware.ts        # JWT auth & cookie verification logic
│   ├── Services/            # Business logic: Matchmaking and Computer Game services
│   ├── utils/               # Shared helpers, chess constants & messages
│   └── index.ts             # Server entry point & WebSocket upgrade handling
```

### Frontend

```text
Frontend/
├── src/
│   ├── api/                 # Axios configuration & API endpoints
│   ├── Components/          # UI modules: Chessboard, Modals, Navbars
│   ├── hooks/               # Custom hooks for WebSockets & Authentication
│   ├── Layout/              # PublicLayout & ProtectedLayout (Auth wrappers)
│   ├── lib/                 # SocketManager classes (Room, Guest, Computer)
│   ├── Pages/               # Views: Dashboard, GameRoom, Login, Landing
│   ├── stores/              # Zustand stores for game state, auth & UI
│   ├── types/               # Global TypeScript interfaces & Enums
│   └── utils/               # Frontend utility functions & formatters
```

---

## Database Relationships

> **Note:** While the database allows multiple games, rooms, and computer games per user over their lifetime, the app enforces that a user can only have **one active game**, **one active computer game**, and **one active hosted room** at any given time.

---

### User

Each user can participate in multiple games over their lifetime:

- **Games Won:** One-to-many (`User → Game` via `winnerId`)
- **Games Lost:** One-to-many (`User → Game` via `loserId`)
- **Computer Games:** One-to-many relations for games vs computer:
  - `UserComputerGames` → all games played against the computer
  - `ComputerGamesWon` → games the user won against the computer
  - `ComputerGamesLost` → games the user lost against the computer
- **Guest Games:** One-to-many as `player1` or `player2` for guest sessions
- **Rooms:**
  - **Created Rooms:** One-to-many (`User → Room`)
  - **Joined Rooms:** One-to-many (`User → Room`)

---

### Game

- Each game belongs to **exactly two users** (winner and loser).
- Each game can optionally belong to a **room** (for room-based games) — one-to-one with `Room`.
- Tracks moves, captured pieces, timers, status, and optional chat.

---

### ComputerGame

- Each computer game belongs to **one user**.
- Tracks winner/loser, moves, captured pieces, difficulty, and status.

---

### GuestGames

- Each guest game can have **two participants**: `player1` and `player2` (either guests or logged-in users).
- Tracks moves, captured pieces, timers, winner/loser, draw offers, and status.

---

## Room Lifecycle

The application implements a strict state machine to manage room concurrency and reuse:

1. **WAITING:** Room is created; searching for an opponent.
2. **FULL:** Opponent joined; game is ready to initialize.
3. **ACTIVE:** Match in progress; moves are being validated and broadcast.
4. **FINISHED:** Game concluded (Checkmate / Draw / Resignation).
5. **CANCELLED:** Room closed early. Cancelled rooms are recycled by the `RoomManager` for the next available pairing.

---

## Key Endpoints & Socket Paths

### REST API (/api/v1)

- User: `POST /user/register`, `POST /user/login`, `GET /user/profile`
- Game: `GET /game/stats-total`, `POST /game/computer/create`

### WebSocket Paths

- `ws://localhost:8080/room` — Competitive PvP Matchmaking
- `ws://localhost:8080/computer` — Stockfish / AI Gameplay
- `ws://localhost:8080/guest` — Anonymous quick-play sessions

## Local Setup

### 1. Infrastructure

Docker Compose will automatically start the Backend and Redis:

```bash
docker-compose up -d
```

### 2. Backend Setup

```bash
cd Backend
npm install
npx prisma generate   # Generates client to src/generated/
npm run dev
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```
