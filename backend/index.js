import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
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

  socket.on("join", ({roomId, username}) => {
    if(currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userLeft", Array.from(rooms.get(currentRoom)));
      // console.log(`User ${socket.id} left room ${currentRoom}`);
    }

    currentRoom = roomId;
    currentUser = username;
    socket.join(roomId);

    if(!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(username);

    io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));
    console.log(`User ${username} joined room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    if (currentRoom) {
      socket.leave(currentRoom);
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