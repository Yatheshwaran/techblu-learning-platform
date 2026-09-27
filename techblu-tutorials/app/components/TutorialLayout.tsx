"use client";


import React, { useState } from "react";
import Link from "next/link";

import type { Tutorial } from "@/src/lib/tutorials";

type Props = {
  tutorial: Tutorial;
  tutorials: Tutorial[];
  children: React.ReactNode;
};

export default function TutorialLayout({
  tutorial,
  tutorials,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="tutorial-page">

      {/* ================= HEADER ================= */}
      
      

      {/* ================= MOBILE OVERLAY ================= */}
      {sidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* ================= CONTENT ================= */}
      <div className="tutorial-container">

        {/* ================= SIDEBAR ================= */}
        <aside
          className={`tutorial-sidebar ${
            sidebarOpen ? "mobile-sidebar-open" : ""
          }`}
        >

          {/* Mobile close button */}
          <div className="mobile-sidebar-header">
            <span>{tutorial.language} Tutorial</span>

            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close tutorial menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Desktop sidebar title */}
          <div className="sidebar-title">
            {tutorial.language} Tutorial
          </div>

          {tutorials.map((item) => (
            <details
              key={item.slug}
              open={item.slug === tutorial.slug}
              className="sidebar-section"
            >
              <summary>{item.title}</summary>

              <div className="sidebar-subtopics">
                {item.headings.map((heading) => (
                  <Link
                    key={heading.slug}
                    href={`/tutorials/${tutorial.language.toLowerCase()}/${item.slug}#${heading.slug}`}
                    className={
                      item.slug === tutorial.slug &&
                      heading.slug === tutorial.headings[0]?.slug
                        ? "active"
                        : ""
                    }
                    onClick={closeSidebar}
                  >
                    {heading.text}
                  </Link>
                ))}
              </div>
            </details>
          ))}

        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="tutorial-content">

          <div className="tutorial-heading">

            <span className="tutorial-label">
              {tutorial.language}
            </span>

            <h1>{tutorial.title}</h1>

            {tutorial.description && (
              <p>{tutorial.description}</p>
            )}

          </div>

          <article className="mdx-content">
            {children}
          </article>

        </main>

      </div>
    </div>
  );
}