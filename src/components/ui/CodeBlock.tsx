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

// prism-react-renderer's bundle also leaves out Java. Its grammar is just clike
// plus a few extensions, and clike IS bundled, so register the (faithful, trimmed)
// upstream Java grammar once on the same shared instance.
if (!prismLanguages.java) {
  const javaKeywords =
    /\b(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|exports|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|module|native|new|non-sealed|null|open|opens|package|permits|private|protected|provides|public|record|requires|return|sealed|short|static|strictfp|super|switch|synchronized|this|throw|throws|to|transient|transitive|try|uses|var|void|volatile|while|with|yield)\b/;
  const classNamePrefix = /(?:[a-z]\w*\s*\.\s*)*(?:[A-Z]\w*\s*\.\s*)*/.source;
  const className = {
    pattern: RegExp(
      /(^|[^\w.])/.source + classNamePrefix + /[A-Z](?:[\d_A-Z]*[a-z]\w*)?\b/.source,
    ),
    lookbehind: true,
    inside: {
      namespace: {
        pattern: /^[a-z]\w*(?:\s*\.\s*[a-z]\w*)*(?:\s*\.)?/,
        inside: { punctuation: /\./ },
      },
      punctuation: /\./,
    },
  };
  Prism.languages.java = Prism.languages.extend("clike", {
    string: { pattern: /(^|[^\\])"(?:\\.|[^"\\\r\n])*"/, lookbehind: true, greedy: true },
    "class-name": className,
    keyword: javaKeywords,
    function: /\b[A-Za-z_]\w*(?=\s*\()/,
    number:
      /\b0b[01][01_]*L?\b|\b0x(?:\.[\da-f_p+-]+|[\da-f_]+(?:\.[\da-f_p+-]+)?)\b|(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?\d[\d_]*)?[dfl]?/i,
    operator: {
      pattern: /(^|[^.])(?:<<=?|>>>?=?|->|--|\+\+|&&|\|\||::|[?:~]|[-+*/%&|^!=<>]=?)/m,
      lookbehind: true,
    },
    constant: /\b[A-Z][A-Z_\d]+\b/,
  });
  Prism.languages.insertBefore("java", "string", {
    char: { pattern: /'(?:\\.|[^'\\\r\n]){1,6}'/, greedy: true },
  });
  Prism.languages.insertBefore("java", "function", {
    annotation: {
      pattern: /(^|[^.])@\w+(?:\s*\.\s*\w+)*/,
      lookbehind: true,
      alias: "punctuation",
    },
  });
}

// Same gap for PHP. Compact grammar: clike plus PHP keywords, $variables, the
// <?php ?> delimiters (colored via the keyword alias), and # line comments.
if (!prismLanguages.php) {
  Prism.languages.php = Prism.languages.extend("clike", {
    keyword:
      /\b(?:abstract|and|array|as|break|callable|case|catch|class|clone|const|continue|declare|default|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|enum|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|match|namespace|new|or|parent|print|private|protected|public|readonly|require|require_once|return|self|static|switch|throw|trait|try|unset|use|var|while|xor|yield)\b/i,
    boolean: { pattern: /\b(?:false|null|true)\b/i },
    constant: /\b[A-Z_][A-Z0-9_]*\b/,
    comment: {
      pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|(?:\/\/|#).*)/,
      lookbehind: true,
      greedy: true,
    },
    number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
  });
  Prism.languages.insertBefore("php", "keyword", {
    delimiter: { pattern: /\?>|<\?(?:php|=)?/i, alias: "keyword" },
    variable: /\$+(?:\w+\b|(?=\{))/,
  });
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
