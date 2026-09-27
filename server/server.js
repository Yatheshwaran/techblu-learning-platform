import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const JUDGE0_URL =
  process.env.JUDGE0_URL || "https://ce.judge0.com";

const languageIds = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
  c: 50,
};

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json({ limit: "100kb" }));

/* =========================================================
   JUDGE0
========================================================= */

function getJudge0Headers() {
  const headers = {
    "Content-Type": "application/json",
  };

  if (process.env.JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"] =
      process.env.JUDGE0_API_KEY;
  }

  if (process.env.JUDGE0_HOST) {
    headers["X-RapidAPI-Host"] =
      process.env.JUDGE0_HOST;
  }

  return headers;
}

/* =========================================================
   HEALTH
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TechBlu compiler backend is running",
  });
});

/* =========================================================
   JUDGE0 EXECUTION
   Mainly used for Practice Submit
========================================================= */

app.post("/api/execute", async (req, res) => {
  try {
    const {
      language,
      sourceCode,
      stdin = "",
      expectedOutput = "",
    } = req.body;

    if (!language || !languageIds[language]) {
      return res.status(400).json({
        success: false,
        error: "Unsupported programming language",
      });
    }

    if (!sourceCode || !sourceCode.trim()) {
      return res.status(400).json({
        success: false,
        error: "Source code is required",
      });
    }

    const submissionResponse = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
      {
        method: "POST",
        headers: getJudge0Headers(),
        body: JSON.stringify({
          language_id: languageIds[language],
          source_code: sourceCode,
          stdin,
          expected_output:
            expectedOutput || undefined,
          cpu_time_limit: 3,
          wall_time_limit: 5,
          memory_limit: 128000,
        }),
      }
    );

    if (!submissionResponse.ok) {
      const errorText =
        await submissionResponse.text();

      return res.status(502).json({
        success: false,
        error:
          "Could not submit code to Judge0",
        details: errorText,
      });
    }

    const submission =
      await submissionResponse.json();

    const token = submission.token;

    if (!token) {
      return res.status(502).json({
        success: false,
        error:
          "Judge0 did not return a submission token",
      });
    }

    let result = null;

    for (
      let attempt = 0;
      attempt < 30;
      attempt++
    ) {
      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      const resultResponse = await fetch(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
        {
          method: "GET",
          headers: getJudge0Headers(),
        }
      );

      if (!resultResponse.ok) {
        continue;
      }

      result =
        await resultResponse.json();

      if (
        result.status &&
        result.status.id > 2
      ) {
        break;
      }
    }

    if (
      !result ||
      !result.status ||
      result.status.id <= 2
    ) {
      return res.status(504).json({
        success: false,
        error:
          "Code execution timed out",
      });
    }

    res.json({
      success: true,
      status: result.status,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      compile_output:
        result.compile_output || "",
      message: result.message || "",
      time: result.time || null,
      memory: result.memory || null,
      exit_code:
        result.exit_code ?? null,
    });
  } catch (error) {
    console.error(
      "TECHBLU JUDGE0 ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      error:
        "Compiler backend error",
      details: error.message,
    });
  }
});

/* =========================================================
   DEVELOPMENT INTERACTIVE TERMINAL
========================================================= */

const interactiveProcesses = new Map();

/* =========================================================
   CREATE TEMP DIRECTORY
========================================================= */

function createTempDirectory() {
  return fs.mkdtempSync(
    path.join(os.tmpdir(), "techblu-")
  );
}

/* =========================================================
   REMOVE TEMP DIRECTORY
========================================================= */

function removeTempDirectory(tempDir) {
  if (!tempDir) {
    return;
  }

  try {
    fs.rmSync(tempDir, {
      recursive: true,
      force: true,
    });
  } catch (error) {
    console.error(
      "TechBlu temp directory cleanup error:",
      error.message
    );
  }
}

/* =========================================================
   WEBSOCKET SEND
========================================================= */

function send(ws, payload) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

/* =========================================================
   PROCESS CLEANUP
========================================================= */

function cleanupProcess(processId) {
  const item =
    interactiveProcesses.get(
      processId
    );

  if (!item) {
    return;
  }

  interactiveProcesses.delete(
    processId
  );

  removeTempDirectory(
    item.tempDir
  );
}

/* =========================================================
   STOP PROCESS
========================================================= */

function stopInteractiveProcess(
  processId
) {
  const item =
    interactiveProcesses.get(
      processId
    );

  if (!item) {
    return;
  }

  try {
    if (
      item.process &&
      !item.process.killed
    ) {
      item.process.kill();
    }
  } catch (error) {
    console.error(
      "Could not stop process:",
      error.message
    );
  }

  cleanupProcess(processId);
}

