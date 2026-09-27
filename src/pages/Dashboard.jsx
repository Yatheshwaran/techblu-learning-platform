import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Trophy,
  BookOpen,
  BarChart3,
  LogOut,
  Edit3,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/Authcontext";


// ---------------------------------------------------------
// Default languages used by your TechBlu database
// ---------------------------------------------------------

const DEFAULT_LANGUAGES = [
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


// ---------------------------------------------------------
// Dashboard
// ---------------------------------------------------------

export default function Dashboard({
  languages = [],
}) {
  const { user, logout } = useAuth();

  // -------------------------------------------------------
  // State
  // -------------------------------------------------------

  const [questions, setQuestions] = useState([]);
  const [progressRows, setProgressRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const [name, setName] = useState("TechBlu Learner");

  // -------------------------------------------------------
  // Languages
  // -------------------------------------------------------

  const availableLanguages =
    languages && languages.length > 0
      ? languages
      : DEFAULT_LANGUAGES;


  // -------------------------------------------------------
  // Load Dashboard Data
  // -------------------------------------------------------

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) {
        setQuestions([]);
        setProgressRows([]);
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        // -----------------------------------------------
        // Load all questions
        // -----------------------------------------------

        const {
          data: questionData,
          error: questionError,
        } = await supabase
          .from("questions")
          .select(`
            id,
            title,
            difficulty,
            language_id,
            created_at,
            languages (
              id,
              name,
              slug
            )
          `)
          .order("id", {
            ascending: true,
          });

        if (questionError) {
          throw questionError;
        }


        // -----------------------------------------------
        // Load current user's progress
        // -----------------------------------------------

        const {
          data: progressData,
          error: progressError,
        } = await supabase
          .from("user_progress")
          .select(`
            question_id,
            completed,
            completed_at
          `)
          .eq("user_id", user.id);

        if (progressError) {
          throw progressError;
        }


        setQuestions(questionData || []);
        setProgressRows(progressData || []);
      } catch (err) {
        console.error("Dashboard loading error:", err);

        setError(
          err?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );


  // -------------------------------------------------------
  // Load dashboard when user changes
  // -------------------------------------------------------

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);


  // -------------------------------------------------------
  // Display name
  // -------------------------------------------------------

  const userMetadata = user?.user_metadata || {};

  const metadataName =
    userMetadata.username ||
    userMetadata.name ||
    "";

  const emailName =
    user?.email?.split("@")[0] || "";

  const savedLocalName =
    localStorage.getItem("techblu-username") || "";

  const displayName =
    metadataName ||
    savedLocalName ||
    emailName ||
    "TechBlu Learner";


  // -------------------------------------------------------
  // Keep input synchronized with current name
  // -------------------------------------------------------

  useEffect(() => {
    setName(displayName);
  }, [displayName]);


  // -------------------------------------------------------
  // Completed questions
  // -------------------------------------------------------

  const completedProgress = useMemo(() => {
    return progressRows.filter(
      (item) => item.completed === true
    );
  }, [progressRows]);


  // -------------------------------------------------------
  // Solved question IDs
  // -------------------------------------------------------

  const solvedQuestionIds = useMemo(() => {
    return new Set(
      completedProgress.map((item) =>
        Number(item.question_id)
      )
    );
  }, [completedProgress]);


  // -------------------------------------------------------
  // Overall statistics
  // -------------------------------------------------------

  const solvedCount = solvedQuestionIds.size;

  const totalQuestions = questions.length;

  const overallPercent =
    totalQuestions > 0
      ? Math.round(
          (solvedCount / totalQuestions) * 100
        )
      : 0;


  // -------------------------------------------------------
  // Level calculation
  // -------------------------------------------------------

  const level = useMemo(() => {
    if (solvedCount < 5) {
      return "Beginner";
    }

    if (solvedCount < 15) {
      return "Learner";
    }

    if (solvedCount < 30) {
      return "Intermediate";
    }

    return "Advanced";
  }, [solvedCount]);


  // -------------------------------------------------------
  // Language statistics
  // -------------------------------------------------------

    const languageStats = useMemo(() => {
  const stats = {};

  // Build language information directly from questions
  questions.forEach((question) => {
    const languageId = Number(question.language_id);

    if (!languageId) return;

    const languageFromDatabase =
      question.languages;

    if (!stats[languageId]) {
      stats[languageId] = {
        id: languageId,
        name:
          languageFromDatabase?.name ||
          "Unknown",

        slug:
          languageFromDatabase?.slug ||
          "",

        solved: 0,
        total: 0,
        percent: 0,
      };
    }

    // Total questions for this language
    stats[languageId].total += 1;

    // Check whether this question was solved
    if (
      solvedQuestionIds.has(
        Number(question.id)
      )
    ) {
      stats[languageId].solved += 1;
    }
  });


  // Calculate percentage
  Object.values(stats).forEach((language) => {
    language.percent =
      language.total > 0
        ? Math.round(
            (language.solved /
              language.total) *
              100
          )
        : 0;
  });


  return Object.values(stats);
}, [
  questions,
  solvedQuestionIds,
]);

  // -------------------------------------------------------
  // Recent activity
  // -------------------------------------------------------

  const recentActivity = useMemo(() => {
    const questionMap = new Map(
      questions.map((question) => [
        Number(question.id),
        question,
      ])
    );

    return [...completedProgress]
      .sort((a, b) => {
        const dateA = new Date(
          a.completed_at || 0
        ).getTime();

        const dateB = new Date(
          b.completed_at || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5)
      .map((item) => {
        const question =
          questionMap.get(
            Number(item.question_id)
          );

        return {
          ...item,
          question,
        };
      })
      .filter((item) => item.question);
  }, [
    completedProgress,
    questions,
  ]);


  // -------------------------------------------------------
  // Format date
  // -------------------------------------------------------

  const formatDate = (date) => {
    if (!date) {
      return "Recently";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "Recently";
    }
  };


  // -------------------------------------------------------
  // Save username
  // -------------------------------------------------------

  const saveName = async () => {
    const cleanName = name.trim();

    if (!cleanName) {
      return;
    }

    if (!user) {
      return;
    }

    try {
      setSavingName(true);
      setError("");

      // Save username in Supabase Auth metadata
      const {
        data,
        error: updateError,
      } = await supabase.auth.updateUser({
        data: {
          username: cleanName,
        },
      });

      if (updateError) {
        throw updateError;
      }

      // Save locally as an immediate fallback
      localStorage.setItem(
        "techblu-username",
        cleanName
      );

      // Update local user object if Supabase returned it
      if (data?.user) {
        // AuthContext normally updates through its auth listener.
        // The localStorage value also keeps the UI consistent
        // immediately.
      }

      setName(cleanName);
      setEditing(false);
    } catch (err) {
      console.error("Username update error:", err);

      setError(
        err?.message ||
          "Unable to update your name."
      );
    } finally {
      setSavingName(false);
    }
  };


  // -------------------------------------------------------
  // Cancel username editing
  // -------------------------------------------------------

  const cancelEditing = () => {
    setName(displayName);
    setEditing(false);
  };


  // -------------------------------------------------------
  // Logout
  // -------------------------------------------------------

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
      setError(
        err?.message ||
          "Unable to logout."
      );
    }
  };


  // -------------------------------------------------------
  // Refresh
  // -------------------------------------------------------

  const handleRefresh = () => {
    loadDashboard(true);
  };


  // -------------------------------------------------------
  // Loading state
  // -------------------------------------------------------

  if (loading) {
    return (
      <div className="page container">
        <div className="page-title">
          <span className="section-label">
            DASHBOARD
          </span>

          <h1>Loading your dashboard...</h1>

          <p>
            Getting your TechBlu learning progress.
          </p>
        </div>

        <div
          style={{
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <LoaderCircle
            size={26}
            className="spin"
          />

          <span>
            Loading progress...
          </span>
        </div>
      </div>
    );
  }


  // -------------------------------------------------------
  // Main dashboard
  // -------------------------------------------------------

  return (
    <div className="page container">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="page-title">
        <span className="section-label">
          DASHBOARD
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1>
              Welcome back, {displayName}
            </h1>

            <p>
              Track your learning progress,
              practice questions, and programming
              journey.
            </p>
          </div>

          <button
            className="btn small ghost"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <RefreshCw
              size={15}
              className={
                refreshing ? "spin" : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </div>


      {/* ===================================================
          ERROR MESSAGE
      =================================================== */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 15px",
            borderRadius: "10px",
            background:
              "rgba(239, 68, 68, 0.10)",
            border:
              "1px solid rgba(239, 68, 68, 0.25)",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}


      {/* ===================================================
          DASHBOARD GRID
      =================================================== */}

      <div className="dashboard-grid">

        {/* -------------------------------------------------
            PROFILE CARD
        ------------------------------------------------- */}

        <div className="profile-card">

          <div className="avatar">
            {displayName
              .charAt(0)
              .toUpperCase()}
          </div>


          <div className="profile-info">

            {editing ? (
              <div className="username-form">

                <label>
                  Your name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your name"
                  maxLength={40}
                />

                <div className="name-actions">

                  <button
                    className="btn small primary"
                    onClick={saveName}
                    disabled={savingName}
                  >
                    {savingName
                      ? "Saving..."
                      : "Save"}
                  </button>

                  <button
                    className="btn small ghost"
                    onClick={cancelEditing}
                    disabled={savingName}
                  >
                    Cancel
                  </button>

                </div>

              </div>
            ) : (
              <>
                <h2>
                  {displayName}
                </h2>

                <button
                  className="edit-name"
                  onClick={() =>
                    setEditing(true)
                  }
                >
                  <Edit3 size={14} />

                  Change name
                </button>
              </>
            )}


            {user?.email && (
              <p className="user-email">
                {user.email}
              </p>
            )}

            <span className="level-badge">
              {level}
            </span>

          </div>


          {/* Overall progress */}

          <div className="big-progress">
            <div
              style={{
                width: `${overallPercent}%`,
              }}
            />
          </div>

          <strong className="progress-percent">
            {overallPercent}%
          </strong>

          <p>
            Overall practice progress
          </p>


          {/* Logout */}

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={17} />

            Logout
          </button>

        </div>


        {/* -------------------------------------------------
            QUESTIONS SOLVED
        ------------------------------------------------- */}

        <div className="stat-card">

          <Trophy size={25} />

          <span>
            Questions solved
          </span>

          <strong>
            {solvedCount}
          </strong>

          <small>
            out of {totalQuestions}
          </small>

        </div>


        {/* -------------------------------------------------
            LANGUAGES
        ------------------------------------------------- */}

        <div className="stat-card">

          <BookOpen size={25} />

          <span>
            Languages
          </span>

          <strong>
            {availableLanguages.length}
          </strong>

          <small>
            available now
          </small>

        </div>


        {/* -------------------------------------------------
            CURRENT LEVEL
        ------------------------------------------------- */}

        <div className="stat-card">

          <BarChart3 size={25} />

          <span>
            Current level
          </span>

          <strong>
            {level}
          </strong>

          <small>
            based on practice
          </small>

        </div>

      </div>


      {/* ===================================================
          LANGUAGE PROGRESS
      =================================================== */}

      <div className="progress-section">

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <div>
            <h2>
              Language Progress
            </h2>

            <p
              style={{
                marginTop: "4px",
                opacity: 0.7,
              }}
            >
              Track your solved practice
              questions by language.
            </p>
          </div>
        </div>


         {languageStats.map((language) => (
  <div
    className="lang-row"
    key={language.id}
  >
    <span>
      {language.name}
    </span>

    <div>
      <i
        style={{
          width: `${language.percent}%`,
        }}
      />
    </div>

    <b>
      {language.solved}/{language.total}
    </b>
  </div>
))}


        {languageStats.length === 0 && (
          <p>
            No language progress available yet.
          </p>
        )}

      </div>


      {/* ===================================================
          RECENT ACTIVITY
      =================================================== */}

      <div
        className="progress-section"
        style={{
          marginTop: "24px",
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "18px",
          }}
        >
          <Clock3 size={21} />

          <div>
            <h2>
              Recent Activity
            </h2>

            <p
              style={{
                marginTop: "4px",
                opacity: 0.7,
              }}
            >
              Your recently solved questions.
            </p>
          </div>
        </div>


        {recentActivity.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >

            {recentActivity.map((item) => {

              const question =
                item.question;

              const language =
                question?.languages?.name ||
                availableLanguages.find(
                  (lang) =>
                    Number(lang.id) ===
                    Number(
                      question?.language_id
                    )
                )?.name ||
                "Programming";


              return (
                <div
                  key={`${item.question_id}-${item.completed_at}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "15px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border:
                      "1px solid var(--border-color, rgba(148,163,184,.2))",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      minWidth: 0,
                    }}
                  >

                    <CheckCircle2
                      size={20}
                      style={{
                        flexShrink: 0,
                      }}
                    />

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >

                      <strong
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {question?.title ||
                          `Question #${item.question_id}`}
                      </strong>

                      <small
                        style={{
                          opacity: 0.65,
                        }}
                      >
                        {language}
                        {question?.difficulty
                          ? ` • ${question.difficulty}`
                          : ""}
                      </small>

                    </div>

                  </div>


                  <small
                    style={{
                      opacity: 0.65,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(
                      item.completed_at
                    )}
                  </small>

                </div>
              );
            })}

          </div>
        ) : (
          <div
            style={{
              padding: "25px 10px",
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            <CheckCircle2
              size={30}
              style={{
                marginBottom: "8px",
              }}
            />

            <p>
              No solved questions yet.
            </p>

            <small>
              Complete a practice question to
              see your activity here.
            </small>
          </div>
        )}

      </div>


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div
        className="progress-section"
        style={{
          marginTop: "24px",
        }}
      >

        <h2>
          Learning Summary
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "14px",
            marginTop: "18px",
          }}
        >

          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              border:
                "1px solid var(--border-color, rgba(148,163,184,.2))",
            }}
          >
            <small
              style={{
                opacity: 0.65,
              }}
            >
              Total questions
            </small>

            <strong
              style={{
                display: "block",
                fontSize: "24px",
                marginTop: "5px",
              }}
            >
              {totalQuestions}
            </strong>
          </div>


          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              border:
                "1px solid var(--border-color, rgba(148,163,184,.2))",
            }}
          >
            <small
              style={{
                opacity: 0.65,
              }}
            >
              Completed
            </small>

            <strong
              style={{
                display: "block",
                fontSize: "24px",
                marginTop: "5px",
              }}
            >
              {solvedCount}
            </strong>
          </div>


          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              border:
                "1px solid var(--border-color, rgba(148,163,184,.2))",
            }}
          >
            <small
              style={{
                opacity: 0.65,
              }}
            >
              Remaining
            </small>

            <strong
              style={{
                display: "block",
                fontSize: "24px",
                marginTop: "5px",
              }}
            >
              {Math.max(
                totalQuestions -
                  solvedCount,
                0
              )}
            </strong>
          </div>


          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              border:
                "1px solid var(--border-color, rgba(148,163,184,.2))",
            }}
          >
            <small
              style={{
                opacity: 0.65,
              }}
            >
              Completion
            </small>

            <strong
              style={{
                display: "block",
                fontSize: "24px",
                marginTop: "5px",
              }}
            >
              {overallPercent}%
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}