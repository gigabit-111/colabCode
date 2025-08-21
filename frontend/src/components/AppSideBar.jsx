
function AppSideBar({
  currentUser,
  language,
  users,
  handleUserLeft,
  copyRoomId,
  typing,
  handleLanguageChange,
}) {
  // Filter out current user from users list
  const filteredUsers = users.filter((user) => user !== currentUser);

  return (
    <div className="bg-gray-900 text-white p-4 flex flex-col h-full w-full min-w-[120px] max-w-[400px] overflow-y-auto rounded">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <p className="text-lg font-bold underline">Room Info:</p>
        <div>
          <button
            onClick={copyRoomId}
            className="bg-blue-500 px-2 py-1 rounded hover:bg-blue-600"
          >
            Copy ID
          </button>
        </div>
        <p className="text-gray-300">Your ID: {currentUser}</p>
      </div>

      <div className="mb-2 flex-1 overflow-auto">
        <span className="font-semibold">Users:</span>
        <ul className="list-disc list-inside gap-1">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, i) => <li key={i}>{user}</li>)
          ) : (
            <li>No other users</li>
          )}
        </ul>
      </div>

      <div className="mb-2">
        <span className="font-semibold">Typing:</span>{' '}
        {console.log(typing)}
        {typing ? (typing === currentUser ? 'You are typing...' : `${typing} is typing...`) : null}
      </div>


      <div className="mb-4">
        <p>Select Language:</p>
        <select
          value={language}
          onChange={handleLanguageChange}
          className="text-white bg-gray-800 p-2 rounded w-full"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <button
        onClick={handleUserLeft}
        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
      >
        Leave Room
      </button>
    </div>
  );
}

export default AppSideBar;