/* =========================================================
   ATTACH PROGRAM EVENTS
========================================================= */

function attachProcess(
  ws,
  processId,
  childProcess,
  onFinished
) {
  /*
    Prevent error + close from calling
    the completion callback twice.
  */
  let finished = false;

  const finishOnce = () => {
    if (finished) {
      return;
    }

    finished = true;

    cleanupProcess(processId);

    if (onFinished) {
      onFinished(processId);
    }
  };

  /* =======================================================
     STDOUT
  ======================================================= */

  if (childProcess.stdout) {
    childProcess.stdout.on(
      "data",
      (data) => {
        send(ws, {
          type: "output",
          data: data.toString(),
        });
      }
    );
  }

  /* =======================================================
     STDERR
  ======================================================= */

  if (childProcess.stderr) {
    childProcess.stderr.on(
      "data",
      (data) => {
        send(ws, {
          type: "output",
          data: data.toString(),
        });
      }
    );
  }

  /* =======================================================
     SPAWN ERROR
  ======================================================= */

  childProcess.on(
    "error",
    (error) => {
      send(ws, {
        type: "error",
        message: error.message,
      });

      /*
        Do not finish here.

        Node may emit close after error.
        The close handler performs final cleanup.
      */
    }
  );

  /* =======================================================
     PROCESS CLOSED
  ======================================================= */

  childProcess.on(
    "close",
    (code) => {
      send(ws, {
        type: "exit",
        code: code ?? 0,
      });

      finishOnce();
    }
  );
}

/* =========================================================
   START INTERACTIVE PROCESS
========================================================= */

