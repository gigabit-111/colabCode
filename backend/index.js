import express from 'express';
import http from 'http';
import {
  Server
} from 'socket.io';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  },
});

const rooms = new Map(); // roomId => { users: Set, code: string, language: string, output: string }
const executingRooms = new Set(); // roomId set to track execution lock

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({
    roomId,
    username
  }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom)?.users.delete(currentUser);
      io.to(currentRoom).emit("userLeft", Array.from(rooms.get(currentRoom)?.users || []));
      // Clean up room if empty
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
        output: ""
      });
    }
    const room = rooms.get(roomId);
    room.users.add(username);

    // Send current code to the joining user for sync
    socket.emit("codeUpdate", room.code);
    // Optionally send current language and output as well
    socket.emit("languageUpdate", room.language);
    socket.emit("codeOutput", room.output);

    io.to(roomId).emit("userJoined", Array.from(room.users));
    console.log(`User ${username} joined room ${roomId}`);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom)?.users.delete(currentUser);
      io.to(currentRoom).emit("userLeft", Array.from(rooms.get(currentRoom)?.users || []));
      // Clean up room if empty
      if (rooms.get(currentRoom)?.users.size === 0) {
        rooms.delete(currentRoom);
      }
      socket.leave(currentRoom);
      console.log(`User ${currentUser} left room ${currentRoom}`);
      currentRoom = null;
      currentUser = null;
    }
  });

  socket.on("userTyping", ({
    roomId,
    username
  }) => {
    socket.to(roomId).emit("userTyping", username);
  });

  socket.on("codeChange", ({
    roomId,
    code
  }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.code = code;
    }
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("languageChange", ({
    roomId,
    language
  }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.language = language;
    }
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on("compileCode", async ({
    code,
    roomId,
    language,
    version,
    input
  }) => {
    if (executingRooms.has(roomId)) {
      socket.emit("codeExecutionBusy", {
        message: 'Code execution in progress, please wait.'
      });
      return;
    }

    executingRooms.add(roomId);
    io.to(roomId).emit("codeExecutionStarted");

    if (!rooms.has(roomId)) {
      socket.emit("codeResponse", {
        run: {
          output: "Error: Room does not exist."
        }
      });
      executingRooms.delete(roomId);
      io.to(roomId).emit("codeExecutionEnded");
      return;
    }

    try {
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language,
        version,
        files: [{
          content: code
        }],
        stdin: input || "",
      });

      const room = rooms.get(roomId);
      room.output = response.data.run.output;

      io.to(roomId).emit("codeResponse", response.data);
    } catch (error) {
      console.error("Code execution error:", error);
      io.to(roomId).emit("codeResponse", {
        run: {
          output: "Error executing code."
        }
      });
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
      // Clean up room if empty
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