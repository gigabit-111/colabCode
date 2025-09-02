import React from 'react'

function EditorPage(
    {
        code,
        language,
        handleEditorChange,
        handleRunCode,
        isExecuting,
        output,
        showOutput,
        setShowOutput,
        openSideBar,
        setOpenSideBar,
        currentRoom,
        currentUser,
        handleCodeInputChange,
        codeInput,
        isMobile,
        handleLanguageChange,
        copyRoomId,
        handleUserLeft,
        typing,
        setLanguage,
        users,
        outputLoading
    }
) {
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

export default EditorPage