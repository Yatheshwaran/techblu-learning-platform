import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  RotateCcw,
  Code2,
} from "lucide-react";

import InteractiveTerminal from "../components/compiler/InteractiveTerminal";

const COMPILER_API =
  import.meta.env.VITE_COMPILER_API || "http://localhost:5000";

/* =========================================================
   SUPPORTED LANGUAGES
========================================================= */

const compilerLanguages = [
  {
    id: "python",
    name: "Python",
    monaco: "python",
    file: "main.py",
    icon: "🐍",
  },
  {
    id: "javascript",
    name: "JavaScript",
    monaco: "javascript",
    file: "main.js",
    icon: "JS",
  },
  {
    id: "java",
    name: "Java",
    monaco: "java",
    file: "Main.java",
    icon: "☕",
  },
  {
    id: "cpp",
    name: "C++",
    monaco: "cpp",
    file: "main.cpp",
    icon: "⚙️",
  },
  {
    id: "c",
    name: "C",
    monaco: "c",
    file: "main.c",
    icon: "C",
  },
];

/* =========================================================
   MONACO AUTOCOMPLETE SUGGESTIONS
========================================================= */

const languageSuggestions = {
  python: [
    "print",
    "input",
    "int",
    "float",
    "str",
    "len",
    "range",
    "max",
    "min",
    "sum",
    "sorted",
    "append",
    "def",
    "return",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "in",
    "import",
    "from",
    "True",
    "False",
    "None",
    "list",
    "dict",
    "set",
    "tuple",
  ],

  javascript: [
    "console",
    "console.log",
    "prompt",
    "let",
    "const",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "map",
    "filter",
    "reduce",
    "push",
    "pop",
    "length",
    "Math",
    "parseInt",
    "parseFloat",
    "true",
    "false",
    "null",
    "undefined",
    "class",
    "new",
  ],

  java: [
    "public",
    "private",
    "protected",
    "class",
    "static",
    "void",
    "main",
    "int",
    "double",
    "float",
    "String",
    "boolean",
    "char",
    "if",
    "else",
    "for",
    "while",
    "return",
    "new",
    "System",
    "System.out.println",
    "Scanner",
    "ArrayList",
    "Math",
    "true",
    "false",
    "null",
  ],

  cpp: [
    "#include",
    "iostream",
    "vector",
    "string",
    "algorithm",
    "using",
    "namespace",
    "std",
    "cout",
    "cin",
    "endl",
    "int",
    "double",
    "float",
    "char",
    "bool",
    "if",
    "else",
    "for",
    "while",
    "return",
    "class",
    "public",
    "private",
    "push_back",
    "size",
    "sort",
    "max",
    "min",
  ],

  c: [
    "#include",
    "stdio.h",
    "stdlib.h",
    "string.h",
    "math.h",
    "printf",
    "scanf",
    "strlen",
    "malloc",
    "free",
    "int",
    "float",
    "double",
    "char",
    "void",
    "if",
    "else",
    "for",
    "while",
    "return",
    "struct",
    "sizeof",
  ],
};

/* =========================================================
   DEFAULT CODE
========================================================= */

function getDefaultCode(language) {
  switch (language) {
    case "python":
      return `# Write your Python code here

name = input("Enter your name: ")
print("Hello", name)`;

    case "javascript":
      return `// Write your JavaScript code here

const name = "TechBlu";
console.log("Hello", name);`;

    case "java":
      return `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter your name: ");
        String name = scanner.nextLine();

        System.out.println("Hello " + name);
    }
}`;

    case "cpp":
      return `#include <iostream>
using namespace std;

int main() {

    string name;

    cout << "Enter your name: ";
    cin >> name;

    cout << "Hello " << name;

    return 0;
}`;

    case "c":
      return `#include <stdio.h>

int main() {

    char name[50];

    printf("Enter your name: ");
    scanf("%49s", name);

    printf("Hello %s", name);

    return 0;
}`;

    default:
      return "";
  }
}

/* =========================================================
   MAIN FREE COMPILER
========================================================= */

