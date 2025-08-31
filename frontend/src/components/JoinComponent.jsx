import React from 'react'

function JoinComponent({ currentUser, setCurrentUser, currentRoom, setCurrentRoom, HandleJoinRoom, setMode }) {
    return (
        <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center px-4 py-8">
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
                        value={currentUser}
                        onChange={(e) => setCurrentUser(e.target.value)}
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
                        value={currentRoom}
                        onChange={(e) => setCurrentRoom(e.target.value)}
                        placeholder="Enter Room ID"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full mt-4">
                    <button
                        onClick={() => HandleJoinRoom(currentRoom, currentUser)}
                        className="bg-blue-500 text-white p-3 md:p-2 rounded-lg flex-grow hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={!currentUser || !currentRoom}
                    >
                        Join Room
                    </button>
                    <button
                        onClick={() => setMode("initial")}
                        className="bg-gray-600 text-white p-3 md:p-2 rounded-lg flex-grow hover:bg-gray-700 transition-colors font-medium"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    )
}

export default JoinComponent