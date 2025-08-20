import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import axios from 'axios';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const rooms = new Map(); // roomId => Set of usernames
const executingRooms = new Set(); // roomId set to track execution lock

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({ roomId, username }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom)?.delete(currentUser);
      io.to(currentRoom).emit("userLeft", Array.from(rooms.get(currentRoom) || []));
    }

    currentRoom = roomId;
    currentUser = username;
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(username);

    io.to(roomId).emit("userJoined", Array.from(rooms.get(roomId)));
    console.log(`User ${username} joined room ${roomId}`);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.delete(currentUser);
      io.to(currentRoom).emit("userLeft", Array.from(rooms.get(currentRoom) || []));
      socket.leave(currentRoom);
      console.log(`User ${currentUser} left room ${currentRoom}`);
      currentRoom = null;
      currentUser = null;
    }
  });

  socket.on("userTyping", ({ roomId, username }) => {
    socket.to(roomId).emit("userTyping", username);
  });

  socket.on("compilecode", async ({ code, roomId, language, version }) => {
    if (executingRooms.has(roomId)) {
      socket.emit("codeexecutionBusy", { message: 'Code execution in progress, please wait.' });
      return;
    }

    executingRooms.add(roomId);
    io.to(roomId).emit("codeexecutionStarted");

    if (!rooms.has(roomId)) {
      socket.emit("coderesponse", { run: { output: "Error: Room does not exist." } });
      executingRooms.delete(roomId);
      io.to(roomId).emit("codeexecutionEnded");
      return;
    }

    try {
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language,
        version,
        files: [{ content: code }],
      });

      rooms.get(roomId).output = response.data.run.output;
      io.to(roomId).emit("coderesponse", response.data);
    } catch (error) {
      io.to(roomId).emit("coderesponse", { run: { output: "Error executing code." } });
    } finally {
      executingRooms.delete(roomId);
      io.to(roomId).emit("codeexecutionEnded");
    }
  });

  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.delete(currentUser);
      io.to(currentRoom).emit("userLeft", Array.from(rooms.get(currentRoom) || []));
      console.log(`User ${currentUser} disconnected and left room ${currentRoom}`);
    }
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
