import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import axios from 'axios';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

const FRONTEND_URL = process.env.FRONTEND_URL;
const CODE_EXECUTION_URL = process.env.CODE_EXECUTION_URL;

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
  },
});

const rooms = new Map(); // roomId => { users: Set, code: string, language: string, output: string }
const executingRooms = new Set();

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  socket.on("createRoom", () => {
    const newRoomId = uuidv4();
    rooms.set(newRoomId, {
      users: new Set(),
      code: "",
      language: "javascript",
      output: ""
    });
    socket.emit("roomCreated", newRoomId);
  });

  socket.on("join", ({ roomId, username }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom)?.users.delete(currentUser);
      io.to(currentRoom).emit("userLeft", Array.from(rooms.get(currentRoom)?.users || []));
      if (rooms.get(currentRoom)?.users.size === 0) {
        rooms.delete(currentRoom);
      }
    }

    currentRoom = roomId;
    currentUser = username;
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Set(),
        code: "",
        language: "javascript",
        output: "",
      });
    }
    const room = rooms.get(roomId);
    room.users.add(username);

    socket.emit("codeUpdate", room.code);
    socket.emit("languageUpdate", room.language);
    socket.emit("codeOutput", room.output);

    io.to(roomId).emit("userJoined", Array.from(room.users));
    console.log(`User ${username} joined room ${roomId}`);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.users.delete(currentUser);
      io.to(currentRoom).emit("userLeft", Array.from(rooms.get(currentRoom)?.users || []));
      if (rooms.get(currentRoom)?.users.size === 0) {
        rooms.delete(currentRoom);
      }
      socket.leave(currentRoom);
      console.log(`User ${currentUser} left room ${currentRoom}`);
      currentRoom = null;
      currentUser = null;
    }
  });

  socket.on("userTyping", ({ roomId, username }) => {
    socket.to(roomId).emit("userTyping", username);
  });

  socket.on("codeChange", ({ roomId, code }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.code = code;
    }
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.language = language;
    }
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on("compileCode", async ({ code, roomId, language, version, input }) => {
    if (executingRooms.has(roomId)) {
      socket.emit("codeExecutionBusy", { message: 'Code execution in progress, please wait.' });
      return;
    }

    executingRooms.add(roomId);
    io.to(roomId).emit("codeExecutionStarted");

    if (!rooms.has(roomId)) {
      socket.emit("codeResponse", { run: { output: "Error: Room does not exist." } });
      executingRooms.delete(roomId);
      io.to(roomId).emit("codeExecutionEnded");
      return;
    }

    try {
      const response = await axios.post(`${CODE_EXECUTION_URL}`, {
        language,
        version,
        files: [{ content: code }],
        stdin: input || "",
      });

      const room = rooms.get(roomId);
      room.output = response.data.run.output;

      io.to(roomId).emit("codeResponse", response.data);
    } catch (error) {
      console.error("Code execution error:", error);
      io.to(roomId).emit("codeResponse", { run: { output: "Error executing code." } });
    } finally {
      executingRooms.delete(roomId);
      io.to(roomId).emit("codeExecutionEnded");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.users.delete(currentUser);
      io.to(currentRoom).emit("userLeft", Array.from(rooms.get(currentRoom)?.users || []));
      if (rooms.get(currentRoom)?.users.size === 0) {
        rooms.delete(currentRoom);
      }
      console.log(`User ${currentUser} disconnected and left room ${currentRoom}`);
    }
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
