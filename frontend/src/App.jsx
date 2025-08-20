import React, { useRef, useState } from 'react'
import io from 'socket.io-client';
import AppSideBar from './components/AppSideBar';
import { IoMenu } from "react-icons/io5";
import Editor from '@monaco-editor/react';
import { useEffect } from 'react';
const socket = io("http://localhost:5000");
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

function App() {
  const [joined, setJoined] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [openSideBar, setOpenSideBar] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState('');
  const typingTimeoutRef = useRef(null);
  const [version, setVersion] = useState('*');
  const [output, setOutput] = useState('');
  const [outputLoading, setOutputLoading] = useState(false);
  useEffect(() => {
    socket.on("userJoined", (username) => {
      setUsers(username);
    });

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (username) => {
      setTyping(username);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTyping('');
        typingTimeoutRef.current = null;
      }, 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });

    socket.on("coderesponse", (response) => {
      setOutput(response.run.output);
      setOutputLoading(false);
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("coderesponse");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useState(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const HandleJoinRoom = async (roomId, username) => {
    if (roomId && username) {
      socket.emit("join", { roomId, username });
      setCurrentRoom(roomId);
      setCurrentUser(username);
      setJoined(true);
    }
  };
  // Handle socket events
  const handleEditorChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId: currentRoom, code: newCode });
    socket.emit("userTyping", { roomId: currentRoom, username: currentUser });
  };

  // Handle user left event
  const handleUserLeft = () => {
    socket.emit("leaveRoom", { roomId: currentRoom, username: currentUser });
    setJoined(false);
    setCurrentRoom('');
    setCurrentUser('');
    setLanguage('javascript');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(currentRoom);
    //setCopySuccess("Copied!");
    //setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId: currentRoom, language: newLanguage });
  };

  const handleRunCode = () => {
    setOutputLoading(true);
    socket.emit("compilecode", { code, roomId: currentRoom, language, version });
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
    <div className="h-screen w-screen overflow-hidden">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={15} maxSize={25} className={openSideBar ? "" : "hidden"}>
          <AppSideBar
            typing={typing}
            handleLanguageChange={handleLanguageChange}
            copyRoomId={copyRoomId}
            handleUserLeft={handleUserLeft}
            currentRoom={currentRoom}
            currentUser={currentUser}
            language={language}
            setLanguage={setLanguage}
            users={users}
          />
        </Panel>
        <PanelResizeHandle style={{ width: "5px", background: "#374151", cursor: "ew-resize" }} />
        <Panel minSize={30} >
          <PanelGroup direction="vertical">
            <Panel defaultSize={70} minSize={30}>
              <div className="p-4 bg-gray-900 text-white h-full">
                {/* Editor header and top bar */}
                <div className="flex justify-between items-center border-2 border-gray-700 p-2">
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold">Code Editor</h2>
                  </div>
                  <IoMenu
                    size={24}
                    className="cursor-pointer"
                    onClick={() => setOpenSideBar(!openSideBar)}
                  />
                </div>
                {/* Resizable code editor */}
                <div className="p-4 mb-2 border-2 border-gray-700 h-[calc(100vh-20vh)]">
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
            <PanelResizeHandle style={{ height: "5px", background: "#374151", cursor: "ns-resize" }} />
            <Panel minSize={10}>
              {/* Output Area */}
              <div className="p-4 bg-gray-900 border-2 border-gray-700 text-white h-full">
                <button
                  onClick={handleRunCode}
                  disabled={outputLoading}
                  className={`p-2 mb-2 ${outputLoading ? "bg-gray-600 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"} text-white`}
                >
                  {outputLoading ? "Running..." : "Execute"}
                </button>
                <textarea
                  className="bg-gray-800 p-2 h-[80%] border-2 border-gray-700 w-full"
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
