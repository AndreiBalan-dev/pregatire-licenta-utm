"use client";

import { Highlight, themes } from "prism-react-renderer";

const langMap: Record<string, string> = {
  c: "c",
  cpp: "cpp",
  python: "python",
  java: "java",
  js: "javascript",
  php: "php",
  sql: "sql",
};

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const prismLang = language ? langMap[language] || "text" : "text";

  return (
    <Highlight theme={themes.nightOwl} code={code.trim()} language={prismLang}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre className={`code-block ${className || ""}`}>
          <code>
            {tokens.map((line, i) => (
              <span key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
                {i < tokens.length - 1 && "\n"}
              </span>
            ))}
          </code>
        </pre>
      )}
    </Highlight>
  );
}
