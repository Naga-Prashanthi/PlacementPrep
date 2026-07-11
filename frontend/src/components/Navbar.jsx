import { Link, useNavigate } from "react-router-dom";
import { getUser } from "../utils/auth";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", height: "62px",
      background: "rgba(15,23,42,0.97)", backdropFilter: "blur(12px)",
      position: "sticky", top: 0, zIndex: 999,
      borderBottom: "1px solid rgba(255,255,255,0.07)"
    }}>
      {/* Logo */}
      <Link to={user ? "/dashboard" : "/"} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "22px" }}>🎯</span>
        <span style={{ color: "#fff", fontWeight: "800", fontSize: "18px", letterSpacing: "-0.5px" }}>
          Placement<span style={{ color: "#3b82f6" }}>Prep</span>
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {!user ? (
          /* Public nav */
          <>
            <Link to="/login" style={navLink}>Student Login</Link>
            <Link to="/admin-login" style={{ ...navLink, color: "#fb923c" }}>Admin Login</Link>
            <Link to="/signup" style={navBtn}>Get Started →</Link>
          </>
        ) : user.role === "admin" ? (
          /* Admin nav */
          <>
            <Link to="/dashboard" style={navLink}>Dashboard</Link>
            <Link to="/companies" style={navLink}>Questions</Link>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "12px", paddingLeft: "12px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f59e0b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" }}>
                  {user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?"}
                </div>
              )}
              <button onClick={logout} style={logoutBtn}>Logout</button>
            </div>
          </>
        ) : (
          /* Student nav */
          <>
            <Link to="/dashboard" style={navLink}>Dashboard</Link>
            <Link to="/companies" style={navLink}>Companies</Link>
            <Link to="/challenges" style={navLink}>Challenges</Link>
            <Link to="/eligibility" style={navLink}>Eligibility</Link>
            <Link to="/profile" style={navLink}>Profile</Link>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "12px", paddingLeft: "12px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" }}>
                  {user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?"}
                </div>
              )}
              <button onClick={logout} style={logoutBtn}>Logout</button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

const navLink = {
  color: "#cbd5e1", textDecoration: "none", padding: "6px 14px",
  borderRadius: "8px", fontSize: "14px", fontWeight: "500",
  transition: "color 0.2s",
};
const navBtn = {
  background: "#2563eb", color: "#fff", textDecoration: "none",
  padding: "8px 18px", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
  marginLeft: "8px",
};
const logoutBtn = {
  background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid #f87171",
  padding: "6px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: "600",
  cursor: "pointer", marginLeft: "8px",
};

export default Navbar;
