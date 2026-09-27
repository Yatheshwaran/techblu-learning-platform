import React, { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

import {
  X,
  RotateCcw,
  Send,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Code2,
  Trophy,
  ArrowRight,
  Terminal,
  Maximize2,
  Minimize2,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import "./PracticeCompiler.css";

const COMPILER_API =
  import.meta.env.VITE_COMPILER_API || "http://localhost:5000";

/* -------------------------------------------------------
   LANGUAGE CONFIG
------------------------------------------------------- */

const LANGUAGE_CONFIG = {
  python: {
    name: "Python",
    monaco: "python",
    extension: "main.py",
    icon: "🐍",
    starter: `print("Hello, World!")`,
  },

  javascript: {
    name: "JavaScript",
    monaco: "javascript",
    extension: "main.js",
    icon: "JS",
    starter: `console.log("Hello, World!");`,
  },

  java: {
    name: "Java",
    monaco: "java",
    extension: "Main.java",
    icon: "☕",
    starter: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  },

  cpp: {
    name: "C++",
    monaco: "cpp",
    extension: "main.cpp",
    icon: "C++",
    starter: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!";
    return 0;
}`,
  },

  c: {
    name: "C",
    monaco: "c",
    extension: "main.c",
    icon: "C",
    starter: `#include <stdio.h>

int main() {
    printf("Hello, World!");
    return 0;
}`,
  },
};

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function cleanOutput(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/\r\n/g, "\n")
    .trim();
}

function getChallengeValue(challenge, keys, fallback = "") {
  for (const key of keys) {
    if (
      challenge &&
      challenge[key] !== undefined &&
      challenge[key] !== null &&
      challenge[key] !== ""
    ) {
      return challenge[key];
    }
  }

  return fallback;
}

function getLanguage(challenge, selectedLanguage) {
  const fromChallenge =
    challenge?.languages?.slug ||
    challenge?.language_slug ||
    challenge?.language ||
    selectedLanguage;

  return String(fromChallenge || "python").toLowerCase();
}

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export default function PracticeCompiler({
  challenge,
  selectedLanguage = "python",
  onClose,
  go,
  setChallenge,
}) {
  const languageId = getLanguage(challenge, selectedLanguage);

  const language =
    LANGUAGE_CONFIG[languageId] || LANGUAGE_CONFIG.python;

  const title = getChallengeValue(
    challenge,
    ["title", "name"],
    "Coding Practice"
  );

  const difficulty = getChallengeValue(
    challenge,
    ["difficulty", "level"],
    "Easy"
  );

  const description = getChallengeValue(
    challenge,
    ["description", "problem_description", "question"],
    "Solve the given programming problem."
  );

  const inputDescription = getChallengeValue(
    challenge,
    [
      "input_description",
      "input",
      "input_format",
      "inputFormat",
    ],
    "Read the required input from standard input."
  );

  const outputDescription = getChallengeValue(
    challenge,
    [
      "output_description",
      "output",
      "output_format",
      "outputFormat",
    ],
    "Print the required output."
  );

  const testInput = getChallengeValue(
    challenge,
    [
      "test_input",
      "testcase_input",
      "sample_input",
      "input_used_in_test",
      "testcase",
    ],
    ""
  );

  const expectedOutput = getChallengeValue(
    challenge,
    [
      "expected_output",
      "sample_output",
      "output_used_in_test",
      "test_output",
    ],
    ""
  );

  const hint = getChallengeValue(
    challenge,
    ["hint", "hints"],
    ""
  );

  const solution = getChallengeValue(
    challenge,
    ["solution", "answer", "solution_code"],
    ""
  );

  const questionId = challenge?.id;

  /* ---------------------------------------------------
     STATE
  --------------------------------------------------- */

  const [code, setCode] = useState(
    getChallengeValue(
      challenge,
      ["starter_code", "starterCode", "code"],
      language.starter
    )
  );

  const [activeTab, setActiveTab] = useState("problem");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [result, setResult] = useState(null);

  const [showHint, setShowHint] = useState(false);

  const [showSolution, setShowSolution] = useState(false);

  const [showTestCases, setShowTestCases] = useState(true);

  const [isMaximized, setIsMaximized] = useState(true);

  const [solved, setSolved] = useState(false);

  /* ---------------------------------------------------
     RESET WHEN QUESTION CHANGES
  --------------------------------------------------- */

  useEffect(() => {
    const newCode = getChallengeValue(
      challenge,
      ["starter_code", "starterCode", "code"],
      language.starter
    );

    setCode(newCode);
    setResult(null);
    setSolved(false);
    setShowHint(false);
    setShowSolution(false);
    setActiveTab("problem");
  }, [challenge, language.starter]);

  /* ---------------------------------------------------
     LOAD EXISTING PROGRESS
  --------------------------------------------------- */

  useEffect(() => {
    async function loadProgress() {
      if (!questionId) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from("user_progress")
          .select("completed")
          .eq("user_id", user.id)
          .eq("question_id", questionId)
          .maybeSingle();

        if (error) {
          console.error("Progress loading error:", error);
          return;
        }

        if (data?.completed) {
          setSolved(true);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadProgress();
  }, [questionId]);

  /* ---------------------------------------------------
     RESET
  --------------------------------------------------- */

  function handleReset() {
    const starter = getChallengeValue(
      challenge,
      ["starter_code", "starterCode", "code"],
      language.starter
    );

    setCode(starter);
    setResult(null);
  }

  /* ---------------------------------------------------
     SAVE PROGRESS
  --------------------------------------------------- */

  async function saveProgress() {
    if (!questionId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("user_progress")
        .upsert(
          {
            user_id: user.id,
            question_id: questionId,
            completed: true,
          },
          {
            onConflict: "user_id,question_id",
          }
        );

      if (error) {
        console.error("Progress save error:", error);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /* ---------------------------------------------------
     BACKEND EXECUTION
  --------------------------------------------------- */

   async function executeCode() {
  const payload = {
    language: languageId,
    sourceCode: code,
    stdin: testInput || "",
    expectedOutput: expectedOutput || "",
  };

  console.log("Practice Compiler URL:", `${COMPILER_API}/api/execute`);
  console.log("Practice Compiler Payload:", payload);

  try {
    const response = await fetch(
      `${COMPILER_API}/api/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      let message = `Compiler server returned ${response.status}.`;

      try {
        const errorData = await response.json();

        message =
          errorData?.error ||
          errorData?.message ||
          message;
      } catch {
        // Keep default message
      }

      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Practice compiler execution error:",
      error
    );

    throw new Error(
      error?.message ||
        "Cannot connect to the compiler backend."
    );
  }
}

  /* ---------------------------------------------------
     GET OUTPUT FROM BACKEND RESPONSE
  --------------------------------------------------- */

  function extractOutput(data) {
    if (!data) return "";

    return cleanOutput(
      data.output ??
        data.stdout ??
        data.result ??
        data.program_output ??
        data.execution_output ??
        ""
    );
  }

  /* ---------------------------------------------------
     SUBMIT
  --------------------------------------------------- */

  async function handleSubmit() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const data = await executeCode();

      const actualOutput = extractOutput(data);

      const expected = cleanOutput(expectedOutput);

      const compilerError =
        data?.error ||
        data?.stderr ||
        data?.compile_error ||
        data?.runtime_error;

      if (compilerError && !actualOutput) {
        setResult({
          status: "error",
          title: "Compilation Error",
          message: String(compilerError),
          output: "",
        });

        return;
      }

      const isCorrect =
        actualOutput === expected;

      if (isCorrect) {
        setSolved(true);

        await saveProgress();

        setResult({
          status: "correct",
          title: "Well Done! 🎉",
          message:
            "Your solution passed the test case.",
          output: actualOutput,
        });
      } else {
        setResult({
          status: "wrong",
          title: "Not Solved",
          message:
            "Your output does not match the expected output. Check your code and try again.",
          output: actualOutput,
          expected,
        });
      }
    } catch (error) {
      console.error(error);

      setResult({
        status: "error",
        title: "Execution Error",
        message:
          error?.message ||
          "Something went wrong while running your code.",
        output: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ---------------------------------------------------
     NEXT QUESTION
  --------------------------------------------------- */

  function handleNextQuestion() {
    /*
      If Practice.jsx provides a next-question function,
      use it.

      Otherwise return to Practice.
    */

    if (typeof setChallenge === "function") {
      /*
        Practice.jsx can optionally provide the next
        challenge through setChallenge.

        If the current Practice page does not provide
        the next question here, simply return to the list.
      */
    }

    if (typeof go === "function") {
      go("practice");
      return;
    }

    if (typeof onClose === "function") {
      onClose();
    }
  }

  /* ---------------------------------------------------
     TABS
  --------------------------------------------------- */

  const tabs = useMemo(
    () => [
      {
        id: "problem",
        label: "Problem",
      },
      {
        id: "solution",
        label: "Solution",
      },
      {
        id: "submissions",
        label: "Submissions",
      },
    ],
    []
  );

  /* ---------------------------------------------------
     RENDER
  --------------------------------------------------- */

  return (
    <div
      className={`practice-workspace ${
        isMaximized ? "practice-workspace-max" : ""
      }`}
    >
      {/* ===============================================
          TOP HEADER
      =============================================== */}

      <header className="practice-topbar">
        <div className="practice-brand">
          <Code2 size={19} />
          <span>CODING PRACTICE</span>
        </div>

        <div className="practice-topbar-right">
          <button
            className="practice-icon-btn"
            onClick={() =>
              setIsMaximized((value) => !value)
            }
            title={
              isMaximized
                ? "Restore"
                : "Maximize"
            }
          >
            {isMaximized ? (
              <Minimize2 size={18} />
            ) : (
              <Maximize2 size={18} />
            )}
          </button>

          <button
            className="practice-reset-btn"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            <RotateCcw size={17} />
            Reset
          </button>

          <button
            className="practice-submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Send size={17} />

            {isSubmitting
              ? "Running..."
              : "Submit Answer"}
          </button>

          {onClose && (
            <button
              className="practice-close-btn"
              onClick={onClose}
              title="Close practice"
            >
              <X size={19} />
            </button>
          )}
        </div>
      </header>

      {/* ===============================================
          MAIN SPLIT SCREEN
      =============================================== */}

      <div className="practice-main">
        {/* ===========================================
            LEFT PROBLEM PANEL
        =========================================== */}

        <aside className="practice-problem-panel">
          {/* Tabs */}

          <div className="practice-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={
                  activeTab === tab.id
                    ? "practice-tab active"
                    : "practice-tab"
                }
                onClick={() =>
                  setActiveTab(tab.id)
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Problem scroll area */}

          <div className="practice-problem-scroll">
            {activeTab === "problem" && (
              <>
                <div className="practice-problem-header">
                  <span
                    className={`difficulty-badge difficulty-${String(
                      difficulty
                    ).toLowerCase()}`}
                  >
                    {difficulty}
                  </span>

                  {solved && (
                    <span className="solved-badge">
                      <CheckCircle2 size={15} />
                      Solved
                    </span>
                  )}
                </div>

                <h1 className="practice-title">
                  {title}
                </h1>

                <section className="problem-section">
                  <h3>Problem</h3>
                  <p>{description}</p>
                </section>

                <section className="problem-section">
                  <h3>Input</h3>
                  <p>{inputDescription}</p>
                </section>

                <section className="problem-section">
                  <h3>Output</h3>
                  <p>{outputDescription}</p>
                </section>

                <section className="problem-section">
                  <h3>Input used in test:</h3>

                  <pre className="test-input-box">
                    {testInput || "No testcase input"}
                  </pre>
                </section>

                <section className="problem-section">
                  <h3>Expected Output:</h3>

                  <pre className="expected-output-box">
                    {expectedOutput ||
                      "No expected output"}
                  </pre>
                </section>

                <section className="problem-important">
                  <strong>Important:</strong>

                  <p>
                    Your code must produce the correct
                    result for other valid test values
                    as well.
                  </p>
                </section>

                {/* Hint */}

                <div className="dropdown-section">
                  <button
                    className="dropdown-btn"
                    onClick={() =>
                      setShowHint((value) => !value)
                    }
                  >
                    <span>
                      <Lightbulb size={16} />
                      Hint
                    </span>

                    {showHint ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>

                  {showHint && (
                    <div className="dropdown-content">
                      {hint ||
                        "Try to break the problem into smaller steps."}
                    </div>
                  )}
                </div>

                {/* Solution */}

                <div className="dropdown-section">
                  <button
                    className="dropdown-btn"
                    onClick={() =>
                      setShowSolution(
                        (value) => !value
                      )
                    }
                  >
                    <span>
                      <Code2 size={16} />
                      Solution
                    </span>

                    {showSolution ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>

                  {showSolution && (
                    <div className="dropdown-content solution-content">
                      <pre>
                        {solution ||
                          "Solution is not available."}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="problem-bottom-space" />
              </>
            )}

            {activeTab === "solution" && (
              <div className="tab-page">
                <h2>Solution</h2>

                {solution ? (
                  <pre className="solution-code">
                    {solution}
                  </pre>
                ) : (
                  <p>
                    Submit your solution first or use
                    the Hint section.
                  </p>
                )}
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="tab-page">
                <h2>Submissions</h2>

                {solved ? (
                  <div className="submission-success">
                    <CheckCircle2 size={20} />
                    <div>
                      <strong>Accepted</strong>
                      <p>
                        This question has been solved.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>
                    No successful submission yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ===========================================
            RIGHT EDITOR PANEL
        =========================================== */}

        <section className="practice-editor-panel">
          {/* Editor top bar */}

          <div className="editor-header">
            <div className="editor-file">
              <span className="python-file-icon">
                {language.icon}
              </span>

              <span>{language.extension}</span>
            </div>

            <span className="editor-label">
              Monaco Editor
            </span>
          </div>

          {/* Monaco */}

          <div className="monaco-container">
            <Editor
              height="100%"
              width="100%"
              language={language.monaco}
              value={code}
              onChange={(value) =>
                setCode(value ?? "")
              }
              theme="vs-dark"
              options={{
                automaticLayout: true,

                minimap: {
                  enabled: true,
                },

                fontSize: 15,

                lineHeight: 23,

                tabSize: 4,

                insertSpaces: true,

                autoIndent: "full",

                autoIndentOnPaste: true,

                wordWrap: "off",

                scrollBeyondLastLine: false,

                smoothScrolling: true,

                cursorBlinking: "smooth",

                padding: {
                  top: 12,
                  bottom: 12,
                },

                renderWhitespace: "selection",

                scrollbar: {
                  vertical: "auto",
                  horizontal: "auto",
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12,
                },

                suggestOnTriggerCharacters: true,

                quickSuggestions: true,

                folding: true,

                bracketPairColorization: {
                  enabled: true,
                },
              }}
            />
          </div>

          {/* =========================================
              TEST CASE RESULT
          ========================================= */}

          <div
            className={`practice-test-panel ${
              showTestCases
                ? "test-panel-open"
                : "test-panel-closed"
            }`}
          >
            <button
              className="test-panel-header"
              onClick={() =>
                setShowTestCases(
                  (value) => !value
                )
              }
            >
              <div>
                <Terminal size={16} />

                <span>Test Cases</span>
              </div>

              {showTestCases ? (
                <ChevronDown size={17} />
              ) : (
                <ChevronUp size={17} />
              )}
            </button>

            {showTestCases && (
              <div className="test-panel-body">
                {!result && (
                  <div className="test-empty">
                    <span>
                      Run your code to see test case
                      results.
                    </span>
                  </div>
                )}

                {result?.status ===
                  "correct" && (
                  <div className="result-correct">
                    <div className="result-heading">
                      <CheckCircle2 size={20} />

                      <div>
                        <strong>
                          {result.title}
                        </strong>

                        <p>
                          {result.message}
                        </p>
                      </div>
                    </div>

                    <div className="result-output">
                      <span>
                        Your Output
                      </span>

                      <pre>
                        {result.output ||
                          "(empty output)"}
                      </pre>
                    </div>

                    <button
                      className="next-question-btn"
                      onClick={
                        handleNextQuestion
                      }
                    >
                      Next Question
                      <ArrowRight size={17} />
                    </button>
                  </div>
                )}

                {result?.status ===
                  "wrong" && (
                  <div className="result-wrong">
                    <div className="result-heading">
                      <XCircle size={20} />

                      <div>
                        <strong>
                          {result.title}
                        </strong>

                        <p>
                          {result.message}
                        </p>
                      </div>
                    </div>

                    <div className="result-comparison">
                      <div>
                        <span>Your Output</span>

                        <pre>
                          {result.output ||
                            "(empty output)"}
                        </pre>
                      </div>

                      <div>
                        <span>Expected Output</span>

                        <pre>
                          {result.expected ||
                            "(empty output)"}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {result?.status ===
                  "error" && (
                  <div className="result-error">
                    <div className="result-heading">
                      <XCircle size={20} />

                      <div>
                        <strong>
                          {result.title}
                        </strong>

                        <p>
                          {result.message}
                        </p>
                      </div>
                    </div>
                  </div>
                  )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}