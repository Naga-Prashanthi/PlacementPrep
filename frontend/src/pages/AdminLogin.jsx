import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter admin credentials.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || "Invalid credentials.");
        return;
      }

      if (data.role !== "admin") {
        setError("Access Denied: You do not have valid administrator privileges.");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(data));
      navigate("/dashboard");
    } catch (err) {
      setError("Server error.");
    }
  };

  return (
    <div className="login-container" style={{ background: '#2c3e50' }}>
      <div className="login-box" style={{ border: '3px solid tomato', boxShadow: '0 0 20px rgba(255, 99, 71, 0.5)' }}>

        <h2 style={{ color: 'tomato' }}>Admin Secure Portal</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '13px', color: '#777' }}>Authorized Personnel Only<br/><br/><strong style={{color: '#fff'}}>Hint: admin@admin.com / adminpassword</strong></p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Admin Email"
          style={{ background: '#f5f6fa' }}
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Admin Password"
          style={{ background: '#f5f6fa' }}
        />

        {error && <p className="form-error" style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

        <button onClick={handleLogin} style={{ background: 'tomato' }}>Authorize Login</button>

        <br /><br />

        <p>
          Not an admin?
          <Link to="/login"> Student Login</Link>
        </p>

      </div>
    </div>
  );
}

export default AdminLogin;
