import React from 'react'

function MonacoEditor(
    {
        language,
        code,
        handleEditorChange
    }
) {
    return (
        <Editor
            name="code"
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
    )
}

export default MonacoEditor