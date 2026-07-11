import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getUser, authHeaders, API } from "../utils/auth";
import "../styles/Dashboard.css";

const MOCK_QUESTIONS = [
  "Why do you want to join our company?",
  "Explain a difficult technical challenge you overcame recently.",
  "How does a Hash Map work under the hood?",
  "What is the difference between an Inner Join and a Left Join?",
  "Tell me about a time you had a conflict with a team member."
];

function InterviewSimulator() {
  const user = getUser();
  const [question, setQuestion] = useState(MOCK_QUESTIONS[0]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQ = () => {
    setQuestion(MOCK_QUESTIONS[Math.floor(Math.random() * MOCK_QUESTIONS.length)]);
    setAnswer("");
    setFeedback(null);
  };

  const evaluate = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/ai/interview`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ question, answer })
      });
      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      console.error(err);
      alert("Simulation error.");
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <Sidebar />
        <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
          <h1 style={{ marginBottom: "6px" }}>🎤 AI Interview Simulator</h1>
          <p style={{ color: "#666", marginBottom: "24px" }}>Practice behavioral and technical questions dynamically.</p>

          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: "800px" }}>
            
            <div style={{ padding: "20px", background: "#eff6ff", borderLeft: "4px solid #2563eb", borderRadius: "4px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <p style={{ color: "#1e3a8a", margin: 0, fontWeight: "bold" }}>Interviewer asks:</p>
                <button onClick={generateQ} style={{ background: "transparent", color: "#2563eb", border: "none", cursor: "pointer", fontWeight: "600" }}>↻ Randomize</button>
              </div>
              <h2 style={{ color: "#1e40af", margin: 0, fontSize: "20px" }}>"{question}"</h2>
            </div>

            <textarea 
              value={answer} 
              onChange={e => setAnswer(e.target.value)} 
              rows={6} 
              placeholder="Type your spoken answer here..."
              style={{ width: "100%", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1", resize: "vertical", fontFamily: "inherit", fontSize: "15px", marginBottom: "16px" }}
            />
            
            <button onClick={evaluate} disabled={loading} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "14px 28px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}>
              {loading ? "Evaluating Output..." : "Submit Answer"}
            </button>

            {feedback && (
              <div style={{ marginTop: "32px", padding: "24px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#f8fafc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ background: feedback.score > 7 ? "#10b981" : feedback.score > 4 ? "#f59e0b" : "#ef4444", color: "#fff", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "900" }}>
                    {feedback.score}
                  </div>
                  <h3 style={{ color: "#334155", margin: 0 }}>Answer Evaluation</h3>
                </div>
                
                <p style={{ color: "#475569", lineHeight: "1.6", marginBottom: "20px" }}><strong>Feedback:</strong> {feedback.feedback}</p>
                <div style={{ background: "#fff", border: "1px dashed #cbd5e1", padding: "16px", borderRadius: "8px" }}>
                  <p style={{ color: "#0f172a", margin: 0, fontWeight: "bold", marginBottom: "8px" }}>Ideal Approach:</p>
                  <p style={{ color: "#475569", margin: 0, fontSize: "14px", lineHeight: "1.6" }}>{feedback.idealAnswer}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default InterviewSimulator;
