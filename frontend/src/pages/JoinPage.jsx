// JoinPage.jsx
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getSocket } from "../socket";

function JoinPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useMemo(() => getSocket(), []);
  const [searchParams] = useSearchParams();

  const initialRoomFromQuery = searchParams.get("roomId") ?? searchParams.get("roomid") ?? "";
  const initialRoomFromState = location.state?.roomId ?? "";

  const [username, setUsername] = useState(() => localStorage.getItem("cc_username") ?? "");
  const [roomId, setRoomId] = useState(() => initialRoomFromState || initialRoomFromQuery);
  const [joining, setJoining] = useState(false);

  const joinRoom = async () => {
    if (joining) return;
    if (!username || !roomId) return;
    setJoining(true);
    localStorage.setItem("cc_username", username);

    try {
      const baseUrl = (import.meta.env.VITE_BACKEND_URL || "/").replace(/\/?$/, "/");

      const resp = await fetch(
        `${baseUrl}room-exists?roomId=${encodeURIComponent(roomId)}`
      );
      const { exists: roomExists } = await resp.json();
      if (!roomExists) {
        toast.error("Room does not exist");
        setJoining(false);
        return;
      }

      const resp2 = await fetch(
        `${baseUrl}user-exists?roomId=${encodeURIComponent(roomId)}&username=${encodeURIComponent(username)}`
      );
      const { exists } = await resp2.json();
      if (exists) {
        toast.error("Username is already taken in that room");
        setJoining(false);
        return;
      }

      if (!socket.connected) socket.connect();
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error(err);
      toast.error("Unable to verify room or username");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col">
      {/* Main content */}
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center border-2 border-gray-600 p-4 md:p-6 rounded-lg bg-gray-900 max-w-sm md:max-w-md w-full gap-4">
          <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Join a Room</h1>
          <div className="w-full flex flex-col gap-3">
            <label htmlFor="username" className="block mb-1 text-sm md:text-base font-medium">
              Username:
            </label>
            <input
              id="username"
              name="username"
              className="border border-gray-300 p-3 md:p-2 rounded-lg w-full text-white text-base"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
            <label htmlFor="roomId" className="block mb-1 text-sm md:text-base font-medium">
              Room ID:
            </label>
            <input
              name="roomId"
              id="roomId"
              className="border border-gray-300 p-3 md:p-2 rounded-lg w-full text-white text-base"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full mt-4">
            <button
              onClick={joinRoom}
              className="bg-blue-500 text-white p-3 md:p-2 rounded-lg flex-grow hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-600 disabled:cursor-not-allowed"
              disabled={!username || !roomId || joining}
            >
              {joining ? "Joining..." : "Join Room"}
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-600 text-white p-3 md:p-2 rounded-lg flex-grow hover:bg-gray-700 transition-colors font-medium"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-400">
          <p>© 2025 ColabCode. All rights reserved.</p>
          <p>
            Developed by{" "}
            <a
              href="https://www.linkedin.com/in/anuja-mishra-1193a2245"
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anuja Mishra
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default JoinPage;