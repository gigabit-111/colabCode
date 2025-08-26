import UserListComponent from "./UserListComponent";
import toast from "react-hot-toast";
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
  const handleFullNameView = (user) => {
    toast(`Full name: ${user}`);
  };

  return (
    <div className="bg-gray-900 text-white p-4 flex flex-col h-full w-full overflow-hidden rounded">
      <div className="flex flex-col gap-4 mb-4 border border-gray-600 rounded-lg bg-gray-900 p-4 shadow-md w-full">
        <p className="text-xl font-semibold text-white underline">Room Info:</p>

        <div className="flex flex-col max-sm:flex-row max-sm:justify-between max-sm:items-center gap-2">
          <p className="text-sm text-gray-300">Your ID: <span className="font-mono">{currentUser}</span></p>
          <button
            onClick={copyRoomId}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Copy Room-ID
          </button>
        </div>
      </div>

      <div className="mb-2 flex-1 overflow-auto">
        <span className="font-semibold">Users:</span>
        {
          filteredUsers.length === 0? (<p className="text-gray-400 flex items-center justify-center h-[80%] overflow-hidden">No other users</p>):(
            <div className="mt-2 w-full flex gap-3">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, i) => <UserListComponent key={i} index={i} user={user} handleFullNameView={handleFullNameView} />)
              ) : (
                <></>
              )}
            </div>
          )}
      </div>

      <div className="mb-2">
        {typing && (
          <span className="font-semibold">Typing: {typing}</span>
        )}
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
