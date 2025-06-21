import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function CodeViewer({ codeText }) {
  return (
    <SyntaxHighlighter
      language="javascript"
      style={oneDark}
      customStyle={{
        padding: "1em",
        borderRadius: "10px",
        fontSize: "0.9em",
      }}
    >
      {codeText}
    </SyntaxHighlighter>
  );
}

export default CodeViewer;