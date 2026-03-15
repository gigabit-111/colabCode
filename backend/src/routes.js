import express from 'express';
import { roomManager } from './roomManager.js';

const router = express.Router();

router.get("/user-exists", async (req, res) => {
  const { username, roomId } = req.query;
  const exists = await roomManager.userExists(roomId, username);
  res.json({ exists });
});

// Alias for backward compatibility
router.get("/user-exit", async (req, res) => {
  const { username, roomId } = req.query;
  const exists = await roomManager.userExists(roomId, username);
  res.json({ exists });
});

router.get("/room-exists", async (req, res) => {
  const { roomId } = req.query;
  const exists = await roomManager.roomExists(roomId);
  res.json({ exists });
});

router.get("/room-info", async (req, res) => {
  const { roomId } = req.query;
  if (!(await roomManager.roomExists(roomId))) {
    return res.status(404).json({ error: "Room not found" });
  }
  const data = await roomManager.getRoomData(roomId);
  res.json({
    roomId,
    userCount: data.users.length,
    language: data.language,
    users: data.users,
  });
});

router.get("/health", async (req, res) => {
  res.json({
    status: "OK",
    activeRooms: await roomManager.getActiveRoomsCount(),
    timestamp: new Date().toISOString(),
  });
});

export default router;