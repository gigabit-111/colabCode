
import { useRef, useState, useEffect } from "react"
import io from "socket.io-client"
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels"
import Editor from "@monaco-editor/react"
import AppSideBar from "./components/AppSideBar"
import { IoMenu, IoClose } from "react-icons/io5"

const backendUrl = import.meta.env.VITE_FRONTEND_URL;
const socket = io(backendUrl, {
  withCredentials: true,
  transports: ["websocket"],
});

function App() {
  const [mode, setMode] = useState("initial")
  const [joined, setJoined] = useState(false)
  const [currentRoom, setCurrentRoom] = useState("")
  const [currentUser, setCurrentUser] = useState("")
  const [openSideBar, setOpenSideBar] = useState(false)
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState("")
  const [users, setUsers] = useState([])
  const [typing, setTyping] = useState(null)
  const typingTimeoutRef = useRef(null)
  const [version] = useState("*")
  const [output, setOutput] = useState("")
  const [outputLoading, setOutputLoading] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showOutput, setShowOutput] = useState(false)
  const [codeInput, setCodeInput] = useState("")

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setShowOutput(false) // Reset output view on desktop
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    socket.on("userJoined", (userList) => {
      setUsers(userList)
    })

    socket.on("userLeft", (userList) => {
      setUsers(userList)
    })

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode)
    })

    socket.on("userTyping", (username) => {
      setTyping(username === currentUser ? "Me" : username)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(null)
      }, 2000)
    })

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage)
    })

    socket.on("codeResponse", (response) => {
      setOutput(response.run.output)
      setOutputLoading(false)
      setIsExecuting(false)
    })

    socket.on("codeExecutionStarted", () => {
      setIsExecuting(true)
    })

    socket.on("codeExecutionEnded", () => {
      setIsExecuting(false)
      setOutputLoading(false)
    })

    socket.on("codeExecutionBusy", ({ message }) => {
      alert(message)
      setOutputLoading(false)
      setIsExecuting(false)
    })

    socket.on("codeOutput", (latestOutput) => {
      setOutput(latestOutput)
    })

    socket.on("roomCreated", (newRoomId) => {
      if (currentUser) {
        HandleJoinRoom(newRoomId, currentUser)
      } else {
        alert("Please enter a username before creating a room")
      }
    })

    return () => {
      socket.off("userJoined")
      socket.off("userLeft")
      socket.off("codeUpdate")
      socket.off("userTyping")
      socket.off("languageUpdate")
      socket.off("codeResponse")
      socket.off("codeExecutionStarted")
      socket.off("codeExecutionEnded")
      socket.off("codeExecutionBusy")
      socket.off("codeOutput")
      socket.off("roomCreated")
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [currentUser])

  useEffect(() => {
    const savedRoom = localStorage.getItem("currentRoom")
    const savedUser = localStorage.getItem("currentUser")
    if (savedRoom && savedUser) {
      HandleJoinRoom(savedRoom, savedUser)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      // Check if 'b' or 'B' is pressed AND ctrlKey is held
      if ((e.key === "b" || e.key === "B") && e.ctrlKey) {
        e.preventDefault() // prevent default browser action (e.g., bookmarks)
        setOpenSideBar((prev) => !prev)
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  const HandleJoinRoom = (roomId, username) => {
    if (roomId && username) {
      socket.emit("join", { roomId, username })
      setCurrentRoom(roomId)
      setCurrentUser(username)
      setJoined(true)
      localStorage.setItem("currentRoom", roomId)
      localStorage.setItem("currentUser", username)
    }
  }

  const createRoom = () => {
    socket.emit("createRoom")
  }

  const handleEditorChange = (newCode) => {
    setCode(newCode)
    socket.emit("codeChange", { roomId: currentRoom, code: newCode })
    socket.emit("userTyping", { roomId: currentRoom, username: currentUser })
  }

  const handleUserLeft = () => {
    socket.emit("leaveRoom")
    localStorage.removeItem("currentRoom")
    localStorage.removeItem("currentUser")
    setJoined(false)
    setCurrentRoom("")
    setCurrentUser("")
    setLanguage("javascript")
    setCode("")
    setUsers([])
    setOutput("")
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(currentRoom)
  }

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value
    setLanguage(newLanguage)
    setOutput("")
    socket.emit("languageChange", { roomId: currentRoom, language: newLanguage })
  }

  const handleRunCode = () => {
    if (!isExecuting) {
      setOutputLoading(true)
      socket.emit("compileCode", { code, roomId: currentRoom, language, version })
      if (isMobile) {
        setShowOutput(true)
      }
    }
  }

  if (!joined) {
    if (mode === "initial") {
      return (
        <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center px-4 py-8">
          <div className="max-w-xl text-center mb-8 md:mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">Welcome to CodeColab</h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Collaborate on code in real-time with your friends or team. Create rooms instantly or join an existing
              session to write, run, and share code seamlessly.
            </p>
          </div>

          <div className="flex flex-col items-center border-2 border-gray-600 p-4 md:p-6 rounded-lg bg-gray-900 max-w-sm md:max-w-md w-full gap-4 md:gap-6">
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Get Started</h2>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full">
              <button
                onClick={() => setMode("join")}
                className="bg-blue-500 text-white p-3 md:p-3 rounded-lg flex-grow hover:bg-blue-600 transition-colors font-medium"
              >
                Join Room
              </button>
              <button
                onClick={() => setMode("create")}
                className="bg-green-600 text-white p-3 md:p-3 rounded-lg flex-grow hover:bg-green-700 transition-colors font-medium"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (mode === "join") {
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

    if (mode === "create") {
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
                className="border border-gray-300 p-3 md:p-2 rounded-lg w-full text-white text-base"
                type="text"
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full mt-4">
              <button
                onClick={createRoom}
                className="bg-green-600 text-white p-3 md:p-2 rounded-lg flex-grow hover:bg-green-700 transition-colors font-medium disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={!currentUser}
              >
                Create Room
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
  }

  if (isMobile) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-gray-900 relative">
        {/* Mobile Sidebar Overlay */}
        {openSideBar && (
          <div className="absolute inset-0 z-50 flex">
            <div className="w-80 max-w-[85vw] bg-gray-900 border-r border-gray-700">
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
            </div>
            <div className="flex-1 bg-black bg-opacity-50" onClick={() => setOpenSideBar(false)} />
          </div>
        )}

        {/* Main Content */}
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center bg-gray-900 border-b border-gray-700 p-3">
            <h2 className="text-lg md:text-xl font-bold text-white">CodeColab</h2>
            <div className="flex items-center gap-2">
              {!showOutput && (
                <button
                  onClick={() => setShowOutput(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Output
                </button>
              )}
              <IoMenu size={24} className="cursor-pointer text-white" onClick={() => setOpenSideBar(!openSideBar)} />
            </div>
          </div>

          {/* Editor or Output */}
          <div className="flex-1 relative">
            {!showOutput ? (
              <div className="h-full bg-gray-900 text-white">
                <Editor
                  className=""
                  height="100%"
                  language={language}
                  value={code}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineHeight: 20,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            ) : (
              <div className="h-full bg-gray-900 text-white flex flex-col p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Input</h3>
                  <button onClick={() => setShowOutput(false)} className="text-gray-400 hover:text-white">
                    <IoClose size={24} />
                  </button>
                </div>
                <textarea
                  className="mb-3 bg-gray-800 p-3 rounded-lg flex-1 border border-gray-700 w-full resize-none text-sm"
                  placeholder="write your code input here..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                />
                <h3 className="text-lg font-semibold mb-2">Output</h3>
                <button
                  onClick={handleRunCode}
                  disabled={isExecuting || outputLoading}
                  className={`p-3 rounded-lg mb-3 w-full ${isExecuting || outputLoading ? "bg-gray-600 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
                    } text-white font-medium transition-colors`}
                >
                  {isExecuting || outputLoading ? "Running..." : "Execute code"}
                </button>
                <textarea
                  className="bg-gray-800 p-3 rounded-lg flex-1 border border-gray-700 w-full resize-none text-sm"
                  placeholder="Output will appear here......"
                  value={output}
                  readOnly
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 border-t border-gray-700 p-2">
          <p className="text-center text-xs text-gray-400">
            © 2025 CodeColab. Developed by{" "}
            <a
              href="https://www.linkedin.com/in/anuja-mishra-1193a2245"
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anuja Mishra
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <PanelGroup direction="horizontal">
        <Panel
          defaultSize={openSideBar ? 25 : 0}
          minSize={openSideBar ? 20 : 0}
          maxSize={35}
          className={openSideBar ? "" : "hidden"}
        >
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
        {openSideBar && <PanelResizeHandle style={{ width: "5px", background: "#374151", cursor: "ew-resize" }} />}
        <Panel minSize={30}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={70} minSize={30}>
              <div className="p-3 md:p-4 bg-gray-900 text-white h-full flex flex-col rounded-lg">
                <div className="flex justify-between items-center border-2 border-gray-700 p-2 md:p-3 rounded">
                  <h2 className="text-lg md:text-xl font-bold">CodeColab</h2>
                  <IoMenu
                    size={24}
                    className="cursor-pointer hover:text-gray-300 transition-colors"
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
                      minimap: { enabled: window.innerWidth > 1024 },
                      fontSize: window.innerWidth > 768 ? 16 : 14,
                      lineHeight: window.innerWidth > 768 ? 22 : 20,
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                    }}
                    className="border-2 border-gray-700 bg-[#1e1e1e]"
                  />
                </div>
              </div>
            </Panel>
            <PanelResizeHandle style={{ height: "5px", background: "#374151", cursor: "ns-resize" }} />
            <Panel minSize={15} defaultSize={30}>
              <div className="p-3 md:p-4 bg-gray-900 text-white h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-2">Input</h3>
                <textarea
                  className="mb-3 bg-gray-800 p-3 rounded-lg flex-1 border border-gray-700 w-full resize-none text-sm overflow-hidden"
                  placeholder="Write your code input here..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                />
                <div className="flex flex-row justify-between items-center gap-3 w-full">
                  <h3 className="text-lg font-semibold mb-2">Output: </h3>
                  <button
                    onClick={handleRunCode}
                    disabled={isExecuting || outputLoading}
                    className={`p-2 rounded-lg mb-2 w-32 ${isExecuting || outputLoading ? "bg-gray-600 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
                      } text-white font-medium transition-colors`}
                  >
                    {isExecuting || outputLoading ? "Running..." : "Execute code"}
                  </button>

                </div>

                <textarea
                  className="bg-gray-800 p-2 md:p-3 rounded-lg flex-1 border-2 border-gray-700 w-full resize-none text-sm md:text-base overflow-hidden"
                  placeholder="Output will appear here..."
                  value={output}
                  readOnly
                />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>

      {/* Footer */}
      <footer className="w-full border-t border-gray-700 bg-gray-900">
        <div className="p-2 md:p-4 text-white flex items-center justify-center">
          <p className="text-center text-xs md:text-sm text-gray-400">
            © 2025 CodeColab. All rights reserved. Developed by{" "}
            <a
              href="https://www.linkedin.com/in/anuja-mishra-1193a2245"
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anuja Mishra
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
