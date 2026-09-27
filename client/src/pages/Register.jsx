import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/auth/setup-status")
      .then(({ data }) => setNeedsSetup(data.needsSetup))
      .finally(() => setCheckingSetup(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="auth-screen">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (!needsSetup) {
    return (
      <div className="auth-screen">
        <div className="auth-panel">
          <div className="auth-mark">SL</div>
          <h1>Registration is closed</h1>
          <p className="auth-sub">
            StaffLedger already has an administrator set up. Ask your admin to create an
            account for you from the Team page.
          </p>
          <Link to="/login" className="btn-primary" style={{ justifyContent: "center", width: "100%" }}>
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-mark">SL</div>
        <h1>Set up StaffLedger</h1>
        <p className="auth-sub">
          Create the first administrator account. Nobody else can self-register after this.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full name
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Perera" />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account…" : "Create admin account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}