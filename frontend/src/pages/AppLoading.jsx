import { useState, useEffect, useRef } from "react";

function App() {
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const loadingSteps = [
    "Finding space to create room...",
    "Configuring room...",
    "Almost ready..."
  ];
  const loadingIntervalRef = useRef(null);

  const startCreatingRoom = () => {
    if (!currentUser) return;
    setCreatingRoom(true);
    setLoadingMessage(loadingSteps[0]);

    let step = 1;
    loadingIntervalRef.current = setInterval(() => {
      if (step < loadingSteps.length) {
        setLoadingMessage(loadingSteps[step]);
        step++;
      }
    }, 2000); // Change message every 2 seconds

    // Emit createRoom event to backend
    socket.emit("createRoom");

    // You may add a timeout fallback if room creation takes too long (optional)
  };

  // Listen to 'roomCreated' event from socket and stop loading
  useEffect(() => {
    const onRoomCreated = (newRoomId) => {
      clearInterval(loadingIntervalRef.current);
      setLoadingMessage("Room created!");
      setCreatingRoom(false);
      // Proceed with join or whatever logic
      HandleJoinRoom(newRoomId, currentUser);
    };

    socket.on("roomCreated", onRoomCreated);
    return () => {
      socket.off("roomCreated", onRoomCreated);
      clearInterval(loadingIntervalRef.current);
    };
  }, [currentUser]);

  return (
    <button
      onClick={startCreatingRoom}
      className={`bg-green-600 text-white p-3 md:p-2 rounded-lg flex-grow hover:bg-green-700 transition-colors font-medium disabled:bg-gray-600 disabled:cursor-not-allowed ${
        creatingRoom ? "animate-pulse" : ""
      }`}
      disabled={!currentUser || creatingRoom}
    >
      {creatingRoom ? loadingMessage : "Create Room"}
    </button>
  );
}
