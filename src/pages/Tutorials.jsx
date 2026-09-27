import React from "react";

import {
  BookOpen,
  ArrowRight,
  Search,
} from "lucide-react";


/*
  Astro tutorial URLs

  Change these URLs if your actual
  Astro folder/file names are different.
*/
const tutorialUrls = {

  python:
    "http://localhost:4321/tutorials/python/1_basics/",

  javascript:
    "http://localhost:4321/tutorials/javascript/javascript-basics/",

  java:
    "http://localhost:4321/tutorials/java/java-basics/",

  cpp:
    "http://localhost:4321/tutorials/cpp/cpp-basics/",

  c:
    "http://localhost:4321/tutorials/c/c-basics/",

};


export default function Tutorials({
  languages,
  query,
  setQuery,
  go,
}) {

  const filtered = languages.filter((x) =>
    x.name
      .toLowerCase()
      .includes(query.toLowerCase())
  );


  return (

    <div className="page container">


      {/* =========================
          PAGE TITLE
      ========================== */}

      <div className="page-title">

        <span className="section-label">
          TUTORIALS
        </span>

        <h1>
          Learn programming step by step
        </h1>

        <p>
          Start with fundamentals, then move toward
          real projects and advanced concepts.
        </p>

      </div>



      {/* =========================
          SEARCH
      ========================== */}

      <div className="search">

        <Search size={19} />

        <input
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="Search programming language or topic..."
        />

      </div>



      {/* =========================
          LANGUAGE CARDS
      ========================== */}

      <div className="course-grid">

        {filtered.map((l) => (

          <article
            className="course"
            key={l.id}
          >


            {/* LANGUAGE ICON */}

            <div
              className={
                "course-icon " + l.color
              }
            >
              {l.icon}
            </div>



            {/* LEVEL */}

            <span className="pill">
              Beginner → Advanced
            </span>



            {/* TITLE */}

            <h2>
              {l.name} Tutorial
            </h2>



            {/* DESCRIPTION */}

            <p>
              {l.description}
            </p>



            {/* PROGRESS */}

            <div className="course-progress">

              <span></span>

            </div>



            {/* START LEARNING */}

            <button
              className="btn small primary"

              onClick={() => {

                const url =
                  tutorialUrls[l.id];

                if (url) {

                  window.location.href =
                    url;

                } else {

                  console.warn(
                    `No tutorial URL configured for ${l.id}`
                  );

                }

              }}
            >

              Start learning

              <ArrowRight
                size={15}
              />

            </button>


          </article>

        ))}

      </div>



      {/* =========================
          COMING / FUTURE SECTION
      ========================== */}

      <div className="coming">

        <BookOpen />

        <div>

          <h3>
            Custom tutorials are ready to be added
          </h3>

          <p>
            Use the tutorial data structure later
            to add lessons, examples, notes,
            quizzes, and projects for every language.
          </p>

        </div>

      </div>


    </div>

  );

}