# Frontend for CodeColab

This is the React-based client for **CodeColab**, a browser application that lets multiple users edit and execute code together in real time. The frontend communicates with the backend service over WebSockets and REST APIs.

---

## Tech Stack

- React 18 with Hooks
- Vite build tool
- Tailwind CSS for styling
- Socket.IO-client for real-time updates
- Monaco Editor component for code editing
- React Resizable Panels for layout
- React Hot Toast for notifications

---

## Setup & Development

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the frontend directory:
   ```ini
   VITE_BACKEND_URL=http://localhost:5000
   ```
   - `VITE_BACKEND_URL` should match the backend address including protocol.

3. **Start the dev server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173` by default.

4. **Build for production**
   ```bash
   npm run build
   ```
   Output is placed in `dist/`.

5. **Preview production build**
   ```bash
   npm run serve
   ```

---

## Key Pages

- **InitialPage** – Landing screen with links to create or join a room.
- **CreatePage** – Enter username and generate a new room.
- **JoinPage** – Enter username and existing room ID; performs backend validation.
- **EditorPage** – Main collaboration interface with code editor, input/output panel, and user list.

---

## Routing

The app uses React Router with the following routes:

```jsx
<Routes>
  <Route path="/" element={<InitialPage />} />
  <Route path="/join" element={<JoinPage />} />
  <Route path="/create" element={<CreatePage />} />
  <Route path="/room/:roomId" element={<EditorPage />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

## Socket.IO Events

- `roomCreated`, `userJoined`, `userLeft`, `userTyping`
- `codeUpdate`, `languageUpdate`, `codeInputUpdate`, `codeOutput`
- `codeExecutionStarted`, `codeExecutionEnded`, `codeExecutionBusy`, `codeResponse`
- `joinError` for duplicate name errors

Client emits matching events such as `join`, `createRoom`, `codeChange`, etc.

---

## Notes

- **Username uniqueness** is enforced on both frontend and backend.
- **CORS**: frontend and backend must agree on origins to allow REST checks; ensure backend `FRONTEND_URL` is set properly without trailing slash.
- **Local storage** is used to remember the last username.
- The app is responsive, with separate layouts for mobile and desktop.

---

## Contribution

Feel free to submit PRs with new features or fixes. The frontend is a standard Vite React project – run `npm run lint` or `npm run format` if those scripts are available.

---

## License

MIT License. See [LICENSE](../LICENSE) in root if applicable.
