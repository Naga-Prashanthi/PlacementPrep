import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return setError("Please enter your email and password.");
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }
      // Store full user object including JWT token
      localStorage.setItem("currentUser", JSON.stringify(data));
      navigate("/dashboard");
    } catch {
      setError("Server error. Please try again later.");
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Student Login</h2>
        <p style={{ textAlign: "center", color: "#888", marginBottom: "20px", fontSize: "14px" }}>
          Welcome back! Sign in to continue your preparation.
        </p>

        <input value={email} onChange={(e) => setEmail(e.target.value)}
          type="email" placeholder="Enter Email" onKeyDown={handleKeyDown} />

        <input value={password} onChange={(e) => setPassword(e.target.value)}
          type="password" placeholder="Enter Password" onKeyDown={handleKeyDown} />

        {error && <p className="form-error">{error}</p>}

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <br /><br />

        <p>
          Don't have an account?
          <Link to="/signup"> Sign Up</Link>
        </p>

        <p style={{ marginTop: "8px", fontSize: "13px" }}>
          Admin? <Link to="/admin-login" style={{ color: "tomato" }}>Admin Login →</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;