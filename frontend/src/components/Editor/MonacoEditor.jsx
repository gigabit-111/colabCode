import Editor from "@monaco-editor/react";

function MonacoEditor({ language, value, onChange, code, handleEditorChange }) {
  const resolvedValue = value ?? code ?? "";
  const resolvedOnChange = onChange ?? handleEditorChange;

  return (
    <Editor
      name="code"
      height="100%"
      language={language}
      value={resolvedValue}
      onChange={resolvedOnChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 20,
        scrollBeyondLastLine: false,
      }}
    />
  );
}

export default MonacoEditor;