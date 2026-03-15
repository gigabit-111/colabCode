import dotenv from 'dotenv';
dotenv.config();

let rawFrontendUrl = process.env.FRONTEND_URL || "";
if (rawFrontendUrl) {
  if (!/^https?:\/\//i.test(rawFrontendUrl)) {
    rawFrontendUrl = `http://${rawFrontendUrl}`;
  }
  rawFrontendUrl = rawFrontendUrl.replace(/\/$/, "");
}

export const FRONTEND_URL = rawFrontendUrl;
export const PORT = process.env.PORT || 8080;
export const RELOAD_INTERVAL = 30000;
export const MONGODB_URI = process.env.MONGODB_URI;

// JDoodle credentials
export const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
export const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;
export const JDOODLE_API_URL = process.env.JDOODLE_API_URL || 'https://api.jdoodle.com/v1/execute';