import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Desktop from "./DesktopPage";
import Mobile from "./MobilePage";
import { ensureSocketConnected, getSocket } from "../socket";

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpointPx);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpointPx);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpointPx]);
  return isMobile;
}

function EditorPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const socket = useMemo(() => getSocket(), []);
  const isMobile = useIsMobile();

  const [currentRoom] = useState(() => roomId ?? "");
  const [currentUser] = useState(() => localStorage.getItem("cc_username") ?? "");

  const [openSideBar, setOpenSideBar] = useState(!isMobile);
  const [showOutput, setShowOutput] = useState(false);

  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");

  const [code, setCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");

  const [isExecuting, setIsExecuting] = useState(false);
  const [outputLoading, setOutputLoading] = useState(false);

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Keep sidebar default sensible when switching mobile/desktop.
    setOpenSideBar(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (!currentRoom) {
      navigate("/join", { replace: true });
      return;
    }
    if (!currentUser) {
      navigate("/join", { replace: true, state: { roomId: currentRoom } });
      return;
    }

    ensureSocketConnected(socket, 5000).catch((err) => {
      console.error("Socket connect error:", err);
      toast.error("Backend connection failed. Please start backend and refresh.");
    });

    const onUserJoined = (nextUsers) => setUsers(nextUsers);
    const onUserLeft = (nextUsers) => setUsers(nextUsers);
    const onTyping = (username) => {
      setTyping(username);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTyping(""), 1200);
    };

    const onCodeUpdate = (nextCode) => setCode(nextCode ?? "");
    const onLanguageUpdate = (nextLanguage) => setLanguage(nextLanguage ?? "javascript");
    const onCodeInputUpdate = (nextInput) => setCodeInput(nextInput ?? "");
    const onCodeOutput = (nextOutput) => setOutput(nextOutput ?? "");

    const onExecStarted = () => {
      setIsExecuting(true);
      setOutputLoading(true);
    };
    const onExecEnded = () => {
      setIsExecuting(false);
      setOutputLoading(false);
    };
    const onExecBusy = (payload) => {
      toast(payload?.message ?? "Code execution in progress, please wait.");
    };
    const onCodeResponse = (data) => {
      const out = data?.run?.output ?? "";
      setOutput(out);
      setOutputLoading(false);
    };

    socket.on("userJoined", onUserJoined);
    socket.on("userLeft", onUserLeft);
    socket.on("userTyping", onTyping);
    socket.on("codeUpdate", onCodeUpdate);
    socket.on("languageUpdate", onLanguageUpdate);
    socket.on("codeInputUpdate", onCodeInputUpdate);
    socket.on("codeOutput", onCodeOutput);
    socket.on("codeExecutionStarted", onExecStarted);
    socket.on("codeExecutionEnded", onExecEnded);
    socket.on("codeExecutionBusy", onExecBusy);
    socket.on("codeResponse", onCodeResponse);

    // duplicate username or other join failures
    const onJoinError = (payload) => {
      toast.error(payload?.message || "Failed to join room");
      // kick user back to join page so they can pick a different name
      navigate("/join", { replace: true, state: { roomId: currentRoom } });
    };
    socket.on("joinError", onJoinError);

    socket.emit("join", { roomId: currentRoom, username: currentUser });

    return () => {
      socket.off("userJoined", onUserJoined);
      socket.off("userLeft", onUserLeft);
      socket.off("userTyping", onTyping);
      socket.off("codeUpdate", onCodeUpdate);
      socket.off("languageUpdate", onLanguageUpdate);
      socket.off("codeInputUpdate", onCodeInputUpdate);
      socket.off("codeOutput", onCodeOutput);
      socket.off("codeExecutionStarted", onExecStarted);
      socket.off("codeExecutionEnded", onExecEnded);
      socket.off("codeExecutionBusy", onExecBusy);
      socket.off("codeResponse", onCodeResponse);
      socket.off("joinError", onJoinError);
    };
  }, [currentRoom, currentUser, navigate, socket]);

  const handleEditorChange = (nextValue) => {
    const nextCode = nextValue ?? "";
    setCode(nextCode);
    socket.emit("codeChange", { roomId: currentRoom, code: nextCode });
    socket.emit("userTyping", { roomId: currentRoom, username: currentUser });
  };

  const handleCodeInputChange = (e) => {
    const next = e.target.value;
    setCodeInput(next);
    socket.emit("codeInputChange", { roomId: currentRoom, codeInput: next });
  };

  const handleLanguageChange = (e) => {
    const next = e.target.value;
    setLanguage(next);
    socket.emit("languageChange", { roomId: currentRoom, language: next });
  };

  const handleRunCode = () => {
    socket.emit("compileCode", {
      code,
      roomId: currentRoom,
      language,
      version: "latest",
      codeinput: codeInput,
    });
  };

  const copyRoomId = async (roomIdToCopy) => {
    const link = `${window.location.origin}/room/${roomIdToCopy}`;
    try {
      await navigator.clipboard.writeText(link);
      toast("Room link copied");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy");
    }
  };

  const handleUserLeft = () => {
    socket.emit("leaveRoom");
    navigate("/", { replace: true });
  };

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
    );
  }

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
      codeInput={codeInput}
      handleCodeInputChange={handleCodeInputChange}
      output={output}
      handleRunCode={handleRunCode}
      isExecuting={isExecuting}
      outputLoading={outputLoading}
    />
  );
}

export default EditorPage;