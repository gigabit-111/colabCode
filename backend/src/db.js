import mongoose from 'mongoose';
import { MONGODB_URI } from './config.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Room Schema
const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  users: [{ type: String }], // array of usernames
  code: { type: String, default: "" },
  language: { type: String, default: "javascript" },
  output: { type: String, default: "" },
  input: { type: String, default: "" },
  executing: { type: Boolean, default: false }, // execution lock
  createdAt: { type: Date, default: Date.now, expires: '7d' } // auto-delete after 7 days
}, {
  timestamps: true // adds updatedAt automatically
});

export const Room = mongoose.model('Room', roomSchema);