import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    college: "", branch: "", graduationYear: "", targetCompany: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    const { name, email, password, confirmPassword, college, branch, graduationYear, targetCompany } = form;
    if (!name || !email || !password || !confirmPassword)
      return setError("Please fill in all required fields.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.trim().toLowerCase(), password, college, branch, graduationYear: Number(graduationYear), targetCompany })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Registration failed.");
      localStorage.setItem("currentUser", JSON.stringify(data));
      navigate("/dashboard");
    } catch {
      setError("Server error. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{ maxWidth: '480px', width: '90%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '6px' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '20px', fontSize: '14px' }}>Join PlacementPrep and start your journey</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input name="name" placeholder="Full Name *" value={form.name} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email *" value={form.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Password *" value={form.password} onChange={handleChange} />
          <input name="confirmPassword" type="password" placeholder="Confirm Password *" value={form.confirmPassword} onChange={handleChange} />
          <input name="college" placeholder="College Name" value={form.college} onChange={handleChange} />
          <input name="branch" placeholder="Branch (e.g. CSE)" value={form.branch} onChange={handleChange} />
          <input name="graduationYear" type="number" placeholder="Graduation Year" value={form.graduationYear} onChange={handleChange} />
          <select name="targetCompany" value={form.targetCompany} onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <option value="">Target Company</option>
            {["Amazon","Google","Microsoft","Infosys","TCS","Cognizant","Accenture"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {error && <p className="form-error" style={{ marginTop: '12px' }}>{error}</p>}

        <button onClick={handleSignup} disabled={loading} style={{ marginTop: '16px', width: '100%', padding: '12px', fontSize: '16px' }}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;