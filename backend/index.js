import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import { FRONTEND_URL, PORT, RELOAD_INTERVAL } from './src/config.js';
import { connectDB } from './src/db.js'; 
import registerSocketHandlers from './src/socketHandlers.js';
import apiRoutes from './src/routes.js';

const app = express();
app.use(express.json({ limit: "1mb" }));

// CORS setup
const corsOrigin = FRONTEND_URL || true;
app.use(cors({
  origin: corsOrigin,
  credentials: Boolean(FRONTEND_URL),
}));

// Optional: keep frontend alive on Render
if (FRONTEND_URL) {
  setInterval(() => {
    axios.get(FRONTEND_URL)
      .then(() => console.log("Frontend reloaded"))
      .catch(err => console.error("Error reloading frontend:", err));
  }, RELOAD_INTERVAL);
}

// Mount API routes
app.use('/', apiRoutes);

// Create HTTP server
const server = http.createServer(app);

// Connect to MongoDB then start server
connectDB().then(() => {
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: Boolean(FRONTEND_URL),
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    registerSocketHandlers(io, socket);
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});