function startInteractiveProcess(
  ws,
  processId,
  language,
  code,
  onFinished
) {
  const tempDir =
    createTempDirectory();

  let command;
  let args = [];
  let sourceFile;

  /* =======================================================
     CREATE SOURCE FILE
  ======================================================= */

  try {
    /* =====================================================
       PYTHON
    ===================================================== */

    if (language === "python") {
      sourceFile = path.join(
        tempDir,
        "main.py"
      );

      fs.writeFileSync(
        sourceFile,
        code,
        "utf8"
      );

      command = "python";
      args = [sourceFile];
    }

    /* =====================================================
       JAVASCRIPT
    ===================================================== */

    else if (
      language === "javascript"
    ) {
      sourceFile = path.join(
        tempDir,
        "main.js"
      );

      fs.writeFileSync(
        sourceFile,
        code,
        "utf8"
      );

      command = "node";
      args = [sourceFile];
    }

    /* =====================================================
       C
    ===================================================== */

    else if (language === "c") {
      sourceFile = path.join(
        tempDir,
        "main.c"
      );

      fs.writeFileSync(
        sourceFile,
        code,
        "utf8"
      );

      command = "gcc";

      args = [
        sourceFile,
        "-o",
        path.join(
          tempDir,
          "main.exe"
        ),
      ];
    }

    /* =====================================================
       C++
    ===================================================== */

    else if (language === "cpp") {
      sourceFile = path.join(
        tempDir,
        "main.cpp"
      );

      fs.writeFileSync(
        sourceFile,
        code,
        "utf8"
      );

      command = "g++";

      args = [
        sourceFile,
        "-o",
        path.join(
          tempDir,
          "main.exe"
        ),
      ];
    }

    /* =====================================================
       JAVA
    ===================================================== */

    else if (language === "java") {
      sourceFile = path.join(
        tempDir,
        "Main.java"
      );

      fs.writeFileSync(
        sourceFile,
        code,
        "utf8"
      );

      command = "javac";
      args = [sourceFile];
    }

    /* =====================================================
       UNSUPPORTED LANGUAGE
    ===================================================== */

    else {
      removeTempDirectory(
        tempDir
      );

      send(ws, {
        type: "error",
        message:
          "Unsupported programming language.",
      });

      if (onFinished) {
        onFinished(processId);
      }

      return false;
    }
  } catch (error) {
    removeTempDirectory(
      tempDir
    );

    send(ws, {
      type: "error",
      message: error.message,
    });

    if (onFinished) {
      onFinished(processId);
    }

    return false;
  }

  /* =========================================================
     C / C++ COMPILATION
  ========================================================= */

  if (
    language === "c" ||
    language === "cpp"
  ) {
    const compiler =
      spawn(
        command,
        args,
        {
          cwd: tempDir,
          windowsHide: true,
        }
      );

    interactiveProcesses.set(
      processId,
      {
        process: compiler,
        tempDir,
        language,
        stage: "compile",
      }
    );

    let compilerFinished = false;

    const finishCompilerFailure =
      () => {
        if (compilerFinished) {
          return;
        }

        compilerFinished = true;

        cleanupProcess(
          processId
        );

        if (onFinished) {
          onFinished(processId);
        }
      };

    /* =====================================================
       COMPILER STDOUT
    ===================================================== */

    compiler.stdout.on(
      "data",
      (data) => {
        send(ws, {
          type: "output",
          data: data.toString(),
        });
      }
    );

    /* =====================================================
       COMPILER STDERR
    ===================================================== */

    compiler.stderr.on(
      "data",
      (data) => {
        send(ws, {
          type: "output",
          data: data.toString(),
        });
      }
    );

    /* =====================================================
       COMPILER ERROR
    ===================================================== */

    compiler.on(
      "error",
      (error) => {
        send(ws, {
          type: "error",
          message: error.message,
        });

        finishCompilerFailure();
      }
    );

    /* =====================================================
       COMPILER CLOSED
    ===================================================== */

    compiler.on(
      "close",
      (exitCode) => {
        if (compilerFinished) {
          return;
        }

        /*
          Process may already have been
          stopped and cleaned.
        */
        if (
          !interactiveProcesses.has(
            processId
          )
        ) {
          return;
        }

        /* =================================================
           COMPILATION FAILED
        ================================================= */

        if (exitCode !== 0) {
          compilerFinished = true;

          send(ws, {
            type: "exit",
            code: exitCode,
            stage: "compile",
          });

          cleanupProcess(
            processId
          );

          if (onFinished) {
            onFinished(processId);
          }

          return;
        }

        /* =================================================
           COMPILATION SUCCESS
        ================================================= */

        const executable =
          path.join(
            tempDir,
            "main.exe"
          );

        const program =
          spawn(
            executable,
            [],
            {
              cwd: tempDir,
              windowsHide: true,
            }
          );

        interactiveProcesses.set(
          processId,
          {
            process: program,
            tempDir,
            language,
            stage: "run",
          }
        );

        send(ws, {
          type: "started",
          processId,
          language,
        });

        attachProcess(
          ws,
          processId,
          program,
          onFinished
        );
      }
    );

    return true;
  }

  /* =========================================================
     JAVA COMPILATION
  ========================================================= */

  if (language === "java") {
    const compiler =
      spawn(
        "javac",
        [sourceFile],
        {
          cwd: tempDir,
          windowsHide: true,
        }
      );

    interactiveProcesses.set(
      processId,
      {
        process: compiler,
        tempDir,
        language,
        stage: "compile",
      }
    );

    let compilerFinished = false;

    const finishCompilerFailure =
      () => {
        if (compilerFinished) {
          return;
        }

        compilerFinished = true;

        cleanupProcess(
          processId
        );

        if (onFinished) {
          onFinished(processId);
        }
      };

    /* =====================================================
       JAVA COMPILER STDOUT
    ===================================================== */

    compiler.stdout.on(
      "data",
      (data) => {
        send(ws, {
          type: "output",
          data: data.toString(),
        });
      }
    );

    /* =====================================================
       JAVA COMPILER STDERR
    ===================================================== */

    compiler.stderr.on(
      "data",
      (data) => {
        send(ws, {
          type: "output",
          data: data.toString(),
        });
      }
    );

    /* =====================================================
       JAVA COMPILER ERROR
    ===================================================== */

    compiler.on(
      "error",
      (error) => {
        send(ws, {
          type: "error",
          message: error.message,
        });

        finishCompilerFailure();
      }
    );

    /* =====================================================
       JAVA COMPILER CLOSED
    ===================================================== */

    compiler.on(
      "close",
      (exitCode) => {
        if (compilerFinished) {
          return;
        }

        if (
          !interactiveProcesses.has(
            processId
          )
        ) {
          return;
        }

        /* =================================================
           JAVA COMPILATION FAILED
        ================================================= */

        if (exitCode !== 0) {
          compilerFinished = true;

          send(ws, {
            type: "exit",
            code: exitCode,
            stage: "compile",
          });

          cleanupProcess(
            processId
          );

          if (onFinished) {
            onFinished(processId);
          }

          return;
        }

        /* =================================================
           JAVA COMPILATION SUCCESS
        ================================================= */

        const program =
          spawn(
            "java",
            [
              "-cp",
              tempDir,
              "Main",
            ],
            {
              cwd: tempDir,
              windowsHide: true,
            }
          );

        interactiveProcesses.set(
          processId,
          {
            process: program,
            tempDir,
            language,
            stage: "run",
          }
        );

        send(ws, {
          type: "started",
          processId,
          language,
        });

        attachProcess(
          ws,
          processId,
          program,
          onFinished
        );
      }
    );

    return true;
  }

  /* =========================================================
     PYTHON / JAVASCRIPT
  ========================================================= */

  const program =
    spawn(
      command,
      args,
      {
        cwd: tempDir,
        windowsHide: true,
      }
    );

  interactiveProcesses.set(
    processId,
    {
      process: program,
      tempDir,
      language,
      stage: "run",
    }
  );

  send(ws, {
    type: "started",
    processId,
    language,
  });

  attachProcess(
    ws,
    processId,
    program,
    onFinished
  );

  return true;
}

