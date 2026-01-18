# ChessVerse

ChessVerse is a high-performance, real-time multiplayer chess application built on the **PERN** stack. It features competitive matchmaking, AI-driven gameplay, and a efficient room-recycling system to optimize server resources.

---

## Features

- **Real-time Multiplayer**: Low-latency gameplay synchronized via WebSockets across dedicated paths (PvP, AI, and Guest).
- **Matchmaking System**: Efficient player pairing using Redis-backed queues.
- **Efficient Room Lifecycle**: - Advanced state management: `WAITING` → `FULL` → `ACTIVE` → `FINISHED`.
- **Room Recycling**: If a match is `CANCELLED`, the system systematically reuses the existing room record to optimize database performance.
- **Guest-to-User Migration**: Play instantly as a guest. Upon registration, guest game history is automatically merged into the permanent user profile.
- **State Persistence**: **Zustand** manages complex game states and reconnection logic, while **HTTP-only Cookies** and JWT ensure secure, persistent sessions.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Zustand, Tailwind CSS, Framer Motion, TanStack Query |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL with Prisma ORM |
| **Caching/Queues** | Redis |
| **Real-time** | WebSockets (ws library) |
| **DevOps** | Docker, Docker Compose |

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

## Room Lifecycle

The application implements a strict state machine to manage room concurrency and reuse:

1. WAITING: Room is created; searching for an opponent.
2. FULL: Opponent joined; game is ready to initialize.
3. ACTIVE: Match in progress; moves are being validated and broadcasted.
4. FINISHED: Game concluded (Checkmate/Draw/Resignation).
5. CANCELLED: Room closed early. Note: Cancelled rooms are recycled by 
   the RoomManager for the next available pairing to reduce database bloat.

---

### Key Endpoints & Socket Paths

#### REST API (/api/v1)
User: POST /user/register, POST /user/login, GET /user/profile

Game: GET /game/stats-total, POST /game/computer/create

#### WebSocket Paths
ws://localhost:8080/room — Competitive PvP Matchmaking.

ws://localhost:8080/computer — Stockfish/AI Gameplay.

ws://localhost:8080/guest — Anonymous quick-play sessions.

---

Local Setup
---
#### 1. Infrastructure
Docker Compose will automatically  Backend and  Redis.
```
  docker-compose up -d
```

#### 2. Backend Setup
```
cd Backend
npm install
npx prisma generate   # Generates client to src/generated/
npm run dev
```

#### 3. Frontend Setup
```
cd Frontend
npm install
npm run dev
```
