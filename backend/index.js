import express from 'express';
import http from 'http';
import {
  Server
} from 'socket.io';
import axios from 'axios';
import dotenv from 'dotenv';
import {
  v4 as uuidv4
} from 'uuid';
import cors from 'cors';
dotenv.config();

// normalize frontend URL to ensure it has a protocol and no trailing slash
let FRONTEND_URL = process.env.FRONTEND_URL || "";
if (FRONTEND_URL) {
  if (!/^https?:\/\//i.test(FRONTEND_URL)) {
    // default to http for local development
    FRONTEND_URL = `http://${FRONTEND_URL}`;
  }
  // remove trailing slash, as CORS origin must exactly match
  FRONTEND_URL = FRONTEND_URL.replace(/\/$/, "");
}
const CODE_EXECUTION_URL = process.env.CODE_EXECUTION_URL;
const interval = 30000;
const app = express();
app.use(express.json({ limit: "1mb" }));

// If FRONTEND_URL isn't configured, allow all origins (dev-friendly).
const corsOrigin = FRONTEND_URL || true;
app.use(cors({
  origin: corsOrigin,
  credentials: Boolean(FRONTEND_URL),
}));

// onrender deploy hack
function reloadWebSite() {
  if (!FRONTEND_URL) return;
  axios.get(FRONTEND_URL)
    .then((response) => {
      console.log("Frontend reloaded");
    })
    .catch((error) => {
      console.error("Error reloading frontend:", error);
    });
}

if (FRONTEND_URL) {
  setInterval(reloadWebSite, interval);
}
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    credentials: Boolean(FRONTEND_URL),
  },
});

const rooms = new Map();
const executingRooms = new Set();

console.log("rooms", rooms);

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
      output: "",
      input: ""
    });
    socket.emit("roomCreated", newRoomId);
  });

  socket.on("join", ({
    roomId,
    username
  }) => {
    // if we're already in the same room with the same name, ignore the duplicate call
    if (currentRoom === roomId && currentUser === username) {
      // nothing to do, but return success state
      console.log(`User ${username} re-joined room ${roomId} (duplicate event)`);
      return;
    }

    // leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom)?.users.delete(currentUser);
      io.to(currentRoom).emit("userLeft", Array.from(rooms.get(currentRoom)?.users || []));
      if (rooms.get(currentRoom)?.users.size === 0) {
        rooms.delete(currentRoom);
      }
    }

    // ensure the target room exists
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Set(),
        code: "",
        language: "javascript",
        output: "",
        input: ""
      });
    }
    const room = rooms.get(roomId);

    // reject if another user already has this name
    if (room.users.has(username)) {
      socket.emit("joinError", {
        message: "Username already in use in this room. Please choose a different name."
      });
      return;
    }

    currentRoom = roomId;
    currentUser = username;
    socket.join(roomId);

    room.users.add(username);

    socket.emit("codeInputUpdate", room.input);
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

  socket.on("codeInputChange", ({
    roomId,
    codeInput
  }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.input = codeInput;
      io.to(roomId).emit("codeInputUpdate", codeInput);
    }
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
    codeinput
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
      // console.log("code execute", code);
      // console.log("input", codeinput);
      const response = await axios.post(CODE_EXECUTION_URL, {
        language,
        version,
        files: [{
          content: code
        }],
        stdin: codeinput,
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
      if (rooms.get(currentRoom)?.users.size === 0) {
        rooms.delete(currentRoom);
      }
      console.log(`User ${currentUser} disconnected and left room ${currentRoom}`);
    }
  });
});

app.get("/user-exit", (req, res) => {
  const { username, roomId } = req.query; // <-- use req.query
  let exists = false;
  if (rooms.has(roomId)) {
    exists = rooms.get(roomId).users.has(username);
  }
  res.json({ exists }); 
});

app.get("/room-exists", (req, res) => {
  const { roomId } = req.query
  const exists = rooms.has(roomId)
  res.json({ exists })
})

// Check if username exists in room (rename your existing endpoint)
app.get("/user-exists", (req, res) => {
  const { username, roomId } = req.query
  let exists = false
  
  if (rooms.has(roomId)) {
    exists = rooms.get(roomId).users.has(username)
  }
  
  res.json({ exists })
})

// Optional: Get room info (users count, language, etc.)
app.get("/room-info", (req, res) => {
  const { roomId } = req.query
  
  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: "Room not found" })
  }
  
  const room = rooms.get(roomId)
  res.json({
    roomId,
    userCount: room.users.size,
    language: room.language,
    users: Array.from(room.users)
  })
})

// Optional: Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    activeRooms: rooms.size,
    timestamp: new Date().toISOString()
  })
})


const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});