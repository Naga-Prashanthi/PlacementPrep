import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getUser, authHeaders, API } from "../utils/auth";
import "../styles/Dashboard.css";

// ─── Readiness Score calculation ─────────────────────────────────────────────
function calcReadiness(user) {
  if (!user) return 0;
  const p = user.progress || {};
  const dsaScore   = Math.min((p.dsaSolved || 0) / 20, 1) * 30;
  const sqlScore   = Math.min((p.sqlSolved || 0) / 10, 1) * 20;
  const aptScore   = Math.min((p.aptitudeSolved || 0) / 10, 1) * 15;
  const intScore   = Math.min((p.interviewsCleared || 0) / 3, 1) * 25;
  const streakBonus= Math.min((p.streak || 0) / 7, 1) * 10;
  return Math.round(dsaScore + sqlScore + aptScore + intScore + streakBonus);
}

function StatCard({ label, value, color = "#2563eb" }) {
  return (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", minWidth: "120px", flex: 1 }}>
      <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>{label}</p>
      <p style={{ margin: "8px 0 0", fontSize: "28px", fontWeight: "bold", color }}>{value}</p>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ user }) {
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [notifStatus, setNotifStatus] = useState("");
  const [newQ, setNewQ] = useState({ title: "", category: "DSA", company: "Amazon" });
  const [tab, setTab] = useState("students");

  useEffect(() => {
    fetch(`${API}/api/admin/students`, { headers: authHeaders() })
      .then(r => r.json()).then(setStudents).catch(() => {});
    fetch(`${API}/api/admin/analytics`, { headers: authHeaders() })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load analytics');
        return r.json();
      })
      .then(setAnalytics)
      .catch(err => setAnalyticsError(err.message));
  }, []);

  const sendNotification = async () => {
    if (!notifMsg.trim()) return;
    const r = await fetch(`${API}/api/admin/notify`, {
      method: "POST", headers: authHeaders(), body: JSON.stringify({ message: notifMsg })
    });
    const d = await r.json();
    setNotifStatus(d.message || "Sent!");
    setNotifMsg("");
    setTimeout(() => setNotifStatus(""), 3000);
  };

  const addQuestion = async () => {
    if (!newQ.title) return;
    await fetch(`${API}/api/admin/questions`, {
      method: "POST", headers: authHeaders(), body: JSON.stringify(newQ)
    });
    setNewQ({ title: "", category: "DSA", company: "Amazon" });
    alert("Question added!");
  };

  const refreshDaily = async () => {
    const r = await fetch(`${API}/api/challenges/refresh`, { headers: authHeaders() });
    const d = await r.json();
    alert(d.message);
  };

  const tabs = ["students","analytics","questions","notifications"];

  return (
    <div style={{ padding: "30px", flex: 1 }}>
      <h1 style={{ marginBottom: "6px" }}>🛡️ Admin Dashboard</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>Welcome, {user.name}. Manage the placement platform.</p>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "8px 20px", borderRadius: "20px", border: "none", cursor: "pointer",
              background: tab === t ? "#2563eb" : "#e5e7eb", color: tab === t ? "#fff" : "#374151", fontWeight: "bold" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Students tab */}
      {tab === "students" && (
        <div>
          <h2 style={{ marginBottom: "16px" }}>👥 All Students ({students.length})</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
              <thead>
                <tr style={{ background: "#1e293b", color: "#fff" }}>
                  {["Photo","Name","Email","Password","College","Branch","Target","CGPA","DSA","SQL","Aptitude","Registered"].map(h => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "13px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s._id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                    <td style={{ padding: "12px 14px" }}>
                      {s.profilePicture ? (
                        <img src={s.profilePicture} alt="Profile" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>
                          {s.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?"}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: "600" }}>{s.name}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px" }}>{s.email}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#dc2626", fontWeight: "bold" }}>{s.password}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px" }}>{s.college || "–"}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px" }}>{s.branch || "–"}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px" }}>{s.targetCompany || "–"}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px" }}>{s.cgpa || "–"}</td>
                    <td style={{ padding: "12px 14px", color: "#059669", fontWeight: "bold" }}>{s.progress?.dsaSolved || 0}</td>
                    <td style={{ padding: "12px 14px", color: "#7c3aed", fontWeight: "bold" }}>{s.progress?.sqlSolved || 0}</td>
                    <td style={{ padding: "12px 14px", color: "#d97706", fontWeight: "bold" }}>{s.progress?.aptitudeSolved || 0}</td>
                    <td style={{ padding: "12px 14px", fontSize: "12px", color: "#888" }}>{new Date(s.registeredAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics tab */}
      {tab === "analytics" && (
        <div>
          <h2 style={{ marginBottom: "16px" }}>📊 Platform Analytics</h2>
          {!analytics && !analyticsError && (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
              <div style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
              Loading analytics...
            </div>
          )}
          {analyticsError && (
            <div style={{ padding: "20px", background: "#fee2e2", color: "#991b1b", borderRadius: "10px", marginBottom: "16px", fontWeight: "600" }}>
              ❌ {analyticsError} — Please check your backend connection.
            </div>
          )}
          {analytics && (
            <>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
                <StatCard label="Total Students" value={analytics.totalStudents} color="#2563eb" />
                <StatCard label="Total Questions" value={analytics.totalQuestions} color="#059669" />
                <StatCard label="Pending Reviews" value={analytics.pendingSubmissions || 0} color="#f59e0b" />
                <StatCard label="Avg DSA Solved" value={analytics.avgDSA || 0} color="#7c3aed" />
                <StatCard label="Avg SQL Solved" value={analytics.avgSQL || 0} color="#d97706" />
                <StatCard label="Viva Sessions" value={analytics.vivaCount || 0} color="#0891b2" />
                <StatCard label="Mock Interviews" value={analytics.interviewCount || 0} color="#db2777" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                  <h3 style={{ margin: "0 0 16px" }}>📈 Platform Overview</h3>
                  <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                    The platform currently has <strong>{analytics.totalStudents}</strong> registered students.
                    On average, each student has solved <strong>{analytics.avgDSA}</strong> DSA and <strong>{analytics.avgSQL}</strong> SQL questions.
                    There are <strong>{analytics.pendingSubmissions}</strong> pending question submissions awaiting review.
                  </p>
                </div>
                <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                  <h3 style={{ margin: "0 0 16px" }}>🎓 Simulator Activity</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", color: "#475569" }}>Viva Sessions Completed</span>
                      <span style={{ fontWeight: "800", color: "#0891b2", fontSize: "20px" }}>{analytics.vivaCount || 0}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", color: "#475569" }}>Mock Interviews Done</span>
                      <span style={{ fontWeight: "800", color: "#db2777", fontSize: "20px" }}>{analytics.interviewCount || 0}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", color: "#475569" }}>Total Simulator Activity</span>
                      <span style={{ fontWeight: "800", color: "#059669", fontSize: "20px" }}>{(analytics.vivaCount || 0) + (analytics.interviewCount || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Questions tab */}
      {tab === "questions" && (
        <div>
          <h2 style={{ marginBottom: "16px" }}>➕ Add Question</h2>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: "500px" }}>
            <input value={newQ.title} onChange={e => setNewQ({ ...newQ, title: e.target.value })} placeholder="Question Title" style={{ width: "100%", padding: "10px", marginBottom: "12px", border: "1px solid #ddd", borderRadius: "6px" }} />
            <select value={newQ.category} onChange={e => setNewQ({ ...newQ, category: e.target.value })} style={{ width: "100%", padding: "10px", marginBottom: "12px", border: "1px solid #ddd", borderRadius: "6px" }}>
              {["DSA","SQL","Aptitude","Technical Interview","HR Interview"].map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={newQ.company} onChange={e => setNewQ({ ...newQ, company: e.target.value })} style={{ width: "100%", padding: "10px", marginBottom: "16px", border: "1px solid #ddd", borderRadius: "6px" }}>
              {["Amazon","Google","Microsoft","Infosys","TCS","Cognizant","Accenture"].map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={addQuestion} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", padding: "10px 24px", cursor: "pointer", fontWeight: "bold" }}>Add Question</button>
          </div>

          <div style={{ marginTop: "24px" }}>
            <button onClick={refreshDaily} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: "6px", padding: "10px 24px", cursor: "pointer", fontWeight: "bold" }}>
              🔄 Refresh Daily Challenges
            </button>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {tab === "notifications" && (
        <div>
          <h2 style={{ marginBottom: "16px" }}>📢 Send Notification to All Students</h2>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: "500px" }}>
            <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)} rows={4}
              placeholder="Type your notification message here..." style={{ width: "100%", padding: "10px", marginBottom: "12px", border: "1px solid #ddd", borderRadius: "6px", fontFamily: "inherit" }} />
            {notifStatus && <p style={{ color: "green", marginBottom: "8px" }}>{notifStatus}</p>}
            <button onClick={sendNotification} style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: "6px", padding: "10px 24px", cursor: "pointer", fontWeight: "bold" }}>
              Send Notification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard({ user }) {
  const readiness = calcReadiness(user);
  const p = user?.progress || {};
  const [vivaSessions,      setVivaSessions]      = useState([]);
  const [interviewSessions, setInterviewSessions] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/viva/my`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : []).then(d => setVivaSessions(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/api/interview/my`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : []).then(d => setInterviewSessions(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const scoreColor = (s) => s >= 80 ? "#059669" : s >= 50 ? "#d97706" : "#dc2626";

  return (
    <div style={{ padding: "30px", flex: 1 }}>
      <h1 style={{ marginBottom: "4px" }}>👋 Welcome, {user?.name}!</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        {user?.college} · {user?.branch} · Target: <strong>{user?.targetCompany || "Not set"}</strong>
      </p>

      {/* Readiness Score */}
      <div style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius: "16px", padding: "24px", color: "#fff", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p style={{ margin: 0, opacity: 0.85, fontSize: "14px" }}>Placement Readiness Score</p>
          <p style={{ margin: "8px 0 0", fontSize: "52px", fontWeight: "900", lineHeight: 1 }}>{readiness}<span style={{ fontSize: "20px" }}>/100</span></p>
          <p style={{ margin: "8px 0 0", opacity: 0.75, fontSize: "13px" }}>
            {readiness < 30 ? "Just starting. Keep going!" : readiness < 60 ? "Good progress. Stay consistent." : readiness < 85 ? "Almost placement-ready!" : "🎉 You are placement-ready!"}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, opacity: 0.85, fontSize: "14px" }}>🔥 Streak</p>
          <p style={{ margin: "4px 0 0", fontSize: "36px", fontWeight: "bold" }}>{p.streak || 0} days</p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
        <StatCard label="DSA Solved"     value={p.dsaSolved || 0}       color="#059669" />
        <StatCard label="SQL Solved"     value={p.sqlSolved || 0}       color="#7c3aed" />
        <StatCard label="Aptitude Done"  value={p.aptitudeSolved || 0}  color="#d97706" />
        <StatCard label="Interviews"     value={p.interviewsCleared || 0} color="#dc2626" />
        <StatCard label="Viva Sessions"  value={vivaSessions.length}    color="#0891b2" />
        <StatCard label="Mock Interviews" value={interviewSessions.length} color="#7c3aed" />
      </div>

      {/* Quick Links */}
      <h3 style={{ marginBottom: "12px" }}>Quick Actions</h3>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "28px" }}>
        {[
          { label: "📚 Question Bank",    href: "/question-bank" },
          { label: "🏢 Companies",        href: "/companies" },
          { label: "🎯 Daily Challenges", href: "/challenges" },
          { label: "🎓 Viva Simulator",   href: "/viva" },
          { label: "🎤 Mock Interview",   href: "/face-interview" },
          { label: "🔍 Eligibility Check",href: "/eligibility" },
        ].map(({ label, href }) => (
          <a key={href} href={href}
            style={{ padding: "12px 20px", background: "#eff6ff", borderRadius: "10px", textDecoration: "none", color: "#1d4ed8", fontWeight: "600", fontSize: "14px", border: "1px solid #bfdbfe" }}>
            {label}
          </a>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Recent Viva Sessions */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
          <h3 style={{ marginBottom: "14px" }}>🎓 Recent Viva Sessions</h3>
          {vivaSessions.length === 0
            ? <p style={{ color: "#aaa", fontSize: "13px" }}>No viva sessions yet. <a href="/viva">Start one →</a></p>
            : vivaSessions.slice(0, 3).map((s, i) => (
              <div key={s._id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "600" }}>{s.projectName}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{ color: scoreColor(s.score), fontWeight: "800", fontSize: "18px" }}>{s.score}%</span>
              </div>
            ))
          }
        </div>

        {/* Recent Mock Interviews */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
          <h3 style={{ marginBottom: "14px" }}>🎤 Recent Mock Interviews</h3>
          {interviewSessions.length === 0
            ? <p style={{ color: "#aaa", fontSize: "13px" }}>No interviews yet. <a href="/face-interview">Start one →</a></p>
            : interviewSessions.slice(0, 3).map((s, i) => (
              <div key={s._id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "600" }}>{s.interviewType} Interview</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{ color: scoreColor(s.overallScore), fontWeight: "800", fontSize: "18px" }}>{s.overallScore}%</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Recent Activity */}
      {user?.recentActivity?.length > 0 && (
        <div style={{ marginTop: "20px", background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
          <h3 style={{ marginBottom: "14px" }}>🕐 Recent Activity</h3>
          {user.recentActivity.slice(0, 5).map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? "1px solid #f3f4f6" : "none" }}>
              <span style={{ fontSize: "14px" }}>{a.description}</span>
              <span style={{ fontSize: "12px", color: "#aaa" }}>{new Date(a.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
       const userLS = getUser();
       if (!userLS) return; // Not logged in handled by ProtectedRoute
       try {
         const res = await fetch(`${API}${userLS.role === 'admin' ? '/api/auth/me' : '/api/student/profile'}`, {
            headers: authHeaders()
         });
         if (res.ok) {
           const dbUser = await res.json();
           setUser({ ...dbUser, token: userLS.token });
           // Keep LS cache slightly updated, though dashboard relies on DB
           localStorage.setItem("currentUser", JSON.stringify({ ...dbUser, token: userLS.token }));
         } else {
           setUser(userLS); // Fallback to LS
         }
       } catch (err) {
         setUser(userLS);
       }
    };
    fetchUser();
  }, []);

  if (!user) return <div style={{ padding: "40px", textAlign: "center" }}>Loading Dashboard...</div>;

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <Sidebar />
        {user.role === "admin" ? <AdminDashboard user={user} /> : <StudentDashboard user={user} />}
      </div>
    </>
  );
}

export default Dashboard;
