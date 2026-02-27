import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (socket) return socket;

  const url = import.meta.env.VITE_BACKEND_URL;
  if (!url) {
    throw new Error("Missing VITE_BACKEND_URL (frontend .env).");
  }

  socket = io(url, {
    transports: ["websocket"],
    autoConnect: false,
    withCredentials: false,
    reconnection: true,
    reconnectionAttempts: 3,
    timeout: 4000,
  });

  return socket;
}

export function ensureSocketConnected(s, timeoutMs = 4000) {
  if (s.connected) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let done = false;

    const cleanup = () => {
      s.off("connect", onConnect);
      s.off("connect_error", onError);
      if (timer) clearTimeout(timer);
    };

    const finish = (err) => {
      if (done) return;
      done = true;
      cleanup();
      if (err) reject(err);
      else resolve();
    };

    const onConnect = () => finish();
    const onError = (err) => finish(err ?? new Error("Socket connection failed"));

    const timer = setTimeout(() => {
      finish(new Error("Socket connection timeout"));
    }, timeoutMs);

    s.once("connect", onConnect);
    s.once("connect_error", onError);
    s.connect();
  });
}

