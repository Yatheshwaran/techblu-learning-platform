import React, { useState } from "react";
import { useAuth } from "../context/Authcontext";

export default function Login({ go }) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Login successful!");

    setTimeout(() => {
      go("dashboard");
    }, 500);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo-icon">TB</div>
          <h1>TechBlu</h1>
        </div>

        <div className="auth-heading">
          <h2>Welcome back</h2>
          <p>Login to continue your learning journey.</p>
        </div>

        {error && (
          <div className="auth-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-message success">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn primary auth-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="auth-switch">
          <span>Don't have an account?</span>

          <button onClick={() => go("signup")}>
            Create account
          </button>
        </div>

        <button
          className="auth-back"
          onClick={() => go("home")}
        >
          ← Back to TechBlu
        </button>

      </div>
    </div>
  );
}