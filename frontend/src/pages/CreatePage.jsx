
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ensureSocketConnected, getSocket } from "../socket";

function CreatePage() {
  const navigate = useNavigate();
  const socket = useMemo(() => getSocket(), []);

  const [username, setUsername] = useState(() => localStorage.getItem("cc_username") ?? "");
  const [creating, setCreating] = useState(false);
  const roomCreatedTimeoutRef = useRef(null);

  const createRoom = async () => {
    if (!username) return;
    setCreating(true);
    localStorage.setItem("cc_username", username);

    try {
      await ensureSocketConnected(socket, 4000);

      const onRoomCreated = (roomId) => {
        if (roomCreatedTimeoutRef.current) clearTimeout(roomCreatedTimeoutRef.current);
        socket.off("roomCreated", onRoomCreated);

        if (!roomId) {
          toast.error("Failed to create room.");
          setCreating(false);
          return;
        }

        navigate(`/room/${roomId}`);
      };

      socket.on("roomCreated", onRoomCreated);
      socket.emit("createRoom");

      roomCreatedTimeoutRef.current = setTimeout(() => {
        socket.off("roomCreated", onRoomCreated);
        toast.error("server is not responding. Please try again.");
        setCreating(false);
      }, 5000);
    } catch (err) {
      console.error(err);
      toast.error("server connection failed. Please start server and try again.");
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center border-2 border-gray-600 p-4 md:p-6 rounded-lg bg-gray-900 max-w-sm md:max-w-md w-full gap-4">
        <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Create a Room</h1>
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
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full mt-4">
          <button
            onClick={createRoom}
            className="bg-green-600 text-white p-3 md:p-2 rounded-lg flex-grow hover:bg-green-700 transition-colors font-medium disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={!username || creating}
          >
            {creating ? "Creating..." : "Create Room"}
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
  );
}

export default CreatePage;