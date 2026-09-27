import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Play,
  RotateCcw,
  Square,
  Terminal,
} from "lucide-react";

const WS_URL = "ws://localhost:5000";

export default function InteractiveTerminal({
  code,
  language,
}) {
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);

  /*
   * This number identifies the current WebSocket connection.
   *
   * It prevents events from an old socket from modifying
   * the state of a newer socket.
   */
  const socketGenerationRef = useRef(0);

  const [lines, setLines] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [connected, setConnected] = useState(false);

  // ----------------------------------------------------------
  // ADD OUTPUT
  // ----------------------------------------------------------

  function addOutput(text, type = "output") {
    if (text === undefined || text === null) {
      return;
    }

    const value = String(text);

    if (!value) {
      return;
    }

    setLines((previous) => [
      ...previous,
      {
        type,
        text: value,
      },
    ]);
  }

  // ----------------------------------------------------------
  // CONNECT WEBSOCKET
  // ----------------------------------------------------------

  function connectSocket() {
    return new Promise((resolve, reject) => {
      /*
       * Create a new generation for this connection.
       */
      const generation =
        socketGenerationRef.current + 1;

      socketGenerationRef.current = generation;

      /*
       * Close the previous socket if it exists.
       */
      const oldSocket = socketRef.current;

      if (oldSocket) {
        try {
          oldSocket.close();
        } catch {
          // Ignore old socket close errors.
        }
      }

      /*
       * Create NEW socket.
       */
      const socket = new WebSocket(WS_URL);

      /*
       * IMPORTANT:
       * Store the new socket immediately.
       */
      socketRef.current = socket;

      // ------------------------------------------------------
      // OPEN
      // ------------------------------------------------------

      socket.onopen = () => {
        /*
         * Ignore this event if this is no longer
         * the current socket.
         */
        if (
          socketRef.current !== socket ||
          socketGenerationRef.current !== generation
        ) {
          return;
        }

        setConnected(true);
        setStatus("Connected");

        resolve(socket);
      };

      // ------------------------------------------------------
      // MESSAGE
      // ------------------------------------------------------

      socket.onmessage = (event) => {
        /*
         * Ignore messages from an old socket.
         */
        if (
          socketRef.current !== socket ||
          socketGenerationRef.current !== generation
        ) {
          return;
        }

        try {
          const message = JSON.parse(event.data);

          // -----------------------------------------------
          // OUTPUT
          // -----------------------------------------------

          if (message.type === "output") {
            addOutput(message.data || "");
            return;
          }

          // -----------------------------------------------
          // STATUS
          // -----------------------------------------------

          if (message.type === "status") {
            setStatus(
              message.message || "Ready"
            );
            return;
          }

          // -----------------------------------------------
          // ERROR
          // -----------------------------------------------

          if (message.type === "error") {
            addOutput(
              message.message ||
                "Unknown compiler error.",
              "error"
            );

            setStatus("Error");
            setIsRunning(false);

            return;
          }

          // -----------------------------------------------
          // PROGRAM EXIT
          // -----------------------------------------------

          if (message.type === "exit") {
            setIsRunning(false);

            if (message.code === 0) {
              addOutput(
                "\n=== Code Execution Successful ==="
              );

              setStatus("Finished");
            } else {
              addOutput(
                `\n=== Code Execution Failed (exit code ${message.code}) ===`,
                "error"
              );

              setStatus("Failed");
            }

            /*
             * Keep the WebSocket open.
             *
             * This is important because the user can run
             * another program using the same connection.
             */
            setTimeout(() => {
              if (
                socketRef.current === socket &&
                socket.readyState === WebSocket.OPEN
              ) {
                inputRef.current?.focus();
              }
            }, 50);

            return;
          }
        } catch {
          addOutput(event.data);
        }
      };

      // ------------------------------------------------------
      // ERROR
      // ------------------------------------------------------

      socket.onerror = () => {
        /*
         * Ignore errors from old sockets.
         */
        if (
          socketRef.current !== socket ||
          socketGenerationRef.current !== generation
        ) {
          return;
        }

        setConnected(false);
        setIsRunning(false);
        setStatus("Connection error");

        reject(
          new Error(
            "Could not connect to the compiler backend."
          )
        );
      };

      // ------------------------------------------------------
      // CLOSE
      // ------------------------------------------------------

      socket.onclose = () => {
        /*
         * THIS IS THE IMPORTANT FIX.
         *
         * An old socket may close AFTER a new socket
         * has already been assigned to socketRef.current.
         *
         * Therefore never blindly do:
         *
         * socketRef.current = null
         *
         * Only clear the ref if THIS socket is still
         * the current socket.
         */
        if (socketRef.current !== socket) {
          return;
        }

        socketRef.current = null;

        setConnected(false);

        /*
         * Do not automatically set Running false here
         * if the server has already sent an exit event.
         */
        if (isRunning) {
          setStatus("Disconnected");
        }
      };
    });
  }

  // ----------------------------------------------------------
  // RUN PROGRAM
  // ----------------------------------------------------------

  async function runProgram() {
    if (!code || !code.trim()) {
      setLines([
        {
          type: "error",
          text: "Please write some code before running.",
        },
      ]);

      setStatus("No code");
      setIsRunning(false);

      return;
    }

    /*
     * If the current socket is still connected, we can
     * reuse it instead of creating another WebSocket.
     *
     * This is even safer for repeated execution.
     */
    let socket = socketRef.current;

    try {
      // ------------------------------------------------------
      // REUSE EXISTING SOCKET
      // ------------------------------------------------------

      if (
        !socket ||
        socket.readyState !== WebSocket.OPEN
      ) {
        setStatus("Connecting...");

        socket = await connectSocket();
      }

      // ------------------------------------------------------
      // CLEAR PREVIOUS RUN
      // ------------------------------------------------------

      setLines([]);
      setCurrentInput("");

      setIsRunning(true);
      setStatus("Running...");

      /*
       * Send program to backend.
       */
      socket.send(
        JSON.stringify({
          type: "run",
          language,
          code,
        })
      );

      /*
       * Focus input after program starts.
       */
      setTimeout(() => {
        if (
          socketRef.current === socket &&
          socket.readyState === WebSocket.OPEN
        ) {
          inputRef.current?.focus();
        }
      }, 100);
    } catch (error) {
      console.error(
        "TechBlu terminal error:",
        error
      );

      setLines([
        {
          type: "error",
          text:
            error.message ||
            "Unable to connect to compiler backend.",
        },
      ]);

      setIsRunning(false);
      setStatus("Connection error");
    }
  }

  // ----------------------------------------------------------
  // SEND INPUT
  // ----------------------------------------------------------

  function sendInput() {
    const socket = socketRef.current;

    /*
     * IMPORTANT:
     * Do NOT reject empty input.
     *
     * Pressing Enter with an empty field must send "\n".
     */
    if (
      !socket ||
      socket.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    const input = currentInput;

    /*
     * Show user's input in terminal.
     */
    setLines((previous) => [
      ...previous,
      {
        type: "input",
        text: input,
      },
    ]);

    /*
     * Send input + newline.
     */
    try {
      socket.send(
        JSON.stringify({
          type: "input",
          data: `${input}\n`,
        })
      );
    } catch (error) {
      console.error(
        "Failed to send terminal input:",
        error
      );

      addOutput(
        "Failed to send input to the running program.",
        "error"
      );

      return;
    }

    /*
     * Clear input box.
     */
    setCurrentInput("");

    /*
     * Focus input again.
     */
    setTimeout(() => {
      if (
        socketRef.current === socket &&
        socket.readyState === WebSocket.OPEN
      ) {
        inputRef.current?.focus();
      }
    }, 0);
  }

  // ----------------------------------------------------------
  // KEYBOARD INPUT
  // ----------------------------------------------------------

  function handleInputKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();

      sendInput();
    }
  }

  // ----------------------------------------------------------
  // STOP PROGRAM
  // ----------------------------------------------------------

  function stopProgram() {
    const socket = socketRef.current;

    if (
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      try {
        socket.send(
          JSON.stringify({
            type: "stop",
          })
        );
      } catch (error) {
        console.error(
          "Failed to stop program:",
          error
        );
      }
    }

    setIsRunning(false);
    setStatus("Stopped");
    setCurrentInput("");

    addOutput(
      "\n=== Program Stopped ==="
    );

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  // ----------------------------------------------------------
  // CLEAR TERMINAL
  // ----------------------------------------------------------

  function clearTerminal() {
    setLines([]);
    setCurrentInput("");
    setStatus("Ready");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  // ----------------------------------------------------------
  // AUTO SCROLL
  // ----------------------------------------------------------

  useEffect(() => {
    const terminal =
      terminalRef.current;

    if (terminal) {
      terminal.scrollTop =
        terminal.scrollHeight;
    }
  }, [lines, currentInput]);

  // ----------------------------------------------------------
  // CLEANUP
  // ----------------------------------------------------------

  useEffect(() => {
    return () => {
      const socket =
        socketRef.current;

      /*
       * Invalidate all old socket callbacks.
       */
      socketGenerationRef.current += 1;

      if (socket) {
        try {
          if (
            socket.readyState ===
            WebSocket.OPEN
          ) {
            socket.send(
              JSON.stringify({
                type: "stop",
              })
            );
          }
        } catch {
          // Ignore cleanup errors.
        }

        try {
          socket.close();
        } catch {
          // Ignore cleanup errors.
        }
      }

      socketRef.current = null;
    };
  }, []);

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <section className="interactive-terminal-wrapper">

      {/* ====================================================
          TERMINAL TOOLBAR
      ==================================================== */}

      <div className="terminal-toolbar">

        <div className="terminal-title">

          <span className="terminal-dot" />

          <Terminal size={16} />

          <span>
            Terminal
          </span>

        </div>

        <div className="terminal-toolbar-actions">

          {/* RUN */}

          <button
            type="button"
            className="terminal-tool-button"
            onClick={runProgram}
            disabled={isRunning}
          >
            <Play size={14} />

            {isRunning
              ? "Running..."
              : "Run"}
          </button>

          {/* STOP */}

          <button
            type="button"
            className="terminal-tool-button"
            onClick={stopProgram}
            disabled={!isRunning}
          >
            <Square size={14} />

            Stop
          </button>

          {/* CLEAR */}

          <button
            type="button"
            className="terminal-tool-button"
            onClick={clearTerminal}
          >
            <RotateCcw size={14} />

            Clear
          </button>

        </div>

      </div>

      {/* ====================================================
          TERMINAL HEADER
      ==================================================== */}

      <div className="terminal-tabs">

        <div className="terminal-output-tab">

          <Terminal size={14} />

          Output

        </div>

        <span className="terminal-status">
          {status}
        </span>

      </div>

      {/* ====================================================
          TERMINAL CONTENT
      ==================================================== */}

      <div
        ref={terminalRef}
        className="terminal-content terminal-real-console"
        onClick={() => {
          inputRef.current?.focus();
        }}
      >

        {/* EMPTY STATE */}

        {lines.length === 0 &&
          !isRunning && (
            <div className="terminal-empty">

              <Terminal size={20} />

              <span>
                Output will appear here after you run the program.
              </span>

            </div>
          )}

        {/* OUTPUT */}

        {lines.map(
          (line, index) => (
            <div
              key={`${index}-${line.type}`}
              className={
                line.type === "input"
                  ? "terminal-line terminal-input-line"
                  : line.type === "error"
                  ? "terminal-line terminal-error-line"
                  : "terminal-line"
              }
            >
              {line.text}
            </div>
          )
        )}

        {/* LIVE INPUT */}

        {isRunning && (
          <div className="terminal-live-input">

            <span className="terminal-cursor-symbol">
              ›
            </span>

            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(event) =>
                setCurrentInput(
                  event.target.value
                )
              }
              onKeyDown={
                handleInputKeyDown
              }
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="terminal-hidden-input"
              aria-label="Terminal input"
            />

            <span className="terminal-cursor">

              {currentInput}

              <span className="terminal-caret" />

            </span>

          </div>
        )}

      </div>

    </section>
  );
}