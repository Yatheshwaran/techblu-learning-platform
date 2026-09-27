import Link from "next/link";

export default function TutorialsPage() {
  return (
    <main className="tutorials-home">
      <div className="tutorials-home-container">

        <div className="tutorials-home-header">
          <span className="tutorials-label">
            TechBlu Tutorials
          </span>

          <h1>
            Learn. Build. Grow.
          </h1>

          <p>
            Learn programming with practical tutorials,
            examples, and hands-on coding.
          </p>
        </div>

        <section className="tutorial-language-grid">

          <Link
            href="/tutorials/python/1_basics"
            className="tutorial-language-card"
          >
            <div className="tutorial-language-icon">
              🐍
            </div>

            <div>
              <h2>Python</h2>

              <p>
                Learn Python from the basics with simple
                examples and practical explanations.
              </p>

              <span className="tutorial-card-link">
                Start Learning →
              </span>
            </div>
          </Link>

        </section>

      </div>
    </main>
  );
}