export default function Compiler({
  language,
  setLanguage,
}) {
  const [selectedLanguage, setSelectedLanguage] = useState(
    language || "python"
  );

  const [code, setCode] = useState("");

  const [stdin, setStdin] = useState("");

  const [output, setOutput] = useState("");

  const [statusText, setStatusText] = useState("Ready");

  const [activeTab, setActiveTab] = useState("output");

  const [isRunning, setIsRunning] = useState(false);

  const editorRef = useRef(null);

  const currentLanguage =
    compilerLanguages.find(
      (item) => item.id === selectedLanguage
    ) || compilerLanguages[0];

  /* =======================================================
     INITIAL CODE
  ======================================================= */

  useEffect(() => {
    const nextLanguage = language || "python";

    setSelectedLanguage(nextLanguage);

    setCode(getDefaultCode(nextLanguage));

    setStdin("");

    setOutput("");

    setStatusText("Ready");

    setActiveTab("output");
  }, [language]);

  /* =======================================================
     CHANGE LANGUAGE
  ======================================================= */

  function changeLanguage(nextLanguage) {
    setSelectedLanguage(nextLanguage);

    if (setLanguage) {
      setLanguage(nextLanguage);
    }

    setCode(getDefaultCode(nextLanguage));

    setStdin("");

    setOutput("");

    setStatusText("Ready");

    setActiveTab("output");
  }

  /* =======================================================
     MONACO MOUNT
  ======================================================= */

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;

    const suggestions =
      languageSuggestions[selectedLanguage] || [];

    monaco.languages.registerCompletionItemProvider(
      currentLanguage.monaco,
      {
        provideCompletionItems: () => {
          return {
            suggestions: suggestions.map((word) => ({
              label: word,

              kind:
                monaco.languages
                  .CompletionItemKind.Keyword,

              insertText: word,

              documentation:
                `TechBlu ${currentLanguage.name} suggestion`,
            })),
          };
        },
      }
    );
  }

  /* =======================================================
     RUN CODE
  ======================================================= */

  async function runCode() {
    if (!code.trim()) {
      setOutput(
        "Please write some code before running."
      );

      setStatusText("No code");

      setActiveTab("output");

      return;
    }

    setIsRunning(true);

    setStatusText("Running...");

    setOutput("");

    setActiveTab("output");

    try {
      const response = await fetch(
        `${COMPILER_API}/api/execute`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            language: selectedLanguage,

            sourceCode: code,

            stdin: stdin || "",
          }),
        }
      );

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "Compiler backend returned an invalid response."
        );
      }

      if (!response.ok || !result.success) {
        setOutput(
          result.error ||
            result.details ||
            "Program execution failed."
        );

        setStatusText("Execution Error");

        return;
      }

      /* ===================================================
         COMPILATION ERROR
      =================================================== */

      if (result.compile_output) {
        setOutput(result.compile_output);

        setStatusText("Compilation Error");

        return;
      }

      /* ===================================================
         RUNTIME ERROR
      =================================================== */

      if (result.stderr) {
        setOutput(result.stderr);

        setStatusText("Runtime Error");

        return;
      }

      /* ===================================================
         NORMAL OUTPUT
      =================================================== */

      const programOutput =
        result.stdout || "";

      if (programOutput) {
        setOutput(programOutput);
      } else {
        setOutput(
          "Program executed successfully with no output."
        );
      }

      setStatusText(
        result.status?.description ||
          "Execution finished"
      );
    } catch (error) {
      console.error(
        "TechBlu compiler error:",
        error
      );

      setOutput(
        `${error.message}

Make sure the TechBlu compiler backend is running.

Backend:
http://localhost:5000`
      );

      setStatusText("Backend Error");
    } finally {
      setIsRunning(false);

      setActiveTab("output");
    }
  }

  /* =======================================================
     RESET
  ======================================================= */

  function resetCode() {
    setCode(
      getDefaultCode(selectedLanguage)
    );

    setStdin("");

    setOutput("");

    setStatusText("Ready");

    setActiveTab("output");
  }

  /* =======================================================
     CLEAR TERMINAL
  ======================================================= */

  function clearTerminal() {
    setStdin("");

    setOutput("");

    setStatusText("Ready");

    setActiveTab("output");
  }

  /* =======================================================
     STOP
  ======================================================= */

  function stopCode() {
    setIsRunning(false);

    setStatusText("Stopped");
  }

  /* =======================================================
     COPY CODE
  ======================================================= */

  async function copyCode() {
    const text =
      editorRef.current?.getValue() ||
      code;

    try {
      await navigator.clipboard.writeText(
        text
      );

      setStatusText("Code copied");
    } catch {
      setStatusText("Copy failed");
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="compiler-page">
      <div className="compiler-free-shell">

        {/* =================================================
            COMPILER HEADER
        ================================================= */}

        <header className="compiler-header">

          <div className="compiler-brand">

            <div className="compiler-brand-icon">
              <Code2 size={22} />
            </div>

            <div>
              <h1>TechBlu Compiler</h1>

              <p>
                Learn something. Build something.
              </p>
            </div>

          </div>

          <div className="compiler-actions">

            {/* LANGUAGE */}

            <label className="compiler-language-select">

              <span>Language</span>

              <select
                value={selectedLanguage}
                onChange={(event) =>
                  changeLanguage(
                    event.target.value
                  )
                }
              >
                {compilerLanguages.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  )
                )}
              </select>

            </label>

            {/* COPY */}

            <button
              type="button"
              className="compiler-button secondary"
              onClick={copyCode}
            >
              Copy
            </button>

            {/* RESET */}

            <button
              type="button"
              className="compiler-button secondary"
              onClick={resetCode}
            >
              <RotateCcw size={15} />
              Reset
            </button>

            {/* RUN */}

            <button
              type="button"
              className="compiler-button primary"
              onClick={runCode}
              disabled={isRunning}
            >
              <Play size={15} />

              {isRunning
                ? "Running..."
                : "Run Code"}
            </button>

          </div>
        </header>

        {/* =================================================
            FREE COMPILER WORKSPACE
        ================================================= */}

        <section className="compiler-free-workspace">

          {/* =================================================
              EDITOR
          ================================================= */}

          <section className="compiler-free-editor">

            {/* EDITOR HEADER */}

            <div className="editor-header">

              <div className="editor-file-tab">

                <span className="file-icon">
                  {currentLanguage.icon}
                </span>

                <span>
                  {currentLanguage.file}
                </span>

              </div>

              <span className="editor-title">
                Monaco Editor
              </span>

            </div>

            {/* MONACO */}

            <div className="monaco-wrapper">

              <Editor
                height="100%"
                width="100%"
                language={
                  currentLanguage.monaco
                }
                theme="techblu-dark"
                value={code}
                onChange={(value) =>
                  setCode(value || "")
                }
                onMount={
                  handleEditorMount
                }
                loading={
                  <div className="editor-loading">
                    Loading Monaco Editor...
                  </div>
                }
                options={{
                  automaticLayout: true,

                  fontSize: 15,

                  fontFamily:
                    "JetBrains Mono, Consolas, 'Courier New', monospace",

                  lineNumbers: "on",

                  lineNumbersMinChars: 3,

                  minimap: {
                    enabled: false,
                  },

                  padding: {
                    top: 14,
                    bottom: 14,
                  },

                  tabSize: 4,

                  insertSpaces: true,

                  detectIndentation: false,

                  autoIndent: "full",

                  formatOnPaste: true,

                  formatOnType: true,

                  wordWrap: "off",

                  scrollBeyondLastLine: false,

                  smoothScrolling: true,

                  cursorBlinking: "smooth",

                  cursorSmoothCaretAnimation:
                    "on",

                  renderLineHighlight: "all",

                  matchBrackets: "always",

                  bracketPairColorization: {
                    enabled: true,
                  },

                  suggestOnTriggerCharacters:
                    true,

                  quickSuggestions: true,

                  parameterHints: {
                    enabled: true,
                  },

                  tabCompletion: "on",

                  folding: true,

                  foldingHighlight: true,

                  guides: {
                    indentation: true,
                    bracketPairs: true,
                  },

                  contextmenu: true,

                  mouseWheelZoom: true,
                }}

                beforeMount={(monaco) => {

                  monaco.editor.defineTheme(
                    "techblu-dark",
                    {
                      base: "vs-dark",

                      inherit: true,

                      rules: [
                        {
                          token: "comment",
                          foreground:
                            "6A9955",
                        },

                        {
                          token: "keyword",
                          foreground:
                            "C586C0",
                        },

                        {
                          token: "string",
                          foreground:
                            "CE9178",
                        },

                        {
                          token: "number",
                          foreground:
                            "B5CEA8",
                        },

                        {
                          token: "type",
                          foreground:
                            "4EC9B0",
                        },

                        {
                          token: "function",
                          foreground:
                            "DCDCAA",
                        },
                      ],

                      colors: {
                        "editor.background":
                          "#07111F",

                        "editor.foreground":
                          "#D4E2F5",

                        "editorLineNumber.foreground":
                          "#52657D",

                        "editorLineNumber.activeForeground":
                          "#58A6FF",

                        "editor.lineHighlightBackground":
                          "#10233C",

                        "editor.selectionBackground":
                          "#174A7C",

                        "editorCursor.foreground":
                          "#58A6FF",

                        "editorSuggestWidget.background":
                          "#0D1A2B",

                        "editorSuggestWidget.border":
                          "#24415F",

                        "editorSuggestWidget.selectedBackground":
                          "#1559A6",

                        "editorIndentGuide.background1":
                          "#18304A",

                        "editorBracketHighlight.foreground1":
                          "#58A6FF",

                        "editorBracketHighlight.foreground2":
                          "#C586C0",

                        "editorBracketHighlight.foreground3":
                          "#4EC9B0",
                      },
                    }
                  );

                  monaco.editor.setTheme(
                    "techblu-dark"
                  );
                }}
              />

            </div>

            {/* =================================================
                INTERACTIVE TERMINAL
            ================================================= */}

            <InteractiveTerminal
  code={code}
  language={selectedLanguage}
  stdin={stdin}
  setStdin={setStdin}
  output={output}
  status={statusText}
  isRunning={isRunning}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  onRun={runCode}
  onStop={() => {
    setIsRunning(false);
    setStatusText("Ready");
  }}
  onClear={() => {
    setOutput("");
    setStatusText("Ready");
  }}
/>

          </section>

        </section>

      </div>
    </main>
  );
}
