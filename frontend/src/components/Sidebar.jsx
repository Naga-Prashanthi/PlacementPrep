import { NavLink, useNavigate } from "react-router-dom";
import { getUser } from "../utils/auth";
import "../styles/Dashboard.css";

function Sidebar() {
  const navigate = useNavigate();
  const user = getUser();

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const studentLinks = [
    { to: "/dashboard",      icon: "🏠", label: "Dashboard" },
    { to: "/profile",        icon: "👤", label: "My Profile" },
    { to: "/question-bank",  icon: "📚", label: "Question Bank" },
    { to: "/companies",      icon: "🏢", label: "Companies" },
    { to: "/challenges",     icon: "🎯", label: "Daily Challenges" },
    { to: "/eligibility",    icon: "✅", label: "Eligibility Check" },
    { to: "/interview-hub",  icon: "💼", label: "Interview Hub" },

  ];

  const adminLinks = [
    { to: "/dashboard",     icon: "🛡️", label: "Admin Dashboard" },
    { to: "/question-bank", icon: "📚", label: "Question Bank" },
    { to: "/companies",     icon: "🏢", label: "Company Questions" },
  ];

  const links = user?.role === "admin" ? adminLinks : studentLinks;

  return (
    <div className="sidebar" style={{ minWidth: "200px", background: "#1e293b", minHeight: "100vh", padding: "20px 0" }}>
      <h2 style={{ color: "#fff", padding: "0 20px 16px", fontSize: "16px", borderBottom: "1px solid #334155", margin: "0 0 16px" }}>
        {user?.role === "admin" ? "⚙️ Admin Panel" : "📚 PlacementPrep"}
      </h2>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {links.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink to={to} className="link"
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "10px",
                padding: "11px 20px", color: isActive ? "#2563eb" : "#94a3b8",
                textDecoration: "none", fontSize: "14px", fontWeight: isActive ? "700" : "400",
                background: isActive ? "#eff6ff" : "transparent",
                borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent",
              })}>
              <span>{icon}</span> {label}
            </NavLink>
          </li>
        ))}

        <li style={{ borderTop: "1px solid #334155", marginTop: "12px" }}>
          <button onClick={logout}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 20px",
              color: "#f87171", background: "none", border: "none", cursor: "pointer", fontSize: "14px", width: "100%" }}>
            🚪 Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;