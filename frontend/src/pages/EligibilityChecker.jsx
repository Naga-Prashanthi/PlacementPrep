import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { authHeaders, API } from "../utils/auth";

const COMPANIES = [
  { name: "Google",      minCGPA: 8.0, maxBacklogs: 0, logo: "🔍" },
  { name: "Microsoft",   minCGPA: 7.5, maxBacklogs: 0, logo: "🪟" },
  { name: "Amazon",      minCGPA: 7.0, maxBacklogs: 0, logo: "📦" },
  { name: "Cognizant",   minCGPA: 6.5, maxBacklogs: 0, logo: "💡" },
  { name: "Infosys",     minCGPA: 6.0, maxBacklogs: 0, logo: "ℹ️"  },
  { name: "TCS",         minCGPA: 6.0, maxBacklogs: 0, logo: "🏢" },
  { name: "Accenture",   minCGPA: 5.0, maxBacklogs: 2, logo: "⚡" },
];

const CALENDAR = [
  { company: "TCS",       drive: "TCS National Qualifier Test",   date: "2026-07-15", status: "Upcoming" },
  { company: "Infosys",   drive: "Infosys SP/DSE Drive",          date: "2026-07-20", status: "Upcoming" },
  { company: "Cognizant", drive: "Cognizant GenC Program",        date: "2026-08-01", status: "Upcoming" },
  { company: "Accenture", drive: "Accenture ASE Drive",           date: "2026-08-10", status: "Upcoming" },
  { company: "Amazon",    drive: "Amazon SDE Internship",         date: "2026-09-01", status: "Upcoming" },
  { company: "Microsoft", drive: "Microsoft EXPLORE Program",     date: "2026-09-15", status: "Upcoming" },
  { company: "Google",    drive: "Google STEP Internship",        date: "2026-10-01", status: "Upcoming" },
];

function EligibilityChecker() {
  const [cgpa, setCgpa]         = useState("");
  const [backlogs, setBacklogs] = useState(0);
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);

  const check = async () => {
    if (!cgpa) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/student/eligibility`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ cgpa: Number(cgpa), backlogs: Number(backlogs) })
      });
      const data = await r.json();
      setResults(data);
    } catch {
      // Fallback: calculate locally
      setResults(COMPANIES.map(c => ({
        company: c.name,
        minCGPA: c.minCGPA,
        maxBacklogs: c.maxBacklogs,
        eligible: Number(cgpa) >= c.minCGPA && Number(backlogs) <= c.maxBacklogs
      })));
    }
    setLoading(false);
  };

  const eligible = results?.filter(r => r.eligible) || [];
  const ineligible = results?.filter(r => !r.eligible) || [];

  return (
    <>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "30px", maxWidth: "900px" }}>

          {/* ── Eligibility Checker ── */}
          <div style={{ background: "linear-gradient(135deg,#1e293b,#334155)", borderRadius: "16px", padding: "30px", color: "#fff", marginBottom: "28px" }}>
            <h1 style={{ margin: "0 0 6px" }}>🏆 Company Eligibility Checker</h1>
            <p style={{ margin: "0 0 24px", opacity: 0.8 }}>Enter your academic details to see which companies you are eligible to apply for.</p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", opacity: 0.8, marginBottom: "6px" }}>Your CGPA</label>
                <input type="number" min="0" max="10" step="0.1" value={cgpa} onChange={e => setCgpa(e.target.value)}
                  placeholder="e.g. 7.5" style={{ padding: "10px 14px", borderRadius: "8px", border: "none", fontSize: "16px", width: "120px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", opacity: 0.8, marginBottom: "6px" }}>Active Backlogs</label>
                <input type="number" min="0" max="20" value={backlogs} onChange={e => setBacklogs(e.target.value)}
                  placeholder="0" style={{ padding: "10px 14px", borderRadius: "8px", border: "none", fontSize: "16px", width: "100px" }} />
              </div>
              <button onClick={check} disabled={loading}
                style={{ padding: "10px 28px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "15px" }}>
                {loading ? "Checking..." : "Check Eligibility"}
              </button>
            </div>
          </div>

          {results && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
                {/* Eligible */}
                <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                  <h2 style={{ color: "#059669", marginBottom: "14px" }}>✅ Eligible ({eligible.length})</h2>
                  {eligible.length === 0 ? <p style={{ color: "#888" }}>No companies eligible yet.</p> : (
                    eligible.map(c => (
                      <div key={c.company} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f0", alignItems: "center" }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: "700" }}>{COMPANIES.find(x => x.name === c.company)?.logo} {c.company}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888" }}>Min CGPA: {c.minCGPA} | Max Backlogs: {c.maxBacklogs}</p>
                        </div>
                        <a href={`/company/${c.company.toLowerCase()}`}
                          style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none", fontWeight: "600" }}>Prepare →</a>
                      </div>
                    ))
                  )}
                </div>

                {/* Not Eligible */}
                <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                  <h2 style={{ color: "#dc2626", marginBottom: "14px" }}>❌ Not Yet Eligible ({ineligible.length})</h2>
                  {ineligible.map(c => (
                    <div key={c.company} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f0", alignItems: "center" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: "700", color: "#888" }}>{COMPANIES.find(x => x.name === c.company)?.logo} {c.company}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#aaa" }}>Need CGPA ≥ {c.minCGPA} | Max {c.maxBacklogs} backlog(s)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Placement Calendar ── */}
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
            <h2 style={{ marginBottom: "16px" }}>📅 Placement Calendar 2026</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#1e293b", color: "#fff" }}>
                  {["Company","Drive","Date","Status"].map(h => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "13px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CALENDAR.map((ev, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                    <td style={{ padding: "12px 14px", fontWeight: "700" }}>{COMPANIES.find(c => c.name === ev.company)?.logo} {ev.company}</td>
                    <td style={{ padding: "12px 14px", fontSize: "14px" }}>{ev.drive}</td>
                    <td style={{ padding: "12px 14px", fontSize: "14px", color: "#2563eb", fontWeight: "600" }}>{new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: "#dcfce7", color: "#166534", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>{ev.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </>
  );
}

export default EligibilityChecker;
