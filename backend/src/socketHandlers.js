import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { roomManager } from './roomManager.js';
import { JDOODLE_CLIENT_ID, JDOODLE_CLIENT_SECRET, JDOODLE_API_URL } from './config.js';
import { getJDoodleParams } from './languageMap.js';


export default function registerSocketHandlers(io, socket) {
  let currentRoom = null;
  let currentUser = null;

  socket.on("createRoom", () => {
    const newRoomId = uuidv4();
    // createRoom is async, but we don't need to wait for client response
    roomManager.createRoom(newRoomId).then(() => {
      socket.emit("roomCreated", newRoomId);
    });
  });

  socket.on("join", async ({ roomId, username }) => {
    if (currentRoom === roomId && currentUser === username) {
      return;
    }

    // Leave previous room if any
    if (currentRoom) {
      await handleLeave();
    }

    // Ensure room exists and username is free
    const added = await roomManager.addUser(roomId, username);
    if (!added) {
      socket.emit("joinError", {
        message: "Username already in use in this room. Please choose a different name."
      });
      return;
    }

    currentRoom = roomId;
    currentUser = username;
    socket.join(roomId);

    const roomData = await roomManager.getRoomData(roomId);
    socket.emit("codeInputUpdate", roomData.input);
    socket.emit("codeUpdate", roomData.code);
    socket.emit("languageUpdate", roomData.language);
    socket.emit("codeOutput", roomData.output);

    io.to(roomId).emit("userJoined", roomData.users);
    console.log(`User ${username} joined room ${roomId}`);
  });

  socket.on("leaveRoom", async () => {
    await handleLeave();
  });

  socket.on("userTyping", ({ roomId, username }) => {
    socket.to(roomId).emit("userTyping", username);
  });

  socket.on("codeChange", async ({ roomId, code }) => {
    await roomManager.setCode(roomId, code);
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("codeInputChange", async ({ roomId, codeInput }) => {
    await roomManager.setInput(roomId, codeInput);
    io.to(roomId).emit("codeInputUpdate", codeInput);
  });

  socket.on("languageChange", async ({ roomId, language }) => {
    await roomManager.setLanguage(roomId, language);
    io.to(roomId).emit("languageUpdate", language);
  });

 socket.on("compileCode", async ({ code, roomId, language, codeinput }) => {
  if (roomManager.isExecuting(roomId)) {
    socket.emit("codeExecutionBusy", {
      message: 'Code execution in progress, please wait.'
    });
    return;
  }

  roomManager.setExecuting(roomId, true);
  io.to(roomId).emit("codeExecutionStarted");

  if (!(await roomManager.roomExists(roomId))) {
    socket.emit("codeResponse", {
      run: { output: "Error: Room does not exist." }
    });
    roomManager.setExecuting(roomId, false);
    io.to(roomId).emit("codeExecutionEnded");
    return;
  }

  try {
    const { language: jdoodleLang, versionIndex } = getJDoodleParams(language);

    const payload = {
      clientId: JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script: code,
      stdin: codeinput || "",
      language: jdoodleLang,
      versionIndex: versionIndex,
    };

    const response = await axios.post(JDOODLE_API_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // JDoodle returns: { output, statusCode, memory, cpuTime }
    const output = response.data.output;
    await roomManager.setOutput(roomId, output);
    
    // Emit in a format compatible with your frontend (expects { run: { output } })
    io.to(roomId).emit("codeResponse", { run: { output } });
    
  } catch (error) {
    console.error("JDoodle execution error:", error.response?.data || error.message);
    io.to(roomId).emit("codeResponse", {
      run: { output: "Error executing code: " + (error.response?.data?.error || "Unknown error") }
    });
  } finally {
    roomManager.setExecuting(roomId, false);
    io.to(roomId).emit("codeExecutionEnded");
  }
});

  socket.on("disconnect", async () => {
    console.log("User disconnected", socket.id);
    await handleLeave();
  });

  async function handleLeave() {
    if (currentRoom && currentUser) {
      await roomManager.removeUser(currentRoom, currentUser);
      const users = await roomManager.getUsers(currentRoom);
      io.to(currentRoom).emit("userLeft", users);
      socket.leave(currentRoom);
      console.log(`User ${currentUser} left room ${currentRoom}`);
      currentRoom = null;
      currentUser = null;
    }
  }
}