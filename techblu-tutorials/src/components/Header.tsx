 "use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  Trophy,
  Code2,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

export default function Header() {
  const [menu, setMenu] = useState(false);

  const closeMenu = () => {
    setMenu(false);
  };

  return (
    <header className="header">
      <div className="container nav">

        {/* TECHBLU LOGO */}
        <Link
          href="/"
          className="brand"
          onClick={closeMenu}
          aria-label="TechBlu Home"
        >
          <span className="brand-icon">
            T
          </span>

          <span className="brand-name">
            Tech<span>Blu</span>
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className={menu ? "nav-menu mobile-open" : "nav-menu"}>

          {/* HOME */}
          <Link
            href="/"
            className="nav-link"
            onClick={closeMenu}
          >
            Home
          </Link>

          {/* TUTORIALS */}
          <Link
            href="/tutorials"
            className="nav-link active"
            onClick={closeMenu}
          >
            <BookOpen size={17} />
            Tutorials
          </Link>

          {/* PRACTICE */}
          <a
            href="http://localhost:5173"
            className="nav-link"
            onClick={closeMenu}
          >
            <Trophy size={17} />
            Practice
          </a>

          {/* COMPILER */}
          <a
            href="http://localhost:5173"
            className="nav-link"
            onClick={closeMenu}
          >
            <Code2 size={17} />
            Compiler
          </a>

          {/* DASHBOARD */}
          <a
            href="http://localhost:5173"
            className="nav-link"
            onClick={closeMenu}
          >
            <LayoutDashboard size={17} />
            Dashboard
          </a>

          {/* LOGIN */}
          <Link
            href="/login"
            className="nav-link"
            onClick={closeMenu}
          >
            Login
          </Link>

          {/* SIGN UP */}
          <Link
            href="/signup"
            className="signup-btn"
            onClick={closeMenu}
          >
            Sign Up
          </Link>

        </nav>

        {/* RIGHT SIDE */}
        <div className="nav-actions">

          {/* MOBILE MENU */}
          <button
            type="button"
            className="menu-btn"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
          >
            {menu ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>

      </div>
    </header>
  );
}