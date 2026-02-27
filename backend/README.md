# Backend Service for CodeColab

This repository contains the server-side component of **CodeColab**, a real-time collaborative code editor. The backend manages room state, user presence, and remote code execution via Socket.IO and a third-party execution API.

---

## Key Features

- Room lifecycle management with unique IDs (UUIDs)
- Real-time collaboration using Socket.IO
- Username uniqueness enforcement per room
- Code execution via external API (configured through `CODE_EXECUTION_URL`)
- Lightweight REST endpoints for room/user checks
- CORS configuration for secure frontend communication
- Health check and room info endpoints

---

## Prerequisites

- Node.js 16+ (LTS recommended)
- npm or yarn

---

## Getting Started

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment variables**
   Copy `.env.example` (if present) or create a new `.env`:
   ```ini
   FRONTEND_URL=http://localhost:5173
   CODE_EXECUTION_URL=https://emkc.org/api/v2/piston/execute
   PORT=5000
   ```
   - `FRONTEND_URL`: Full URL of the frontend app (no trailing slash).
   - `CODE_EXECUTION_URL`: Remote code execution API endpoint.
   - `PORT`: Port to listen on (defaults to 8080 if unset).

3. **Run the server**
   ```bash
   npm run dev   # uses nodemon for live reload
   ```

4. **Production build**
   ```bash
   npm start     # runs node index.js
   ```

---

## REST Endpoints

| Method | Path             | Description                                  |
|--------|------------------|----------------------------------------------|
| GET    | `/room-exists`   | Checks whether a room ID exists.             |
| GET    | `/user-exists`   | Verifies if a username is in a given room.   |
| GET    | `/user-exit`     | Determines if user is currently in a room.   |
| GET    | `/room-info`     | Returns users, language, and user count.     |
| GET    | `/health`        | Basic health check with active room count.   |

---

## Socket.IO Events

### Incoming from client

- `createRoom` – requests a new room ID.
- `join` – joins a room with `{ roomId, username }`.
- `leaveRoom` – instructs server to remove user from current room.
- `userTyping` – notify others that user is typing.
- `codeChange` – broadcast code updates.
- `codeInputChange` – broadcast stdin input changes.
- `languageChange` – broadcast language selection.
- `compileCode` – triggers remote execution; server returns output.

### Outgoing to client

- `roomCreated` – returned with new room ID.
- `userJoined` / `userLeft` – updated user lists.
- `userTyping` – typing indicator string.
- `codeUpdate`, `codeInputUpdate`, `languageUpdate`, `codeOutput`
- `codeExecutionStarted` / `codeExecutionEnded` / `codeExecutionBusy`
- `codeResponse` – execution result.
- `joinError` – failure reason for join attempts.

---

## Development Tips

- To avoid CORS mismatches, always set `FRONTEND_URL` without a trailing slash.
- The server keeps all room state in memory; restarting the process will clear all rooms.
- For deployment, consider using a process manager (PM2, Docker, etc.) and ensure the frontend URL is correctly configured.

---

## License

MIT License. See [LICENSE](../LICENSE) in root if applicable.
