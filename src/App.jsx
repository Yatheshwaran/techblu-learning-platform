import React, { useState } from "react";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import Tutorials from "./pages/Tutorials";
import Practice from "./pages/Practice";
import Compiler from "./pages/Compiler";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [page, setPage] = useState("home");
  const [challenge, setChallenge] = useState(null);

  const go = (nextPage) => {
    setPage(nextPage);
  };

  return (
    <>
      <Header go={go} currentPage={page} />

      {page === "home" && <Home go={go} />}

      {page === "tutorials" && <Tutorials go={go} />}

      {page === "practice" && (
        <Practice
          go={go}
          setChallenge={setChallenge}
        />
      )}

      {page === "compiler" && (
        <Compiler
          challenge={challenge}
          go={go}
          setChallenge={setChallenge}
        />
      )}

      {page === "dashboard" && <Dashboard go={go} />}

      <Footer />
    </>
  );
}