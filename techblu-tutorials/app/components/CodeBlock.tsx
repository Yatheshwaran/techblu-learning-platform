"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  EditorView,
} from "codemirror";

import {
  keymap,
  lineNumbers,
} from "@codemirror/view";

import {
  EditorState,
} from "@codemirror/state";

import {
  defaultKeymap,
  indentWithTab,
} from "@codemirror/commands";

import {
  basicSetup,
} from "codemirror";

import {
  python,
} from "@codemirror/lang-python";

import {
  javascript,
} from "@codemirror/lang-javascript";

import {
  java,
} from "@codemirror/lang-java";

import {
  cpp,
} from "@codemirror/lang-cpp";

import {
  oneDark,
} from "@codemirror/theme-one-dark";

type CodeBlockProps = {
  children: React.ReactNode;
};


function getCodeText(node: React.ReactNode): string {
  if (typeof node === "string") {
    return node;
  }

  if (typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getCodeText).join("");
  }

  if (React.isValidElement(node)) {
    const props = node.props as {
      children?: React.ReactNode;
    };

    return getCodeText(props.children);
  }

  return "";
}


function getLanguage(children: React.ReactNode): string {
  if (!React.isValidElement(children)) {
    return "text";
  }

  const props = children.props as {
    className?: string;
  };

  const className = props.className || "";

  const match = className.match(
    /language-([\w-]+)/
  );

  return match?.[1] || "text";
}


const runnableLanguages = [
  "python",
  "javascript",
  "js",
  "java",
  "cpp",
  "c",
];


function getLanguageExtension(language: string) {
  switch (language) {
    case "python":
      return python();

    case "javascript":
    case "js":
      return javascript();

    case "java":
      return java();

    case "cpp":
    case "c":  
      return cpp();

    

    default:
      return [];
  }
}


export default function CodeBlock({
  children,
}: CodeBlockProps) {

  const initialCode = getCodeText(children)
    .replace(/\n$/, "");

  const language = getLanguage(children);

  const isRunnable =
    runnableLanguages.includes(language);

  const editorRef =
    useRef<HTMLDivElement | null>(null);

  const viewRef =
    useRef<EditorView | null>(null);

  const [code, setCode] =
    useState(initialCode);

  const [output, setOutput] =
    useState("");

  const [running, setRunning] =
    useState(false);

  const [copied, setCopied] =
    useState(false);


  /*
   * Static code blocks
   *
   * Example:
   *
   * ```text
   * Hello World
   * ```
   *
   * These do NOT get Copy / Run / editing.
   */

  if (!isRunnable) {
    return (
      <div className="static-code-block">
        <pre>
          <code>
            {initialCode}
          </code>
        </pre>
      </div>
    );
  }


  /*
   * Create CodeMirror editor
   */

  useEffect(() => {

    if (!editorRef.current) {
      return;
    }

    if (viewRef.current) {
      return;
    }

    const languageExtension =
      getLanguageExtension(language);

    const startState =
      EditorState.create({

        doc: initialCode,

        extensions: [

          basicSetup,

          lineNumbers(),

          keymap.of([
            ...defaultKeymap,
            indentWithTab,
          ]),

          languageExtension,

          oneDark,

          EditorView.updateListener.of(
            (update) => {

              if (
                update.docChanged
              ) {

                const value =
                  update.state.doc.toString();

                setCode(value);

                setOutput("");
              }
            }
          ),

          EditorView.theme({

            "&": {
              backgroundColor:
                "#0b1220",
              color: "#abb2bf",
              fontSize: "15px",
            },

            ".cm-content": {
              fontFamily:
                '"Cascadia Code", "Fira Code", Consolas, monospace',

              padding:
                "18px 0",

              minHeight:
                "150px",
            },

            ".cm-line": {
              paddingLeft:
                "8px",
            },

            ".cm-gutters": {
              backgroundColor:
                "#0b1220",

              color:
                "#60718c",

              border:
                "none",
            },

            ".cm-activeLineGutter": {
              backgroundColor:
                "#172238",
            },

            ".cm-activeLine": {
              backgroundColor:
                "rgba(37, 99, 235, 0.08)",
            },

            ".cm-cursor": {
              borderLeftColor:
                "#61afef",
            },

            ".cm-selectionBackground": {
              backgroundColor:
                "#264f78 !important",
            },

            ".cm-scroller": {
              overflow:
                "auto",
            },

          }),

        ],
      });


    const view =
      new EditorView({

        state: startState,

        parent:
          editorRef.current,

      });


    viewRef.current =
      view;


    return () => {

      view.destroy();

      viewRef.current =
        null;

    };

  }, [
    language,
    initialCode,
  ]);


  /*
   * Copy code
   */

  async function handleCopy() {

    try {

      const currentCode =
        viewRef.current
          ?.state.doc.toString()
          ?? code;

      await navigator.clipboard.writeText(
        currentCode
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);

    } catch (error) {

      console.error(
        "Copy failed:",
        error
      );

    }

  }


  /*
   * Run code
   */

  async function handleRun() {

    setRunning(true);

    setOutput("");


    try {

      const currentCode =
        viewRef.current
          ?.state.doc.toString()
          ?? code;


      const response =
        await fetch(
          "/api/execute",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              language:
                language === "js"
                  ? "javascript"
                  : language,

              sourceCode:
                currentCode,

              stdin: "",

            }),

          }
        );


      const result =
        await response.json();


      if (!response.ok) {

        setOutput(
          result.error ||
          result.message ||
          "Program execution failed."
        );

        return;
      }


      if (result.stdout) {

        setOutput(
          result.stdout
        );

      } else if (result.stderr) {

        setOutput(
          result.stderr
        );

      } else if (
        result.compile_output
      ) {

        setOutput(
          result.compile_output
        );

      } else if (result.message) {

        setOutput(
          result.message
        );

      } else {

        setOutput(
          "Program executed successfully."
        );

      }

    } catch (error) {

      console.error(
        "Compiler error:",
        error
      );

      setOutput(
        "Could not connect to the TechBlu compiler backend."
      );

    } finally {

      setRunning(false);

    }

  }


  return (

    <div className="interactive-code">

      {/* Header */}

      <div className="interactive-code-header">

        <span className="interactive-language">
          {language}
        </span>


        <div className="interactive-actions">

          <button
            type="button"
            onClick={handleCopy}
            className="code-button copy-button"
          >
            {copied
              ? "Copied!"
              : "Copy"}
          </button>


          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="code-button run-button"
          >
            {running
              ? "Running..."
              : "▶ Run"}
          </button>

        </div>

      </div>


      {/* CodeMirror editor */}

      <div
        ref={editorRef}
        className="codemirror-editor"
      />


      {/* Output */}

      {output !== "" && (

        <div className="interactive-output">

          <div className="output-title">
            Output
          </div>

          <pre>
            {output}
          </pre>

        </div>

      )}

    </div>

  );

}