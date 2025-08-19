// components/AppSideBar.js
import React, { useEffect } from 'react';

function AppSideBar({ currentRoom, language, users, handleUserLeft, copyRoomId, typing, handleLanguageChange }) {
  useEffect(() => {
    // You can track typing or users here if needed for debug
  }, [typing, users,language,handleUserLeft]);

  return (
    <div className="w-64 bg-gray-900 text-white p-4 rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-lg font-bold underline">Room Info:</p>
        <button onClick={copyRoomId} className="bg-blue-500 rounded px-2 py-1 hover:bg-blue-600">
          Copy ID
        </button>
      </div>

      <div className="mb-2">
        <span className="font-semibold">Room ID:</span> {currentRoom}
      </div>

      <div className="mb-2 flex-1 overflow-auto">
        <span className="font-semibold">Users:</span>
        <ul className="list-disc list-inside">
          {users.length > 0 ? (
            users.map((user, i) => <li key={i}>{user}</li>)
          ) : (
            <li>No users</li>
          )}
        </ul>
      </div>

      <div className="mb-2">
        <span className="font-semibold">Typing:</span> {typing}
      </div>

      <div className="mb-4">
        <p>Select Language:</p>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e)}
          className="text-white bg-gray-800 p-2 rounded w-full"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <button
        onClick={() => handleUserLeft()}
        className="bg-red-500 hover:bg-red-600 text-white rounded p-2"
      >
        Leave Room
      </button>
    </div>
  );
}

export default AppSideBar;
