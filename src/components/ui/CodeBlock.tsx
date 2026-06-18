"use client";

import { Highlight, Prism, themes } from "prism-react-renderer";

// prism-react-renderer bundles a limited set of grammars and does NOT include
// bash/shell, so shell scripts would render as plain text. Register a compact
// bash grammar once on the shared Prism instance so they highlight like the rest.
// (Runs at module load, on both server and client - no globals, no extra deps.)
const prismLanguages = Prism.languages as Record<string, unknown>;
if (!prismLanguages.bash) {
  prismLanguages.bash = {
    comment: { pattern: /(^|[^"{\\$])#.*/, lookbehind: true, greedy: true },
    string: [
      { pattern: /"(?:\\.|[^"\\])*"/, greedy: true },
      { pattern: /'(?:\\.|[^'\\])*'/, greedy: true },
    ],
    keyword:
      /\b(?:if|then|else|elif|fi|for|in|while|until|do|done|case|esac|function|select|return|break|continue)\b/,
    builtin:
      /\b(?:echo|read|cd|pwd|export|source|alias|exit|printf|local|let|test|true|false|mv|cp|rm|mkdir|ls|cat|grep|chmod|kill|ps)\b/,
    variable: /\$(?:\w+|\{[^}]*\}|[#?*@!$0-9-])/,
    number: /\b\d+\b/,
    operator: /-[A-Za-z]+\b|&&|\|\||[=!<>]=?|\+\+|--|[-+*/%]/,
    punctuation: /[(){}\[\];|&]/,
  };
}

const langMap: Record<string, string> = {
  c: "c",
  cpp: "cpp",
  python: "python",
  java: "java",
  js: "javascript",
  php: "php",
  sql: "sql",
  bash: "bash",
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
