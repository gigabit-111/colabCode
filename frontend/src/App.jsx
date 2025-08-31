
import { useRef, useState, useEffect } from "react"
import io from "socket.io-client"
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels"
import Editor from "@monaco-editor/react"
import AppSideBar from "./components/AppSideBar"
import { IoMenu, IoClose } from "react-icons/io5"
import toast from "react-hot-toast"
import axios from "axios"
import Mobile from "./pages/Mobile"
import Desktop from "./pages/Desktop"
import Initial from "./components/InitialComponent"
import JoinComponent from "./components/JoinComponent"
import CreateComponent from "./components/createComponent"
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const socket = io(backendUrl, {
  withCredentials: true,
  transports: ["polling", "websocket"],
});

function App() {
  // const [loading, setLoading] = useState(false)
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
        setShowOutput(false)
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

    socket.on("codeInputUpdate", (newInput) => {
      setCodeInput(newInput)
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
      socket.off("codeInputUpdate")
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

  const HandleJoinRoom = async (roomId, username) => {
    if (username === '') return;
    try {
      const res = await axios.get(`${backendUrl}/user-exit`, {
        params: { username, roomId },
      });
      if (res.data.exists) { // Replace with actual property from your API
        toast.error("Username already taken in this room. Please choose another one.");
      } else {
        if (roomId && username) {
          socket.emit("join", { roomId, username });
          setCurrentRoom(roomId);
          setCurrentUser(username);
          setJoined(true);
          localStorage.setItem("currentRoom", roomId);
          localStorage.setItem("currentUser", username);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("An error occurred while checking username.");
    }
  };


  const createRoom = () => {
    socket.emit("createRoom")
  }

  const handleEditorChange = (newCode) => {
    setCode(newCode)
    socket.emit("codeChange", { roomId: currentRoom, code: newCode })
    socket.emit("userTyping", { roomId: currentRoom, username: currentUser })
  }

  const handleCodeInputChange = (e) => {
    setCodeInput(e.target.value);
    console.log("Code input changed:", e.target.value);
    socket.emit("codeInputChange", { roomId: currentRoom, codeInput: e.target.value });
  };

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

  const copyRoomId = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // only show toast after success
      toast.success(`Room ID copied: ${text}`);
    } catch (err) {
      if (err.name === "AbortError" || err.message.includes("Canceled")) {
        console.warn("Clipboard write canceled");
      } else {
        console.error("Clipboard error:", err);
        toast.error("Failed to copy Room ID");
      }
    }
  };


  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value
    setLanguage(newLanguage)
    setOutput("")
    socket.emit("languageChange", { roomId: currentRoom, language: newLanguage })
  }

  const handleRunCode = () => {
    if (!isExecuting) {
      setOutputLoading(true)
      socket.emit("compileCode", { code, roomId: currentRoom, language, version, codeinput: codeInput })
      if (isMobile) {
        setShowOutput(true)
      }
    }
  }

  if (!joined) {
    if (mode === "initial") {
      return <Initial setMode={setMode} />
    }

    if (mode === "join") {
      return (
        <JoinComponent
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          currentRoom={currentRoom}
          setCurrentRoom={setCurrentRoom}
          HandleJoinRoom={HandleJoinRoom}
          setMode={setMode}
        />
      )
    }

    if (mode === "create") {
      return (
        <CreateComponent
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          createRoom={createRoom}
          setMode={setMode}
        />
      )
    }
  }

  if (isMobile) {
    return (
      <Mobile
        openSideBar={openSideBar}
        setOpenSideBar={setOpenSideBar}
        currentUser={currentUser}
        typing={typing}
        handleLanguageChange={handleLanguageChange}
        copyRoomId={copyRoomId}
        handleUserLeft={handleUserLeft}
        currentRoom={currentRoom}
        language={language}
        setLanguage={setLanguage}
        code={code}
        handleEditorChange={handleEditorChange}
        showOutput={showOutput}
        setShowOutput={setShowOutput}
        users={users}
        codeInput={codeInput}
        handleCodeInputChange={handleCodeInputChange}
        handleRunCode={handleRunCode}
        isExecuting={isExecuting}
        outputLoading={outputLoading}
        output={output}
      />
    )
  }

  // Desktop View
  return (
    <Desktop
      openSideBar={openSideBar}
      setOpenSideBar={setOpenSideBar}
      currentUser={currentUser}
      typing={typing}
      handleLanguageChange={handleLanguageChange}
      copyRoomId={copyRoomId}
      handleUserLeft={handleUserLeft}
      users={users}
      currentRoom={currentRoom}
      language={language}
      setLanguage={setLanguage}
      code={code}
      handleEditorChange={handleEditorChange}
      // showOutput={showOutput}
      // setShowOutput={setShowOutput}
      codeInput={codeInput}
      handleCodeInputChange={handleCodeInputChange}
      output={output}
      handleRunCode={handleRunCode}
      isExecuting={isExecuting}
      outputLoading={outputLoading}
    />

  )
}

export default App
