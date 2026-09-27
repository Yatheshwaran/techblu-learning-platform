import React, { useState } from "react";
import { useAuth } from "../context/Authcontext";

export default function Signup({ go }) {
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await signUp(
      email,
      password,
      name
    );

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data?.session) {
      setSuccess("Account created successfully!");

      setTimeout(() => {
        go("dashboard");
      }, 500);
    } else {
      setSuccess(
        "Account created! Please check your email to verify your account."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo-icon">TB</div>
          <h1>TechBlu</h1>
        </div>

        <div className="auth-heading">
          <h2>Create your account</h2>
          <p>Start learning programming with TechBlu.</p>
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

        <form onSubmit={handleSignup}>

          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirm password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="btn primary auth-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>

        <div className="auth-switch">
          <span>Already have an account?</span>

          <button onClick={() => go("login")}>
            Login
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