/* =========================================================
   HTTP + WEBSOCKET ON SAME PORT
========================================================= */

const server =
  http.createServer(app);

const wss =
  new WebSocketServer({
    server,
  });

wss.on(
  "connection",
  (ws) => {
    /*
      Process currently belonging
      to this browser connection.
    */
    let activeProcessId = null;

    send(ws, {
      type: "status",
      message:
        "TechBlu Interactive Terminal connected.",
    });

    /* =====================================================
       WEBSOCKET MESSAGE
    ===================================================== */

    ws.on(
      "message",
      (rawMessage) => {
        try {
          const message =
            JSON.parse(
              rawMessage.toString()
            );

          /* =================================================
             RUN
          ================================================= */

          if (
            message.type === "run"
          ) {
            /*
              Check for an actual running
              process.
            */

            if (activeProcessId) {
              const existingProcess =
                interactiveProcesses.get(
                  activeProcessId
                );

              if (existingProcess) {
                send(ws, {
                  type: "error",
                  message:
                    "A program is already running.",
                });

                return;
              }

              /*
                The ID is stale.
              */
              activeProcessId =
                null;
            }

            /*
              IMPORTANT:

              Generate the process ID BEFORE
              starting the child process.

              This prevents a very fast program
              from finishing before the ID is
              assigned to activeProcessId.
            */

            const processId =
              crypto.randomUUID();

            activeProcessId =
              processId;

            const started =
              startInteractiveProcess(
                ws,
                processId,
                message.language,
                message.code,
                (finishedProcessId) => {
                  /*
                    Only clear the process ID
                    if it is still the same process.
                  */

                  if (
                    activeProcessId ===
                    finishedProcessId
                  ) {
                    activeProcessId =
                      null;

                    send(ws, {
                      type: "status",
                      message:
                        "Program finished. Ready to run again.",
                    });
                  }
                }
              );

            /*
              If starting failed,
              clear the active ID.
            */

            if (!started) {
              activeProcessId =
                null;
            }

            return;
          }

          /* =================================================
             INPUT
          ================================================= */

          if (
            message.type === "input"
          ) {
            if (
              !activeProcessId
            ) {
              return;
            }

            const item =
              interactiveProcesses.get(
                activeProcessId
              );

            if (
              item?.process &&
              item.process.stdin &&
              item.process.stdin.writable
            ) {
              item.process.stdin.write(
                message.data
              );
            }

            return;
          }

          /* =================================================
             STOP
          ================================================= */

          if (
            message.type === "stop"
          ) {
            if (
              !activeProcessId
            ) {
              return;
            }

            const processId =
              activeProcessId;

            stopInteractiveProcess(
              processId
            );

            activeProcessId =
              null;

            send(ws, {
              type: "status",
              message:
                "Program stopped.",
            });

            return;
          }

          /* =================================================
             CLEAR
          ================================================= */

          if (
            message.type === "clear"
          ) {
            send(ws, {
              type: "clear",
            });

            return;
          }
        } catch (error) {
          send(ws, {
            type: "error",
            message: error.message,
          });
        }
      }
    );

    /* =====================================================
       WEBSOCKET CLOSE
    ===================================================== */

    ws.on(
      "close",
      () => {
        if (activeProcessId) {
          stopInteractiveProcess(
            activeProcessId
          );

          activeProcessId =
            null;
        }
      }
    );

    /* =====================================================
       WEBSOCKET ERROR
    ===================================================== */

    ws.on(
      "error",
      (error) => {
        console.error(
          "TechBlu WebSocket error:",
          error.message
        );
      }
    );
  }
);

/* =========================================================
   START SERVER
========================================================= */

server.listen(
  PORT,
  () => {
    console.log(
      `TechBlu compiler backend running at http://localhost:${PORT}`
    );

    console.log(
      `TechBlu WebSocket terminal running at ws://localhost:${PORT}`
    );
  }
);