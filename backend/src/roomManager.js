import { Room } from './db.js';

// In-memory execution locks
const executingRooms = new Set();

export const roomManager = {
  // Create a new room (if not exists) – fixed deprecation warning
  async createRoom(roomId) {
    const room = await Room.findOneAndUpdate(
      { roomId },
      {
        $setOnInsert: {
          roomId,
          users: [],
          code: "",
          language: "javascript",
          output: "",
          input: "",
          executing: false
        }
      },
      { upsert: true, returnDocument: 'after' } // replaces new: true
    );
    return room;
  },

  async getRoom(roomId) {
    return Room.findOne({ roomId });
  },

  async roomExists(roomId) {
    const count = await Room.countDocuments({ roomId });
    return count > 0;
  },

  // Delete room if empty (no users)
  async deleteRoomIfEmpty(roomId) {
    const room = await Room.findOne({ roomId });
    if (room && room.users.length === 0) {
      await Room.deleteOne({ roomId });
      return true;
    }
    return false;
  },

  // ✅ FIXED: Atomic addUser – no more conflict error
  async addUser(roomId, username) {
    const result = await Room.updateOne(
      { roomId },
      {
        $setOnInsert: {
          roomId,
          code: "",
          language: "javascript",
          output: "",
          input: "",
          executing: false
          // ❌ Do NOT include 'users' here – $addToSet will create it if missing
        },
        $addToSet: { users: username } // creates array if needed, adds only if not present
      },
      { upsert: true }
    );

    // User was added if either:
    // - an existing document was modified (modifiedCount > 0) OR
    // - a new document was inserted (upsertedCount > 0)
    const added = result.modifiedCount > 0 || result.upsertedCount > 0;
    return added;
  },

  async removeUser(roomId, username) {
    await Room.updateOne(
      { roomId },
      { $pull: { users: username } }
    );
    await this.deleteRoomIfEmpty(roomId);
  },

  async userExists(roomId, username) {
    const count = await Room.countDocuments({ roomId, users: username });
    return count > 0;
  },

  async getUsers(roomId) {
    const room = await Room.findOne({ roomId });
    return room ? room.users : [];
  },

  async setCode(roomId, code) {
    await Room.updateOne({ roomId }, { code });
  },

  async setInput(roomId, input) {
    await Room.updateOne({ roomId }, { input });
  },

  async setLanguage(roomId, language) {
    await Room.updateOne({ roomId }, { language });
  },

  async setOutput(roomId, output) {
    await Room.updateOne({ roomId }, { output });
  },

  async getRoomData(roomId) {
    const room = await Room.findOne({ roomId });
    if (!room) return null;
    return {
      code: room.code,
      input: room.input,
      language: room.language,
      output: room.output,
      users: room.users,
    };
  },

  // Execution lock (in-memory for speed)
  isExecuting(roomId) {
    return executingRooms.has(roomId);
  },

  setExecuting(roomId, value) {
    if (value) {
      executingRooms.add(roomId);
    } else {
      executingRooms.delete(roomId);
    }
  },

  // Stats
  async getActiveRoomsCount() {
    return Room.countDocuments({ users: { $ne: [] } }); // rooms with at least one user
  },
};