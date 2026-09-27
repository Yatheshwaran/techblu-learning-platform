import React from "react";

import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
} from "lucide-react";

export default function Home({
  go,
  languages = [],
  solved = 0,
  level = "Beginner",
}) {
  return (
    <div>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">

          <div>

            <div className="eyebrow">
              <Sparkles size={15} />
              A focused place to learn programming
            </div>

            <h1>
              Learn. Build.
              <br />
              <span>Grow with TechBlu.</span>
            </h1>

            <p className="hero-text">
              Learn programming concepts, practice real coding questions,
              run programs, and track your progress — all in one learning
              platform.
            </p>

            <div className="hero-buttons">

              <button
                className="btn primary"
                onClick={() => go("learn")}
              >
                Start Learning
                <ArrowRight size={18} />
              </button>

              <button
                className="btn secondary"
                onClick={() => go("practice")}
              >
                Practice Questions
              </button>

            </div>

            <div className="mini-stats">

              <div>
                <b>{languages.length}</b>
                <span>Languages</span>
              </div>

              <div>
                <b>50+</b>
                <span>Questions</span>
              </div>

              <div>
                <b>{solved}</b>
                <span>Solved</span>
              </div>

            </div>

          </div>


          {/* CODE CARD */}
          <div className="hero-card">

            <div className="code-top">

              <span></span>
              <span></span>
              <span></span>

              <small>python.py</small>

            </div>

            <pre>
              <code>{`def learn():
    skills = []
    while True:
        skills.append("practice")
        if ready(skills):
            break
    return "Keep building!"`}</code>
            </pre>

            <div className="code-result">

              <CheckCircle2 size={17} />

              Ready to learn • Level: {level}

            </div>

          </div>

        </div>
      </section>


      {/* PROGRAMMING LANGUAGES */}
      <section className="section muted">

        <div className="container">

          <div className="section-heading">

            <div>

              <span className="section-label">
                PROGRAMMING
              </span>

              <h2>
                Choose your language
              </h2>

            </div>

          </div>


          <div className="language-grid">

            {languages.map((language) => (

              <div
                className="language-card"
                key={language.id}
              >

                <div
                  className={`lang-icon ${language.color}`}
                >
                  {language.icon}
                </div>

                <h3>
                  {language.name}
                </h3>

                <p>
                  {language.description}
                </p>

                <button
                  className="card-link"
                  onClick={() => go("practice")}
                >
                  Learn & Practice
                  <ArrowRight size={15} />
                </button>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="cta">

        <div className="container cta-inner">

          <div>

            <span className="section-label">
              YOUR NEXT STEP
            </span>

            <h2>
              Start with one question today.
            </h2>

            <p>
              Small practice sessions become strong programming skills.
            </p>

          </div>

          <button
            className="btn primary"
            onClick={() => go("practice")}
          >
            Start Practice
            <Play size={17} />
          </button>

        </div>

      </section>

    </div>
  );
}

