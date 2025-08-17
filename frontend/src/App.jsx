import React, { useState } from 'react'
import io from 'socket.io-client';
import AppSideBar from './components/AppSideBar';
import { IoMenu } from "react-icons/io5";
import Editor from '@monaco-editor/react';
const socket = io("http://localhost:5000");

function App() {
  const [joined, setJoined] = useState(false); // Show join screen initially
  const [currentRoom, setCurrentRoom] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [openSideBar, setOpenSideBar] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const HandleJoinRoom = async (roomId, username) => {
    if (roomId && username) {
      socket.emit("join", { roomId, username });
      setCurrentRoom(roomId);
      setCurrentUser(username);
      setJoined(true);
    }
  };
  // Handle socket events
  const handleEditorChange = () => {
    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });
  };

  // Join Room UI
  if (!joined) {
    return (
      <div className="h-screen bg-gray-800 text-white">
        <div className=" flex items-center justify-center h-full w-full">
          <div className="flex flex-col items-center h-fit justify-center mx-auto border-2 p-4 rounded">
            <h1 className="text-2xl font-bold mb-4">Join a Room</h1>
            <div className='p-2 flex items-center gap-2'>
              <label htmlFor="roomId" className="mb-2">Room ID:</label>
              <input
                className="border border-gray-300 p-2 rounded mb-4"
                type="text"
                value={currentRoom}
                onChange={(e) => setCurrentRoom(e.target.value)}
                placeholder="Room ID"
              />

            </div>
            <div className='p-2 flex items-center gap-2'>
              <label htmlFor="username" className="mb-2">Username: </label>
              <input
                className="border border-gray-300 p-2 rounded mb-4"
                type="text"
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                placeholder="Username"
              />
            </div>
            <button
              onClick={() => HandleJoinRoom(currentRoom, currentUser)}
              className="bg-blue-500 text-white p-2 px-6 rounded w-fit"
            >
              Join Room
            </button>
          </div>
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
          transition-transform duration-300 ease-in-out
          ${openSideBar ? 'translate-x-0 ' : '-translate-x-full w-0'}
        `}
        style={{ zIndex: 50 }}
      >
        <AppSideBar currentRoom={currentRoom} currentUser={currentUser} language={language} setLanguage={setLanguage} />
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
      <div className="flex-1 p-4 w-screen bg-gray-900 text-white border-gray-700">
        <div className="flex justify-between items-center border-2 border-gray-700 p-2 h-[6vh]">
          <div className="flex items-center justify-center h-full">
            <h2 className="text-xl font-bold">Code Editor</h2>
          </div>
          <IoMenu
            size={24}
            className="cursor-pointer"
            onClick={() => setOpenSideBar(!openSideBar)}
          />
        </div>
        <div className='p-4 mt-2 mb-2 border-2 border-gray-700 rounded h-[calc(100vh-12vh)]'>
          <Editor
            height={"100%"}
            language={language}
            value={code}
            onChange={handleEditorChange}
            theme='vs-dark'
            className='border-2 rounded border-gray-700 p-4 bg-[#1e1e1e]'
          />
        </div>

      </div>
    </div>
  );
}

export default App;
