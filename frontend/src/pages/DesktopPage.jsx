
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels"
import Editor from "@monaco-editor/react"
import AppSideBar from "../components/AppSideBar/AppSideBar"
import { IoMenu, IoClose } from "react-icons/io5"
import MonacoEditor from "../components/Editor/MonacoEditor"


function Desktop({ openSideBar, setOpenSideBar, currentUser, typing, handleLanguageChange, copyRoomId, handleUserLeft, users, currentRoom, language, setLanguage, code, handleEditorChange, codeInput, handleCodeInputChange, output, handleRunCode, isExecuting, outputLoading }) {
  return (
    <div className="h-screen flex flex-col w-screen">
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
        <PanelResizeHandle style={{ width: "5px", background: "#374151", cursor: "ew-resize" }} />
        {openSideBar && <PanelResizeHandle style={{ width: "5px", background: "#374151", cursor: "ew-resize" }} />}
        <Panel minSize={30}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={70} minSize={30}>
              {/* header */}
              <div className="p-3 md:p-4 bg-gray-900 text-white h-full flex flex-col rounded-lg">
                <div className="flex justify-between items-center border-2 border-gray-700 p-2 md:p-3 rounded">
                  <h2 className="text-lg md:text-xl font-bold">ColabCode</h2>
                  <IoMenu
                    size={24}
                    className="cursor-pointer hover:text-gray-300 transition-colors"
                    onClick={() => setOpenSideBar(!openSideBar)}
                  />
                </div>
                {/* Editor */}
                <div className="flex-1 border-2 border-gray-700 rounded mt-2">
                  <MonacoEditor
                    language={language}
                    value={code}
                    onChange={handleEditorChange}
                  />
                </div>
              </div>
            </Panel>
            <PanelResizeHandle style={{ height: "5px", background: "#374151", cursor: "ns-resize" }} />
            <Panel minSize={20} defaultSize={30}>
              <div className="p-3 md:p-4 bg-gray-900 text-white h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-2">Input</h3>
                <textarea
                  name="codeInput"
                  className="mb-3 bg-gray-800 p-3 rounded-lg flex-1 border border-gray-700 w-full resize-none text-sm "
                  placeholder="Write your code input here..."
                  value={codeInput}
                  onChange={handleCodeInputChange}
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
                  name="output"
                  className="bg-gray-800 p-2 md:p-3 rounded-lg flex-1 border-2 border-gray-700 w-full resize-none text-sm md:text-base"
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
      <div className="bg-gray-900 border-t border-gray-700 p-2">
        <p className="text-center text-l text-gray-400">
          © 2025 ColabCode. All rights reserved. Developed by{" "}
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

export default Desktop