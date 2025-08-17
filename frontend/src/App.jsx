import React, { useState } from 'react'
import io from 'socket.io-client';
import AppSideBar from './components/AppSideBar';
import { IoMenu } from "react-icons/io5";

const socket = io("http://localhost:5000");

function App() {
  const [joined, setJoined] = useState(false); // Show join screen initially
  const [currentRoom, setCurrentRoom] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [openSideBar, setOpenSideBar] = useState(true);

  const HandleJoinRoom = async (roomId, username) => {
    if (roomId && username) {
      socket.emit("join", { roomId, username });
      setCurrentRoom(roomId);
      setCurrentUser(username);
      setJoined(true);
    }
  };

  // Join Room UI
  if (!joined) {
    return (
      <div className="h-screen bg-gray-800 text-white">
        <div className="flex flex-col items-center h-full justify-center mx-auto">
          <h1 className="text-2xl font-bold mb-4">Join a Room</h1>
          <input
            className="border border-gray-300 p-2 rounded mb-4"
            type="text"
            value={currentRoom}
            onChange={(e) => setCurrentRoom(e.target.value)}
            placeholder="Room ID"
          />
          <input
            className="border border-gray-300 p-2 rounded mb-4"
            type="text"
            value={currentUser}
            onChange={(e) => setCurrentUser(e.target.value)}
            placeholder="Username"
          />
          <button
            onClick={() => HandleJoinRoom(currentRoom, currentUser)}
            className="bg-blue-500 text-white p-2 rounded w-fit"
          >
            Join Room
          </button>
        </div>
      </div>
    )
  }

  // User has joined
  return (
    <div className="flex relative">
      {/* Sidebar w/ animation */}
      <div
        className={`
          fixed top-0 left-0 h-screen bg-gray-800 text-white p-4 overflow-auto
          transition-transform duration-500 ease-in-out
          ${openSideBar ? 'translate-x-0 ' : '-translate-x-full w-0'}
        `}
        style={{ zIndex: 50 }}
      >
        <AppSideBar currentRoom={currentRoom} currentUser={currentUser} />
      </div>

      {/* Optional: overlay */}
      {openSideBar && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-transparent transition-opacity duration-500 pointer-events-auto"
          onClick={() => setOpenSideBar(false)}
          style={{ zIndex: 40 }}
        />
      )}


      {/* Editor area */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center border-2 p-2">
          <div className="flex items-center justify-center h-full">
            <h2 className="text-xl font-bold">Code Editor</h2>
          </div>
          <IoMenu
            size={24}
            className="cursor-pointer"
            onClick={() => setOpenSideBar(!openSideBar)}
          />
        </div>
        {/* Code editor component goes here */}
      </div>
    </div>
  );
}

export default App;
