import express from 'express';
import http from 'http';
import {
  Server
} from 'socket.io';
import axios from 'axios';
const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const rooms = new Map();

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
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userLeft", Array.from(rooms.get(currentRoom)));
      // console.log(`User ${socket.id} left room ${currentRoom}`);
    }

    currentRoom = roomId;
    currentUser = username;
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(username);

    io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));
    console.log(`User ${username} joined room ${roomId}`);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      // socket.leave(currentRoom);
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));

      socket.leave(currentRoom);
      currentRoom = null;
      currentUser = null;
      console.log(`User ${socket.id} left room ${currentRoom}`);
    }
  });

  socket.on("userTyping", ({
    roomId,
    username
  }) => {
    socket.to(roomId).emit("userTyping", username);
  });

  socket.on("compilecode",async({code,roomId,language,version}) => {
    if(rooms.has(roomId)) {
      const room = rooms.get(roomId);
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language,
        version,
        files:[
          {
            content: code,
          }
        ]
      });

      room.output = response.data.run.output;
      io.to(roomId).emit("coderesponse", response.data);
    }
  });

  socket.on("languageChange", ({
    roomId,
    language
  }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on("codeChange", ({
    roomId,
    code
  }) => {
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    if (currentRoom && currentUser) {
      //socket.leave(currentRoom);
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userLeft", Array.from(rooms.get(currentRoom)));
      console.log(`User ${socket.id} left room ${currentRoom}`);
    }
  });


});

const port = process.env.PORT || 5000;

// app.get('/', (req, res) => {
//  res.send('Hello, World!');
// })

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});