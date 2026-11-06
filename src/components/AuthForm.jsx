
import { useState } from "react";

function AuthForm({ onAuthSuccess, onBack }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/${mode}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "register"
              ? { name, email, password }
              : { email, password }
          )
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (mode === "register") {
        setMessage("Registration successful. Please log in.");
        setMode("login");
        setPassword("");
      } else {
        onAuthSuccess(data);
      }
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section auth-section">
      <h2>{mode === "login" ? "Login to TicketEase" : "Create an account"}</h2>
      <p>
        {mode === "login"
          ? "Sign in to continue."
          : "Register to start using TicketEase."}
      </p>

      <form onSubmit={handleSubmit} className="auth-form">
        {mode === "register" && (
          <label>
            Full name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label>
          Password (minimum 8 characters)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>

        {message && <p role="status">{message}</p>}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting
            ? "Please wait..."
            : mode === "login"
              ? "Login"
              : "Register"}
        </button>
      </form>

      <p>
        {mode === "login" ? "Don't have an account?" : "Already registered?"}{" "}
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setMessage("");
          }}
        >
          {mode === "login" ? "Register" : "Login"}
        </button>
      </p>

      <button type="button" className="secondary-button" onClick={onBack}>
        Back to events
      </button>
    </section>
  );
}

export default AuthForm;
