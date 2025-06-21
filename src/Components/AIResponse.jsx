import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function AIResponse({ text }) {
  return (
    <div className="text-white leading-7">
      <ReactMarkdown
        children={text}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "javascript";

            return !inline ? (
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                PreTag="div"
                customStyle={{ 
                  backgroundColor: "#111",
                  border: "1px solid #222",
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: "1em",
                  borderRadius: "10px", 
                  padding: "1.5em"
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-zinc-800 px-2 py-1 rounded mx-1">
                {children}
              </code>
            );
          },
        }}
      />
    </div>
  );
}
