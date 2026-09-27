import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Code2,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/Authcontext";

const languages = [
  {
    id: 2,
    name: "Python",
    slug: "python",
    icon: "🐍",
  },
  {
    id: 3,
    name: "JavaScript",
    slug: "javascript",
    icon: "JS",
  },
  {
    id: 4,
    name: "Java",
    slug: "java",
    icon: "☕",
  },
  {
    id: 5,
    name: "C++",
    slug: "cpp",
    icon: "⚙️",
  },
  {
    id: 6,
    name: "C",
    slug: "c",
    icon: "⌘",
  },
];

export default function Practice({ go, setChallenge }) {
  const { user } = useAuth();

  const [selectedLanguage, setSelectedLanguage] = useState(2);
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState([]);

  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [error, setError] = useState("");

  const selectedLanguageInfo =
    languages.find((item) => item.id === selectedLanguage) ||
    languages[0];

  const loadQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    setError("");

    const { data, error: questionsError } = await supabase
      .from("questions")
      .select(`
        *,
        languages (
          id,
          name,
          slug
        )
      `)
      .eq("language_id", selectedLanguage)
      .order("id", { ascending: true });

    if (questionsError) {
      console.error("Question loading error:", questionsError);
      setQuestions([]);
      setError(questionsError.message);
    } else {
      setQuestions(data || []);
    }

    setLoadingQuestions(false);
  }, [selectedLanguage]);

  const loadProgress = useCallback(async () => {
    if (!user?.id) {
      setProgress([]);
      return;
    }

    setLoadingProgress(true);

    const { data, error: progressError } = await supabase
      .from("user_progress")
      .select("question_id, completed")
      .eq("user_id", user.id);

    if (progressError) {
      console.error("Progress loading error:", progressError);
      setProgress([]);
    } else {
      setProgress(data || []);
    }

    setLoadingProgress(false);
  }, [user?.id]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  function isSolved(questionId) {
    return progress.some(
      (item) =>
        Number(item.question_id) === Number(questionId) &&
        item.completed === true
    );
  }

  function openQuestion(question) {
    const languageSlug =
      question.languages?.slug ||
      selectedLanguageInfo.slug ||
      "python";

    const languageName =
      question.languages?.name ||
      selectedLanguageInfo.name ||
      "Python";

    const selectedChallenge = {
      ...question,

      language_slug: languageSlug,
      language_name: languageName,

      starter_code: question.starter_code || "",
      sample_input: question.sample_input || "",
      expected_output: question.expected_output || "",
      hint: question.hint || "",
      solution_code: question.solution_code || "",
    };

    if (typeof setChallenge === "function") {
      setChallenge(selectedChallenge);
    }

    if (typeof go === "function") {
      go("practiceCompiler");
    }
  }

  function openFreeCompiler() {
    if (typeof setChallenge === "function") {
      setChallenge(null);
    }

    if (typeof go === "function") {
      go("Compiler");
    }
  }

  async function handleRefresh() {
    await Promise.all([loadQuestions(), loadProgress()]);
  }

  const solvedCount = questions.filter((question) =>
    isSolved(question.id)
  ).length;

  return (
    <main className="page">
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CODING PRACTICE</span>

              <h1>Practice. Solve. Improve.</h1>

              <p>
                Choose a programming language and solve practical coding
                questions in the TechBlu compiler.
              </p>
            </div>

            <button
              type="button"
              className="practice-refresh-button"
              onClick={handleRefresh}
              disabled={loadingQuestions || loadingProgress}
              title="Refresh questions and progress"
            >
              <RefreshCw
                size={17}
                className={
                  loadingQuestions || loadingProgress
                    ? "spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>

          <div className="practice-summary">
            <div className="practice-summary-card">
              <Code2 size={20} />

              <div>
                <strong>{questions.length}</strong>
                <span>Questions</span>
              </div>
            </div>

            <div className="practice-summary-card">
              <CheckCircle2 size={20} />

              <div>
                <strong>{solvedCount}</strong>
                <span>Solved</span>
              </div>
            </div>

            <div className="practice-summary-card">
              <div className="language-summary-icon">
                {selectedLanguageInfo.icon}
              </div>

              <div>
                <strong>{selectedLanguageInfo.name}</strong>
                <span>Selected language</span>
              </div>
            </div>
          </div>

          <div className="practice-languages">
            {languages.map((language) => {
              const isActive = selectedLanguage === language.id;

              return (
                <button
                  key={language.id}
                  type="button"
                  className={
                    isActive
                      ? "practice-language active"
                      : "practice-language"
                  }
                  onClick={() => setSelectedLanguage(language.id)}
                >
                  <span className="language-icon">
                    {language.icon}
                  </span>

                  <span>{language.name}</span>
                </button>
              );
            })}
          </div>

          <div className="practice-toolbar">
            <div>
              <h2>{selectedLanguageInfo.name} Practice</h2>

              <p>
                Select a question to open it in the compiler.
              </p>
            </div>

            <button
              type="button"
              className="practice-free-compiler-button"
              onClick={openFreeCompiler}
            >
              Open Free Compiler →
            </button>
          </div>

          {loadingQuestions && (
            <div className="practice-message">
              <LoaderCircle className="spin" size={22} />

              <span>Loading {selectedLanguageInfo.name} questions...</span>
            </div>
          )}

          {!loadingQuestions && error && (
            <div className="practice-message error">
              <div>
                <h3>Could not load questions</h3>

                <p>{error}</p>
              </div>

              <button
                type="button"
                className="practice-retry-button"
                onClick={loadQuestions}
              >
                Try again
              </button>
            </div>
          )}

          {!loadingQuestions && !error && questions.length === 0 && (
            <div className="practice-message">
              <Code2 size={28} />

              <div>
                <h3>No questions yet</h3>

                <p>
                  Questions for {selectedLanguageInfo.name} will appear
                  here soon.
                </p>
              </div>
            </div>
          )}

          {!loadingQuestions && !error && questions.length > 0 && (
            <div className="practice-question-list">
              {questions.map((question, index) => {
                const solved = isSolved(question.id);

                const difficultyClass =
                  question.difficulty === "Easy"
                    ? "easy"
                    : question.difficulty === "Medium"
                    ? "medium"
                    : "hard";

                return (
                  <article
                    key={question.id}
                    className={
                      solved
                        ? "practice-question-card solved-card"
                        : "practice-question-card"
                    }
                  >
                    <div className="question-top">
                      <span className="question-number">
                        Question {index + 1}
                      </span>

                      <span
                        className={`difficulty ${difficultyClass}`}
                      >
                        {question.difficulty || "Practice"}
                      </span>
                    </div>

                    <h2>{question.title}</h2>

                    <p>{question.description}</p>

                    <div className="question-meta">
                      <span>
                        {question.languages?.name ||
                          selectedLanguageInfo.name}
                      </span>

                      {question.topic && (
                        <span>{question.topic}</span>
                      )}
                    </div>

                    <div className="question-bottom">
                      {solved ? (
                        <span className="solved">
                          <CheckCircle2 size={17} />
                          Solved
                        </span>
                      ) : (
                        <span className="not-solved">
                          Not solved
                        </span>
                      )}

                      <button
                        type="button"
                        className="solve-button"
                        onClick={() => openQuestion(question)}
                      >
                        Solve →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}