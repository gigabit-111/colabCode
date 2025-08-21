import React, { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import AppSideBar from './components/AppSideBar';
import { IoMenu } from 'react-icons/io5';

const socket = io("http://localhost:5000");

function App() {
  const [joined, setJoined] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [openSideBar, setOpenSideBar] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState('');
  const typingTimeoutRef = useRef(null);
  const [version] = useState('*');
  const [output, setOutput] = useState('');
  const [outputLoading, setOutputLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    socket.on("userJoined", (userList) => {
      setUsers(userList);
    });

    socket.on("userLeft", (userList) => {
      setUsers(userList);
    });

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (username) => {
      setTyping(username === currentUser ? 'Me' : username);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTyping('');
      }, 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });

    socket.on("codeResponse", (response) => {
      setOutput(response.run.output);
      setOutputLoading(false);
      setIsExecuting(false);
    });

    socket.on("codeExecutionStarted", () => {
      setIsExecuting(true);
    });

    socket.on("codeExecutionEnded", () => {
      setIsExecuting(false);
      setOutputLoading(false);
    });

    socket.on("codeExecutionBusy", ({ message }) => {
      alert(message);
      setOutputLoading(false);
      setIsExecuting(false);
    });

    socket.on("codeOutput", (latestOutput) => {
      setOutput(latestOutput);
    });

    return () => {
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
      socket.off("codeExecutionStarted");
      socket.off("codeExecutionEnded");
      socket.off("codeExecutionBusy");
      socket.off("codeOutput");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [currentUser]);

  useEffect(() => {
    const savedRoom = localStorage.getItem('currentRoom');
    const savedUser = localStorage.getItem('currentUser');
    if (savedRoom && savedUser) {
      HandleJoinRoom(savedRoom, savedUser);
    }
  }, []);

  const HandleJoinRoom = (roomId, username) => {
    if (roomId && username) {
      socket.emit("join", { roomId, username });
      setCurrentRoom(roomId);
      setCurrentUser(username);
      setJoined(true);
      localStorage.setItem('currentRoom', roomId);
      localStorage.setItem('currentUser', username);
    }
  };

  const handleEditorChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId: currentRoom, code: newCode });
    socket.emit("userTyping", { roomId: currentRoom, username: currentUser });
  };
  const handleUserLeft = () => {
    socket.emit("leaveRoom");
    localStorage.removeItem('currentRoom');
    localStorage.removeItem('currentUser');
    setJoined(false);
    setCurrentRoom('');
    setCurrentUser('');
    setLanguage('javascript');
    setCode('');
    setUsers([]);
    setOutput('');
  };
  const copyRoomId = () => {
    navigator.clipboard.writeText(currentRoom);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setOutput(''); // clear output on language change
    socket.emit("languageChange", { roomId: currentRoom, language: newLanguage });
  };

  const handleRunCode = () => {
    if (!isExecuting) {
      setOutputLoading(true);
      socket.emit("compileCode", { code, roomId: currentRoom, language, version });
    }
  };

  if (!joined) {
    return (
      <div className="h-screen bg-gray-800 text-white flex items-center justify-center">
        <div className="flex flex-col items-center border-2 p-4 rounded bg-gray-900">
          <h1 className="text-2xl font-bold mb-4">Join a Room</h1>
          <div className="p-2 flex items-center gap-2">
            <label htmlFor="roomId">Room ID:</label>
            <input
              className="border border-gray-300 p-2 rounded"
              type="text"
              value={currentRoom}
              onChange={(e) => setCurrentRoom(e.target.value)}
              placeholder="Room ID"
            />
          </div>
          <div className="p-2 flex items-center gap-2">
            <label htmlFor="username">Username:</label>
            <input
              className="border border-gray-300 p-2 rounded"
              type="text"
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              placeholder="Username"
            />
          </div>
          <button
            className="bg-blue-500 text-white p-2 rounded mt-4"
            onClick={() => HandleJoinRoom(currentRoom, currentUser)}
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={20} maxSize={25} className={openSideBar ? "" : "hidden"}>
          <AppSideBar
            currentUser={currentUser}
            typing={typing}
            handleLanguageChange={handleLanguageChange}
            copyRoomId={copyRoomId}
            handleUserLeft={handleUserLeft}
            currentRoom={currentRoom}
            language={language}
            setLanguage={setLanguage}
            users={users}
          />
        </Panel>
        <PanelResizeHandle
          style={{ width: "5px", background: "#374151", cursor: "ew-resize" }}
        />
        <Panel minSize={30}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={70} minSize={30}>
              <div className="p-4 bg-gray-900 text-white h-full flex flex-col rounded-lg">
                <div className="flex justify-between items-center border-2 border-gray-700 p-2">
                  <h2 className="text-xl font-bold">CodeColab</h2>
                  <IoMenu
                    size={24}
                    className="cursor-pointer"
                    onClick={() => setOpenSideBar(!openSideBar)}
                  />
                </div>
                <div className="flex-1 border-2 border-gray-700 rounded mt-2">
                  <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 16,
                      lineHeight: 22,
                    }}
                    className="border-2 border-gray-700 p-4 bg-[#1e1e1e]"
                  />
                </div>
              </div>
            </Panel>
            <PanelResizeHandle
              style={{ height: "5px", background: "#374151", cursor: "ns-resize" }}
            />
            <Panel minSize={10}>
              <div className="p-4 bg-gray-900 border-2 border-gray-700 rounded text-white h-full flex flex-col">
                <button
                  onClick={handleRunCode}
                  disabled={isExecuting || outputLoading}
                  className={`p-2 rounded mb-2 justify-start w-[200px] ${isExecuting || outputLoading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                    } text-white`}
                >
                  {isExecuting || outputLoading ? "Running..." : "Execute"}
                </button>
                <textarea
                  className="bg-gray-800 p-2 rounded flex-1 border-2 border-gray-700 w-full resize-none"
                  placeholder="Output will appear here......"
                  value={output}
                  readOnly
                />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
