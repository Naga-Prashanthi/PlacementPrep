import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getUser, authHeaders, API } from "../utils/auth";

function Profile() {
  const [user, setUser]       = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState([]);
  const fileInputRef = useRef(null);

  const companies = ["Amazon","Google","Microsoft","Infosys","TCS","Cognizant","Accenture","Wipro","Capgemini"];

  const calcReadiness = (u) => {
    if (!u) return 0;
    const p = u.progress || {};
    return Math.min(100, Math.round(
      Math.min((p.dsaSolved || 0) / 20, 1) * 30 +
      Math.min((p.sqlSolved || 0) / 10,  1) * 20 +
      Math.min((p.aptitudeSolved || 0) / 10, 1) * 15 +
      Math.min((p.interviewsCleared || 0) / 3, 1) * 25 +
      Math.min((p.streak || 0) / 7, 1) * 10
    ));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const stored = getUser();
      if (!stored) return;
      try {
        const res = await fetch(`${API}${stored.role === 'admin' ? '/api/auth/me' : '/api/student/profile'}`, { headers: authHeaders() });
        if (res.ok) {
          const dbUser = await res.json();
          const updated = { ...dbUser, token: stored.token };
          setUser(updated);
          setForm({
            name: updated.name || "",
            college: updated.college || "",
            branch: updated.branch || "",
            graduationYear: updated.graduationYear || "",
            targetCompany: updated.targetCompany || "",
            cgpa: updated.cgpa || "",
            backlogs: updated.backlogs || 0,
            aboutMe: updated.aboutMe || "",
            githubProfile: updated.githubProfile || "",
            linkedinProfile: updated.linkedinProfile || "",
            leetcodeUsername: updated.leetcodeUsername || "",
            skills: (updated.skills || []).join(", "),
            profilePicture: updated.profilePicture || "",
          });
          localStorage.setItem("currentUser", JSON.stringify(updated));
        } else {
          setUser(stored);
        }
      } catch {
        setUser(stored);
      }
      // Fetch notifications
      try {
        const nRes = await fetch(`${API}/api/student/notifications`, { headers: authHeaders() });
        if (nRes.ok) {
          const data = await nRes.json();
          if (Array.isArray(data)) setNotifications(data);
        }
      } catch { /* notifications fetch failed silently */ }
    };
    fetchProfile();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API}/api/auth/profile`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({
          ...form,
          skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
          graduationYear: Number(form.graduationYear) || null,
          cgpa: Number(form.cgpa) || 0,
          backlogs: Number(form.backlogs) || 0
        })
      });
      const d = await r.json();
      if (r.ok) {
        const updated = { ...user, ...form, skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [] };
        localStorage.setItem("currentUser", JSON.stringify(updated));
        setUser(updated);
        setMsg("✅ Profile updated successfully!");
        setEditing(false);
      } else { setMsg(d.message || "Update failed."); }
    } catch { setMsg("Server error."); }
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("File too large. Max 2MB allowed.");
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, profilePicture: reader.result }));
    reader.readAsDataURL(file);
  };

  const markNotifsRead = async () => {
    await fetch(`${API}/api/student/notifications/read`, { method: "PUT", headers: authHeaders() });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  if (!user) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", border: "4px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#64748b" }}>Loading your profile...</p>
      </div>
    </div>
  );

  const readiness = calcReadiness(user);
  const p = user.progress || {};
  const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const unread = notifications.filter(n => !n.read).length;
  const readinessColor = readiness >= 80 ? "#10b981" : readiness >= 50 ? "#f59e0b" : "#ef4444";
  const skillsList = Array.isArray(user.skills) ? user.skills : [];

  const tabs = ["overview", "edit", "notifications", "achievements"];

  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0",
    borderRadius: "10px", fontSize: "14px", background: "#f8fafc",
    outline: "none", transition: "border 0.2s",
    fontFamily: "inherit", color: "#1e293b"
  };
  const labelStyle = { fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .profile-input:focus { border-color: #2563eb !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important; }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { background: #eff6ff !important; color: #2563eb !important; }
        .skill-tag { transition: transform 0.15s; }
        .skill-tag:hover { transform: scale(1.05); }
        .social-link { transition: all 0.2s; }
        .social-link:hover { transform: translateY(-2px); }
        .save-btn { transition: all 0.2s; }
        .save-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(37,99,235,0.3) !important; }
        .stat-mini:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important; }
        .stat-mini { transition: all 0.2s; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>
      <Navbar />
      <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "28px 32px", maxWidth: "1000px" }}>

          {/* ── Hero Banner ── */}
          <div style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e3a5f 100%)",
            borderRadius: "20px", padding: "36px 36px 0", marginBottom: "24px",
            position: "relative", overflow: "hidden"
          }}>
            {/* Background decoration */}
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)" }} />
            <div style={{ position: "absolute", bottom: "-20px", left: "30%", width: "150px", height: "150px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)" }} />

            <div style={{ display: "flex", alignItems: "flex-end", gap: "28px", position: "relative", zIndex: 1 }}>
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0, marginBottom: "-28px" }}>
                <div style={{
                  width: "110px", height: "110px", borderRadius: "50%",
                  border: "4px solid rgba(255,255,255,0.15)",
                  overflow: "hidden", background: "#2563eb", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                }}>
                  {(editing ? form.profilePicture : user.profilePicture) ? (
                    <img src={editing ? form.profilePicture : user.profilePicture} alt="Profile"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "38px", fontWeight: "900", color: "#fff" }}>{initials}</span>
                  )}
                </div>
                {editing && (
                  <>
                    <button onClick={() => fileInputRef.current?.click()} style={{
                      position: "absolute", bottom: "4px", right: "4px",
                      width: "32px", height: "32px", borderRadius: "50%",
                      background: "#2563eb", border: "2px solid #fff",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                    }}>📷</button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload}
                      style={{ display: "none" }} />
                  </>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, paddingBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                  <h1 style={{ margin: 0, color: "#f1f5f9", fontSize: "26px", fontWeight: "800" }}>{user.name}</h1>
                  <span style={{ background: "rgba(37,99,235,0.3)", border: "1px solid rgba(37,99,235,0.5)", color: "#93c5fd", fontSize: "12px", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
                    {user.role === "admin" ? "🛡️ Admin" : "🎓 Student"}
                  </span>
                </div>
                <p style={{ margin: "0 0 8px", color: "#94a3b8", fontSize: "14px" }}>{user.email}</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {user.college && <span style={{ color: "#cbd5e1", fontSize: "13px" }}>🏫 {user.college}</span>}
                  {user.branch && <span style={{ color: "#cbd5e1", fontSize: "13px" }}>• 📚 {user.branch}</span>}
                  {user.graduationYear && <span style={{ color: "#cbd5e1", fontSize: "13px" }}>• 📅 Class of {user.graduationYear}</span>}
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                  {user.targetCompany && (
                    <span style={{ background: "rgba(37,99,235,0.4)", border: "1px solid rgba(37,99,235,0.6)", color: "#bfdbfe", fontSize: "12px", padding: "4px 12px", borderRadius: "20px", fontWeight: "600" }}>
                      🎯 Target: {user.targetCompany}
                    </span>
                  )}
                  <span style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "12px", padding: "4px 12px", borderRadius: "20px" }}>
                    Joined {new Date(user.registeredAt || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Readiness Score Ring */}
              <div style={{ paddingBottom: "28px", textAlign: "center" }}>
                <div style={{ position: "relative", width: "90px", height: "90px" }}>
                  <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
                    <circle cx="45" cy="45" r="38" fill="none" stroke={readinessColor} strokeWidth="7"
                      strokeDasharray={`${2 * Math.PI * 38}`}
                      strokeDashoffset={`${2 * Math.PI * 38 * (1 - readiness / 100)}`}
                      strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontSize: "20px", fontWeight: "900", lineHeight: 1 }}>{readiness}</span>
                    <span style={{ color: "#94a3b8", fontSize: "9px", marginTop: "2px" }}>/ 100</span>
                  </div>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "11px", margin: "6px 0 0", fontWeight: "600" }}>READINESS</p>
              </div>
            </div>

            {/* Tab bar inside banner */}
            <div style={{ display: "flex", gap: 0, marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {tabs.map(t => (
                <button key={t} className="tab-btn" onClick={() => { setActiveTab(t); if (t !== "edit") setEditing(false); else setEditing(true); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: "14px 20px",
                    fontSize: "13px", fontWeight: activeTab === t ? "700" : "500",
                    color: activeTab === t ? "#fff" : "#64748b",
                    borderBottom: activeTab === t ? "2px solid #2563eb" : "2px solid transparent",
                    transition: "all 0.2s", textTransform: "capitalize"
                  }}>
                  {{ overview: "👤 Overview", edit: "✏️ Edit Profile", notifications: `🔔 Alerts${unread > 0 ? ` (${unread})` : ""}`, achievements: "🏆 Achievements" }[t]}
                </button>
              ))}
            </div>
          </div>

          {msg && (
            <div className="fade-in" style={{
              background: msg.includes("✅") ? "#dcfce7" : "#fee2e2",
              color: msg.includes("✅") ? "#166534" : "#991b1b",
              padding: "12px 20px", borderRadius: "12px", marginBottom: "20px",
              fontWeight: "600", fontSize: "14px", border: `1px solid ${msg.includes("✅") ? "#bbf7d0" : "#fecaca"}`
            }}>{msg}</div>
          )}

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>
              <div>
                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
                  {[
                    { label: "DSA Solved", value: p.dsaSolved || 0, icon: "💻", color: "#10b981", bg: "#f0fdf4" },
                    { label: "SQL Solved", value: p.sqlSolved || 0, icon: "🗄️", color: "#8b5cf6", bg: "#f5f3ff" },
                    { label: "Aptitude", value: p.aptitudeSolved || 0, icon: "🧠", color: "#f59e0b", bg: "#fffbeb" },
                    { label: "Interviews", value: p.interviewsCleared || 0, icon: "🎤", color: "#ef4444", bg: "#fef2f2" },
                    { label: "Day Streak", value: `${p.streak || 0}🔥`, icon: "⚡", color: "#ea580c", bg: "#fff7ed" },
                    { label: "CGPA", value: user.cgpa || "–", icon: "📊", color: "#0369a1", bg: "#f0f9ff" },
                  ].map(({ label, value, icon, color, bg }) => (
                    <div key={label} className="stat-mini" style={{ background: bg, border: `1px solid ${color}22`, borderRadius: "14px", padding: "16px", textAlign: "center" }}>
                      <div style={{ fontSize: "24px", marginBottom: "6px" }}>{icon}</div>
                      <div style={{ fontSize: "22px", fontWeight: "800", color }}>{value}</div>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* About Me */}
                {user.aboutMe && (
                  <div style={{ background: "#fff", borderRadius: "16px", padding: "22px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ background: "#eff6ff", width: "28px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>💬</span>
                      About Me
                    </h3>
                    <p style={{ margin: 0, color: "#475569", lineHeight: "1.7", fontSize: "14px" }}>{user.aboutMe}</p>
                  </div>
                )}

                {/* Skills */}
                {skillsList.length > 0 && (
                  <div style={{ background: "#fff", borderRadius: "16px", padding: "22px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ background: "#eff6ff", width: "28px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>🛠️</span>
                      Skills
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {skillsList.map((s, i) => (
                        <span key={i} className="skill-tag" style={{
                          background: "linear-gradient(135deg, #eff6ff, #e0e7ff)",
                          border: "1px solid #bfdbfe", color: "#1d4ed8",
                          padding: "6px 14px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: "default"
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Readiness Progress */}
                <div style={{ background: "#fff", borderRadius: "16px", padding: "22px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>📈 Placement Readiness Breakdown</h3>
                  {[
                    { label: "DSA (30pts)", pct: Math.min((p.dsaSolved || 0) / 20, 1) * 100, color: "#10b981" },
                    { label: "SQL (20pts)", pct: Math.min((p.sqlSolved || 0) / 10, 1) * 100, color: "#8b5cf6" },
                    { label: "Aptitude (15pts)", pct: Math.min((p.aptitudeSolved || 0) / 10, 1) * 100, color: "#f59e0b" },
                    { label: "Interviews (25pts)", pct: Math.min((p.interviewsCleared || 0) / 3, 1) * 100, color: "#ef4444" },
                    { label: "Streak Bonus (10pts)", pct: Math.min((p.streak || 0) / 7, 1) * 100, color: "#ea580c" },
                  ].map(({ label, pct, color }) => (
                    <div key={label} style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>{label}</span>
                        <span style={{ fontSize: "12px", fontWeight: "700", color }}>{Math.round(pct)}%</span>
                      </div>
                      <div style={{ height: "7px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 1s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Personal Info Card */}
                <div style={{ background: "#fff", borderRadius: "16px", padding: "22px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>📋 Personal Info</h3>
                    <button onClick={() => setActiveTab("edit")} style={{
                      background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: "8px",
                      padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600"
                    }}>✏️ Edit</button>
                  </div>
                  {[
                    ["Email", user.email], ["College", user.college || "–"],
                    ["Branch", user.branch || "–"], ["Year", user.graduationYear || "–"],
                    ["CGPA", user.cgpa || "–"], ["Backlogs", user.backlogs ?? "–"],
                    ["Target", user.targetCompany || "–"],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                      <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>{label}</span>
                      <span style={{ fontSize: "13px", color: "#1e293b", fontWeight: "600", textAlign: "right", maxWidth: "180px", wordBreak: "break-word" }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div style={{ background: "#fff", borderRadius: "16px", padding: "22px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>🔗 Social Links</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { key: "githubProfile", icon: "🐙", label: "GitHub", color: "#1e293b", bg: "#f8fafc", href: user.githubProfile },
                      { key: "linkedinProfile", icon: "💼", label: "LinkedIn", color: "#0077b5", bg: "#eff6ff", href: user.linkedinProfile },
                      { key: "leetcodeUsername", icon: "🔥", label: "LeetCode", color: "#f59e0b", bg: "#fffbeb", href: user.leetcodeUsername ? `https://leetcode.com/${user.leetcodeUsername}` : null },
                    ].map(({ icon, label, color, bg, href, key }) => (
                      href ? (
                        <a key={key} className="social-link"
                          href={href.startsWith('http') ? href : `https://${href}`}
                          target="_blank" rel="noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: bg, borderRadius: "10px", textDecoration: "none", border: `1px solid ${color}22` }}>
                          <span style={{ fontSize: "18px" }}>{icon}</span>
                          <span style={{ color, fontWeight: "700", fontSize: "13px" }}>{label}</span>
                          <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: "11px" }}>↗</span>
                        </a>
                      ) : (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "#f8fafc", borderRadius: "10px", opacity: 0.5 }}>
                          <span style={{ fontSize: "18px" }}>{icon}</span>
                          <span style={{ color: "#94a3b8", fontWeight: "600", fontSize: "13px" }}>{label} — Not set</span>
                        </div>
                      )
                    ))}
                  </div>
                  {!user.githubProfile && !user.linkedinProfile && !user.leetcodeUsername && (
                    <button onClick={() => setActiveTab("edit")} style={{
                      marginTop: "12px", width: "100%", padding: "10px", background: "#eff6ff",
                      color: "#2563eb", border: "1px dashed #bfdbfe", borderRadius: "10px",
                      cursor: "pointer", fontWeight: "600", fontSize: "13px"
                    }}>+ Add your social links</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── EDIT TAB ── */}
          {activeTab === "edit" && (
            <div className="fade-in" style={{ background: "#fff", borderRadius: "20px", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h2 style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: "800" }}>✏️ Edit Your Profile</h2>

              {/* Photo Upload Section */}
              <div style={{ background: "linear-gradient(135deg, #f8fafc, #eff6ff)", border: "2px dashed #bfdbfe", borderRadius: "16px", padding: "24px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "24px" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: "90px", height: "90px", borderRadius: "50%", overflow: "hidden", background: "#e0e7ff", border: "3px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {form.profilePicture ? (
                      <img src={form.profilePicture} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "28px", fontWeight: "900", color: "#4f46e5" }}>{initials}</span>
                    )}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 6px", fontWeight: "700", fontSize: "15px" }}>Profile Photo</h4>
                  <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: "13px" }}>Upload a clear, professional photo. JPG or PNG under 2MB.</p>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <label style={{
                      background: "#2563eb", color: "#fff", padding: "8px 20px", borderRadius: "8px",
                      cursor: "pointer", fontWeight: "600", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px"
                    }}>
                      📷 Choose Photo
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
                    </label>
                    {form.profilePicture && (
                      <button onClick={() => setForm(f => ({ ...f, profilePicture: "" }))} style={{
                        background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "8px",
                        padding: "8px 16px", cursor: "pointer", fontWeight: "600", fontSize: "13px"
                      }}>Remove</button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                {[
                  { label: "Full Name", key: "name", type: "text", placeholder: "Your full name" },
                  { label: "College / University", key: "college", type: "text", placeholder: "e.g. IIT Bombay" },
                  { label: "Branch / Department", key: "branch", type: "text", placeholder: "e.g. Computer Science" },
                  { label: "Graduation Year", key: "graduationYear", type: "number", placeholder: "2025" },
                  { label: "CGPA", key: "cgpa", type: "number", placeholder: "8.5" },
                  { label: "Number of Backlogs", key: "backlogs", type: "number", placeholder: "0" },
                  { label: "GitHub Profile URL", key: "githubProfile", type: "text", placeholder: "https://github.com/yourname" },
                  { label: "LinkedIn Profile URL", key: "linkedinProfile", type: "text", placeholder: "https://linkedin.com/in/yourname" },
                  { label: "LeetCode Username", key: "leetcodeUsername", type: "text", placeholder: "your_leetcode_id" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input className="profile-input" type={type} value={form[key] || ""} placeholder={placeholder}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={inputStyle} />
                  </div>
                ))}

                <div>
                  <label style={labelStyle}>Target Company</label>
                  <select value={form.targetCompany || ""} onChange={e => setForm({ ...form, targetCompany: e.target.value })}
                    style={{ ...inputStyle, appearance: "none" }}>
                    <option value="">-- Select Company --</option>
                    {companies.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Skills (comma-separated)</label>
                  <input className="profile-input" type="text" value={form.skills || ""} placeholder="React, Node.js, Python, MongoDB, Java..."
                    onChange={e => setForm({ ...form, skills: e.target.value })}
                    style={inputStyle} />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>About Me</label>
                  <textarea className="profile-input" value={form.aboutMe || ""}
                    onChange={e => setForm({ ...form, aboutMe: e.target.value })}
                    placeholder="Write a brief professional summary about yourself, your projects, goals..."
                    style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} />
                </div>

                <div style={{ gridColumn: "1 / -1", display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button className="save-btn" onClick={save} disabled={saving} style={{
                    background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "#fff",
                    border: "none", borderRadius: "12px", padding: "12px 32px",
                    cursor: saving ? "not-allowed" : "pointer", fontWeight: "700", fontSize: "15px",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.3)", opacity: saving ? 0.7 : 1
                  }}>
                    {saving ? "⏳ Saving..." : "💾 Save Changes"}
                  </button>
                  <button onClick={() => { setActiveTab("overview"); setEditing(false); }} style={{
                    background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "12px",
                    padding: "12px 24px", cursor: "pointer", fontWeight: "600", fontSize: "15px"
                  }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === "notifications" && (
            <div className="fade-in" style={{ background: "#fff", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>
                  🔔 Notifications
                  {unread > 0 && <span style={{ background: "#ef4444", color: "#fff", borderRadius: "20px", padding: "2px 10px", fontSize: "13px", marginLeft: "10px" }}>{unread} new</span>}
                </h2>
                {unread > 0 && (
                  <button onClick={markNotifsRead} style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                  <p style={{ fontWeight: "600" }}>No notifications yet</p>
                </div>
              ) : notifications.map((n, i) => (
                <div key={i} style={{
                  display: "flex", gap: "14px", padding: "16px",
                  background: n.read ? "#f8fafc" : "#eff6ff",
                  borderRadius: "12px", marginBottom: "10px",
                  border: n.read ? "1px solid #f1f5f9" : "1px solid #bfdbfe"
                }}>
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>{n.read ? "📭" : "📬"}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 4px", fontWeight: n.read ? "500" : "700", fontSize: "14px", color: "#1e293b" }}>{n.message}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.read && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb", flexShrink: 0, marginTop: "6px" }} />}
                </div>
              ))}
            </div>
          )}

          {/* ── ACHIEVEMENTS TAB ── */}
          {activeTab === "achievements" && (
            <div className="fade-in" style={{ background: "#fff", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h2 style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: "800" }}>🏆 Achievements</h2>
              {(!user.achievements || user.achievements.length === 0) ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
                  <div style={{ fontSize: "56px", marginBottom: "16px" }}>🏅</div>
                  <h3 style={{ margin: "0 0 8px", color: "#64748b" }}>No achievements yet</h3>
                  <p style={{ margin: 0, fontSize: "14px" }}>Solve questions, complete interviews, and build streaks to earn badges!</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                  {user.achievements.map((a, i) => (
                    <div key={i} style={{
                      background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                      border: "1px solid #fde68a", borderRadius: "14px",
                      padding: "20px", textAlign: "center"
                    }}>
                      <div style={{ fontSize: "36px", marginBottom: "10px" }}>🥇</div>
                      <h4 style={{ margin: 0, color: "#92400e", fontWeight: "700" }}>{a.title}</h4>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
