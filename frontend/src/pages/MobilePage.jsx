import React from "react"
import { IoMenu, IoClose } from "react-icons/io5"
import Editor from "@monaco-editor/react"
import AppSideBar from "../components/AppSideBar/AppSideBar" // adjust path as needed
import MonacoEditor from "../components/Editor/MonacoEditor"

function Mobile({
  openSideBar,
  setOpenSideBar,
  currentUser,
  typing,
  handleLanguageChange,
  copyRoomId,
  handleUserLeft,
  currentRoom,
  language,
  setLanguage,
  code,
  handleEditorChange,
  showOutput,
  setShowOutput,

  // 👇 these must be passed in as props
  users,
  codeInput,
  handleCodeInputChange,
  handleRunCode,
  isExecuting,
  outputLoading,
  output,
}) {
  return (
    <div className="h-screen flex flex-col w-screen ">
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
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setOpenSideBar(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-900 border-b border-gray-700 p-3">
          <h2 className="text-lg md:text-xl font-bold text-white">ColabCode</h2>
          <div className="flex items-center gap-2">
            {!showOutput && (
              <button
                onClick={() => setShowOutput(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Output
              </button>
            )}
            <IoMenu
              size={24}
              className="cursor-pointer text-white"
              onClick={() => setOpenSideBar(!openSideBar)}
            />
          </div>
        </div>

        {/* Editor or Output */}
        <div className="flex-1 relative">
          {!showOutput ? (
            <div className="h-full bg-gray-900 text-white">
              <MonacoEditor
                language={language}
                value={code}
                onChange={handleEditorChange}
              />
            </div>
          ) : (
            <div className="h-full bg-gray-900 text-white flex flex-col p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Input</h3>
                <button
                  onClick={() => setShowOutput(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <IoClose size={24} />
                </button>
              </div>
              <textarea
                name="codeInput"
                className="mb-3 bg-gray-800 p-3 rounded-lg flex-1 border border-gray-700 w-full resize-none text-sm"
                placeholder="write your code input here..."
                value={codeInput}
                onChange={handleCodeInputChange}
              />
              <h3 className="text-lg font-semibold mb-2">Output</h3>
              <button
                onClick={handleRunCode}
                disabled={isExecuting || outputLoading}
                className={`p-3 rounded-lg mb-3 w-full ${
                  isExecuting || outputLoading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                } text-white font-medium transition-colors`}
              >
                {isExecuting || outputLoading ? "Running..." : "Execute code"}
              </button>
              <textarea
                name="output"
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
          © 2025 ColabCode. Developed by{" "}
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

export default Mobile
