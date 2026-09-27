import { useAuth } from "../../context/Authcontext";
import React from "react";
import {
  Moon,
  Sun,
  Menu,
  X,
  BookOpen,
  Trophy,
  Code2,
  LayoutDashboard
} from "lucide-react";
export default function Header({
  page,
  menu,
  setMenu,
  dark,
  setDark,
  go
}) {
  const { user, logout } = useAuth();
  const handleLogout = async () => {
  const { error } = await logout();

  if (error) {
    console.error("Logout error:", error);
    return;
  }

  if (go) {
    go("home");
  }
};

  return (
    <header className="header">
      <div className="container nav">

        {/* TECHBLU LOGO */}
        <button
          className="brand"
          onClick={() => go("home")}
          aria-label="TechBlu Home"
        >
          <span className="brand-icon">
            T
          </span>

          <span className="brand-name">
            Tech<span>Blu</span>
          </span>
        </button>


        {/* DESKTOP NAVIGATION */}
        <nav className={menu ? "nav-menu mobile-open" : "nav-menu"}>

          <button
            className={page === "home" ? "nav-link active" : "nav-link"}
            onClick={() => go("home")}
          >
            Home
          </button>

          <button
            className={page === "learn" ? "nav-link active" : "nav-link"}
            onClick={() => go("learn")}
          >
            <BookOpen size={17} />
            Tutorials
          </button>

          <button
            className={page === "practice" ? "nav-link active" : "nav-link"}
            onClick={() => go("practice")}
          >
            <Trophy size={17} />
            Practice
          </button>

          <button
            className={page === "compiler" ? "nav-link active" : "nav-link"}
            onClick={() => go("compiler")}
          >
            <Code2 size={17} />
            Compiler
          </button>

          <button
            className={page === "dashboard" ? "nav-link active" : "nav-link"}
            onClick={() => go("dashboard")}
          >
            <LayoutDashboard size={17} />
            Dashboard
          </button>
        {/* AUTH BUTTONS */}

           {user ? (
             <button className="signup-btn" onClick={handleLogout}>
              Logout
          </button>
         ) : (
           <>
            <button
              className={page === "login" ? "nav-link active" : "nav-link"}
              onClick={() => go("login")}
          >
           Login
        </button>

        <button
         className="signup-btn"
         onClick={() => go("signup")}
       >
         Sign Up
       </button>
      </>
    )}
     {user && (
      <button
        className="logout-btn"
        onClick={handleLogout}
    >
      Logout
  </button>
)}

        </nav>


        {/* RIGHT ACTIONS */}
        <div className="nav-actions">

          <button
            className="icon-btn"
            aria-label="Toggle dark mode"
            onClick={() => setDark(!dark)}
          >
            {dark ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}
          </button>

          <button
            className="menu-btn"
            onClick={() => setMenu(!menu)}
            aria-label="Menu"
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>

      </div>
    </header>
  );
}