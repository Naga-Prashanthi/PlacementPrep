import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getUser, authHeaders, API } from "../utils/auth";
import "../styles/Challenges.css"; // Reuse styling for cards if needed

function QuestionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Not Started");
  const [proof, setProof] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/questions/${id}`, { headers: authHeaders() });
        if (res.ok) {
          const q = await res.json();
          setQuestion(q);
          const u = getUser();
          if (u && u.questionProgress) {
            const progress = u.questionProgress.find(p => p.questionId === q._id);
            if (progress) setStatus(progress.status);
          }
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const submitProgress = async (newStatus) => {
    if (newStatus === "Attempted" && proof.trim().length < 10) {
      return setMsg("Please provide some proof/explanation to mark as attempted.");
    }
    setMsg("Updating...");
    // Auto-Verify for simulation strictly if length > 50
    const finalStatus = newStatus === "Attempted" && proof.length > 50 ? "Solved" : newStatus;

    try {
      const res = await fetch(`${API}/api/questions/status`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ questionId: id, status: finalStatus })
      });
      const data = await res.json();
      if (res.ok) {
        const user = getUser();
        user.questionProgress = data.questionProgress;
        user.progress = data.progress;
        localStorage.setItem("currentUser", JSON.stringify(user));
        setStatus(finalStatus === "Solved" && user.role !== 'admin' && data.progress ? "Solved" : finalStatus);
        setMsg(data.message || (finalStatus === "Solved" ? "✅ Verified and Marked as Solved!" : `Status updated to ${finalStatus}. Keep working to solve it.`));
      } else {
        setMsg(data.message || "Failed.");
      }
    } catch (err) {
      setMsg("Error connecting to server.");
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  if (!question) return <div style={{ padding: "40px", textAlign: "center" }}><h2>Question Not Found</h2><button onClick={() => navigate(-1)} style={{ padding: "8px 16px", borderRadius: "8px", background: "#2563eb", color: "#fff", border: "none", cursor: "pointer" }}>Go Back</button></div>;

  return (
    <>
      <Navbar />
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
          
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginBottom: "20px", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
            ← Back
          </button>

          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ padding: "4px 12px", borderRadius: "20px", background: "#e0e7ff", color: "#4338ca", fontSize: "12px", fontWeight: "bold" }}>{question.category}</span>
              <span style={{ padding: "4px 12px", borderRadius: "20px", background: "#f1f5f9", color: "#475569", fontSize: "12px", fontWeight: "bold" }}>{question.company}</span>
              <span style={{ padding: "4px 12px", borderRadius: "20px", background: question.difficulty === "Hard" ? "#fee2e2" : question.difficulty === "Easy" ? "#dcfce7" : "#fef3c7", color: question.difficulty === "Hard" ? "#991b1b" : question.difficulty === "Easy" ? "#166534" : "#92400e", fontSize: "12px", fontWeight: "bold" }}>{question.difficulty}</span>
            </div>

            <h1 style={{ margin: "0 0 16px", fontSize: "28px" }}>{question.title}</h1>
            
            {question.topic && <p style={{ color: "#64748b", fontWeight: "500", marginBottom: "24px" }}>Topic: {question.topic}</p>}

            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", marginBottom: "32px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>Description</h3>
              <p style={{ margin: 0, lineHeight: "1.6", color: "#334155", whiteSpace: "pre-wrap" }}>
                {question.description || `Prepare a solution for ${question.title}. No extra description was provided.`}
              </p>
            </div>

            <hr style={{ border: 0, height: "1px", background: "#e2e8f0", marginBottom: "32px" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 16px" }}>Your Progress</h3>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: status === "Not Started" ? "#94a3b8" : status === "Attempted" ? "#f59e0b" : "#10b981" }} />
                  <span style={{ fontWeight: "bold", color: status === "Not Started" ? "#64748b" : status === "Attempted" ? "#d97706" : "#059669" }}>
                    {status}
                  </span>
                </div>

                {msg && <div style={{ marginBottom: "16px", padding: "10px", borderRadius: "8px", background: "#eff6ff", color: "#1e40af", fontSize: "14px", fontWeight: "500" }}>{msg}</div>}

                {status !== "Solved" && (
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>Provide proof of attempt (e.g. code summary, link, notes):</p>
                    <textarea 
                      value={proof} onChange={e => setProof(e.target.value)}
                      style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", minHeight: "100px", fontFamily: "monospace", fontSize: "13px", marginBottom: "16px", background: "#f8fafc" }}
                      placeholder="I tried solving this by using a HashMap..."
                    />
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button onClick={() => submitProgress("Attempted")} style={{ flex: 1, padding: "10px 0", background: "#f59e0b", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Mark Attempted</button>
                    </div>
                    <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#94a3b8" }}>* Note: Once marked Attempted, an admin must approve it to be marked as Solved.</p>
                  </div>
                )}
                {status === "Solved" && (
                  <div style={{ background: "#dcfce7", color: "#166534", padding: "20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>🎉</span>
                    <div>
                      <h4 style={{ margin: "0 0 4px" }}>Officially Solved</h4>
                      <p style={{ margin: 0, fontSize: "13px" }}>You have successfully completed this question and it has been verified.</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ margin: "0 0 16px" }}>External Links</h3>
                <a href={question.category === 'DSA' || question.category === 'SQL' ? `https://leetcode.com/problems/${question.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/` : `https://www.google.com/search?q=${encodeURIComponent(question.title + " " + question.company + " interview question")}`} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none" }}>
                  <div style={{ background: "#1e293b", color: "#fff", padding: "16px 20px", borderRadius: "12px", textAlign: "center", fontWeight: "bold", display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", transition: "transform 0.15s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
                    Solve Externally ↗
                  </div>
                </a>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default QuestionDetails;