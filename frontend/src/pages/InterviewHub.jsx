import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function InterviewHub() {
  const navigate = useNavigate();

  const S = {
    page: { display: "flex", minHeight: "100vh", background: "#f8fafc" },
    content: { flex: 1, padding: "30px", maxWidth: "1200px", margin: "0 auto" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginTop: "30px" },
    card: { background: "#fff", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", transition: "transform 0.2s" },
    icon: { fontSize: "48px", marginBottom: "16px" },
    btn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", cursor: "pointer", fontWeight: "bold", marginTop: "20px" },
  };

  return (
    <>
      <Navbar />
      <div style={S.page}>
        <Sidebar />
        <div style={S.content}>
          <h1 style={{ fontSize: "32px", margin: "0 0 10px" }}>💼 Interview Hub</h1>
          <p style={{ color: "#64748b", fontSize: "16px" }}>Choose the type of mock interview you want to practice.</p>

          <div style={S.grid}>
            <div style={S.card} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={S.icon}>🎓</div>
              <h2 style={{ margin: "0 0 10px" }}>Project Viva Simulator</h2>
              <p style={{ color: "#64748b", fontSize: "14px", flex: 1 }}>Practice defending your project architecture and choices. Ideal for final-year students.</p>
              <button style={S.btn} onClick={() => navigate('/viva')}>Start Viva</button>
            </div>

            <div style={S.card} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={S.icon}>🎤</div>
              <h2 style={{ margin: "0 0 10px" }}>Face-to-Face Setup</h2>
              <p style={{ color: "#64748b", fontSize: "14px", flex: 1 }}>Simulate a camera-on virtual interview with live transcription and real-time timer.</p>
              <button style={{ ...S.btn, background: "#8b5cf6" }} onClick={() => navigate('/face-interview')}>Start Mock Interview</button>
            </div>

            <div style={S.card} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={S.icon}>💬</div>
              <h2 style={{ margin: "0 0 10px" }}>Text-Based Simulator</h2>
              <p style={{ color: "#64748b", fontSize: "14px", flex: 1 }}>Chat-based asynchronous practice for HR, Technical, and logic questions.</p>
              <button style={{ ...S.btn, background: "#10b981" }} onClick={() => navigate('/interview')}>Start Text Practice</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
