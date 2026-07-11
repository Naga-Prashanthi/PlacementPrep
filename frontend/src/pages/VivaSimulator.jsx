import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { authHeaders, API } from "../utils/auth";

const VIVA_QUESTIONS_DB = {
  MERN: [
    "Why did you choose the MERN stack for your project?",
    "Explain the role of React in your frontend architecture.",
    "Why did you choose MongoDB over a relational database like MySQL?",
    "Explain how Express.js handles routing in your application.",
    "Describe how JWT authentication works in your application.",
    "Walk me through your MongoDB database schema design.",
    "How does your admin module differentiate access from student users?",
    "Explain the state management approach used in your React components.",
    "How do you handle API errors and network failures in the frontend?",
    "What security measures have you implemented in your backend?",
    "What were the biggest technical challenges you faced during development?",
    "How would you scale this application to support 10,000 students?",
    "What future features or enhancements are planned for this project?",
    "Explain the role of Node.js in your architecture.",
    "How does bcrypt password hashing work in your application?",
  ],
  React: [
    "What is the Virtual DOM and why is it used in React?",
    "Explain the difference between props and state in React.",
    "What are React hooks and why were they introduced?",
    "Explain the useEffect hook and its dependency array.",
    "What is the Context API and when would you use it?",
    "How does React Router handle client-side navigation?",
    "What is component re-rendering and how do you optimize it?",
    "Explain the concept of controlled vs uncontrolled components.",
    "What are Higher Order Components (HOC)?",
    "How do you handle forms in React?",
  ],
  NodeJS: [
    "What is Node.js and what makes it suitable for backend development?",
    "Explain the event loop in Node.js.",
    "What is the difference between async/await and Promises?",
    "How does Express.js middleware work?",
    "Explain RESTful API design principles.",
    "What is CORS and how do you configure it in Express?",
    "How do you handle environment variables securely?",
    "What is the purpose of package.json?",
    "Explain error handling middleware in Express.",
    "How do you implement rate limiting?",
  ],
  General: [
    "Tell me about yourself and your project.",
    "What problem does your project solve?",
    "What was the most difficult part of building this project?",
    "How did you test your application?",
    "What would you do differently if you rebuilt this project?",
    "How did you divide work if this was a team project?",
    "What new technologies did you learn during this project?",
    "How does your project compare to existing solutions?",
    "What is the deployment plan for your project?",
    "How would you add real-time features to your project?",
  ],
};

const TECH_STACKS = Object.keys(VIVA_QUESTIONS_DB);

export default function VivaSimulator() {
  const [sessionId,    setSessionId]    = useState(null);
  const [session,      setSession]      = useState(null);
  const [pastSessions, setPastSessions] = useState([]);
  const [phase, setPhase] = useState("setup"); // setup | active | complete
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timer, setTimer]   = useState(0);
  const [timerRef, setTimerRef] = useState(null);
  const [projectName, setProjectName] = useState("Placement Preparation Portal");
  const [techStack, setTechStack] = useState("MERN");
  const [loading, setLoading]= useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionObj, setRecognitionObj] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/viva/my`, { headers: authHeaders() })
      .then(r => r.json()).then(setPastSessions).catch(() => {});
  }, []);

  useEffect(() => {
    if (phase === "active") {
      const ref = setInterval(() => setTimer(t => t + 1), 1000);
      setTimerRef(ref);
      return () => clearInterval(ref);
    }
    if (timerRef) clearInterval(timerRef);
  }, [phase, currentIdx]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  const startViva = async () => {
    setLoading(true);
    let questions = VIVA_QUESTIONS_DB[techStack] || VIVA_QUESTIONS_DB.General;
    questions = [...questions].sort(() => Math.random() - 0.5).slice(0, 10); // Pick 10 random
    
    const res = await fetch(`${API}/api/viva/start`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ projectName, techStack, questions })
    });
    const data = await res.json();
    setSessionId(data._id);
    setSession(data);
    setPhase("active");
    setCurrentIdx(0);
    setAnswer("");
    setTimer(0);
    setLoading(false);
  };

  const toggleListen = () => {
    if (isListening && recognitionObj) {
      recognitionObj.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported in your browser. Please try Chrome.");
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + " ";
      }
      if (final) setAnswer(prev => (prev + " " + final).trim());
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
    setRecognitionObj(recognition);
    setIsListening(true);
  };

  const stopListenIfActive = () => {
    if (isListening && recognitionObj) {
      recognitionObj.stop();
      setIsListening(false);
    }
  };

  const saveAnswer = async () => {
    if (!answer.trim()) return;
    const res = await fetch(`${API}/api/viva/${sessionId}/answer`, {
      method: "PUT", headers: authHeaders(),
      body: JSON.stringify({ questionIndex: currentIdx, answer, timeTaken: timer })
    });
    const updated = await res.json();
    setSession(updated);
  };

  const nextQuestion = async () => {
    stopListenIfActive();
    await saveAnswer();
    setAnswer("");
    setTimer(0);
    if (currentIdx + 1 < session.questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      await completeViva();
    }
  };

  const skipQuestion = () => {
    stopListenIfActive();
    setAnswer("");
    setTimer(0);
    if (currentIdx + 1 < session.questions.length) setCurrentIdx(currentIdx + 1);
    else completeViva();
  };

  const completeViva = async () => {
    const res = await fetch(`${API}/api/viva/${sessionId}/complete`, {
      method: "PUT", headers: authHeaders()
    });
    const completed = await res.json();
    setSession(completed);
    setPhase("complete");
    // refresh past sessions
    fetch(`${API}/api/viva/my`, { headers: authHeaders() }).then(r => r.json()).then(setPastSessions).catch(() => {});
  };

  const scoreColor = (s) => s >= 80 ? "#10b981" : s >= 50 ? "#f59e0b" : "#ef4444";

  const S = {
    page: { display:"flex", minHeight:"100vh", background:"#0f172a" },
    content: { flex:1, padding:"28px" },
    card: (glow="#2563eb") => ({ background:"#1e293b", borderRadius:"16px", padding:"24px", border:`1px solid ${glow}33`, boxShadow:`0 4px 20px ${glow}20`, marginBottom:"20px" }),
    btn: (bg="#2563eb") => ({ background:bg, color:"#fff", border:"none", borderRadius:"10px", padding:"12px 24px", cursor:"pointer", fontWeight:"700", fontSize:"14px", transition:"transform 0.15s" }),
    progress: (pct) => ({
      height:"8px", background:"#334155", borderRadius:"4px", overflow:"hidden",
      "& > div": { width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#2563eb,#8b5cf6)", borderRadius:"4px" }
    }),
    text: { color:"#e2e8f0" },
    muted: { color:"#94a3b8" },
    h1: { color:"#f1f5f9", margin:"0 0 6px", fontSize:"26px" },
  };

  return (
    <>
      <Navbar />
      <div style={S.page}>
        <Sidebar />
        <div style={S.content}>
          <h1 style={S.h1}>🎓 Project Viva Simulator</h1>
          <p style={{ ...S.muted, marginBottom:"24px" }}>Practice your project viva with AI-generated examiner questions.</p>

          {/* ── SETUP PHASE ── */}
          {phase === "setup" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px" }}>
              <div style={S.card("#2563eb")}>
                <h2 style={{ ...S.text, margin:"0 0 20px" }}>⚙️ Configure Your Viva</h2>

                <div style={{ marginBottom:"16px" }}>
                  <label style={{ ...S.muted, display:"block", marginBottom:"6px", fontSize:"13px", fontWeight:"600" }}>Project Name</label>
                  <input value={projectName} onChange={e => setProjectName(e.target.value)}
                    style={{ width:"100%", padding:"10px 14px", background:"#0f172a", border:"1px solid #334155", borderRadius:"8px", color:"#f1f5f9", fontSize:"14px" }} />
                </div>

                <div style={{ marginBottom:"20px" }}>
                  <label style={{ ...S.muted, display:"block", marginBottom:"6px", fontSize:"13px", fontWeight:"600" }}>Technology / Topic Area</label>
                  <select value={techStack} onChange={e => setTechStack(e.target.value)}
                    style={{ width:"100%", padding:"10px 14px", background:"#0f172a", border:"1px solid #334155", borderRadius:"8px", color:"#f1f5f9", fontSize:"14px" }}>
                    {TECH_STACKS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div style={{ background:"#0f172a", borderRadius:"8px", padding:"14px", marginBottom:"20px" }}>
                  <p style={{ ...S.muted, margin:"0 0 8px", fontSize:"12px", fontWeight:"600" }}>PREVIEW QUESTIONS ({(VIVA_QUESTIONS_DB[techStack] || []).length} total)</p>
                  {(VIVA_QUESTIONS_DB[techStack] || []).slice(0,3).map((q,i) => (
                    <p key={i} style={{ color:"#94a3b8", fontSize:"12px", margin:"4px 0" }}>• {q}</p>
                  ))}
                  <p style={{ color:"#475569", fontSize:"11px", margin:"6px 0 0" }}>... and {(VIVA_QUESTIONS_DB[techStack]?.length||0)-3} more</p>
                </div>

                <button style={S.btn()} onClick={startViva} disabled={loading}>
                  {loading ? "⏳ Starting..." : "🚀 Start Viva Session"}
                </button>
              </div>

              {/* Past Sessions */}
              <div>
                <div style={S.card("#8b5cf6")}>
                  <h2 style={{ ...S.text, margin:"0 0 16px", fontSize:"18px" }}>📋 Past Viva Sessions</h2>
                  {pastSessions.length === 0
                    ? <p style={S.muted}>No previous sessions. Start your first viva!</p>
                    : pastSessions.slice(0,5).map(s => (
                      <div key={s._id} style={{ padding:"12px 0", borderBottom:"1px solid #334155" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div>
                            <p style={{ ...S.text, margin:0, fontWeight:"600", fontSize:"14px" }}>{s.projectName} — {s.techStack}</p>
                            <p style={{ ...S.muted, margin:"2px 0 0", fontSize:"12px" }}>{new Date(s.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <span style={{ color: scoreColor(s.score), fontWeight:"800", fontSize:"18px" }}>{s.score}%</span>
                            <p style={{ ...S.muted, margin:"2px 0 0", fontSize:"11px" }}>{s.answeredCount}/{s.totalQuestions} answered</p>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* ── ACTIVE PHASE ── */}
          {phase === "active" && session && (
            <div style={{ maxWidth:"760px" }}>
              {/* Progress bar */}
              <div style={{ background:"#1e293b", borderRadius:"12px", padding:"16px 20px", marginBottom:"20px", border:"1px solid #334155" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                  <span style={{ ...S.muted, fontSize:"13px" }}>Question {currentIdx+1} of {session.questions.length}</span>
                  <span style={{ color:timer > 120?"#ef4444":"#10b981", fontWeight:"700", fontFamily:"monospace", fontSize:"18px" }}>⏱ {formatTime(timer)}</span>
                </div>
                <div style={{ height:"6px", background:"#0f172a", borderRadius:"3px", overflow:"hidden" }}>
                  <div style={{ width:`${((currentIdx+1)/session.questions.length)*100}%`, height:"100%", background:"linear-gradient(90deg,#2563eb,#8b5cf6)", borderRadius:"3px", transition:"width 0.5s" }} />
                </div>
              </div>

              {/* Question card */}
              <div style={S.card("#2563eb")}>
                <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
                  <div style={{ width:"40px", height:"40px", background:"linear-gradient(135deg,#2563eb,#8b5cf6)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ color:"#fff", fontWeight:"800" }}>Q{currentIdx+1}</span>
                  </div>
                  <h2 style={{ ...S.text, margin:0, fontSize:"17px", lineHeight:1.5 }}>
                    {session.questions[currentIdx].question}
                  </h2>
                </div>

                <div style={{ position: "relative" }}>
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Type your answer here... Or click the mic icon to dictate."
                    style={{ width:"100%", minHeight:"140px", padding:"14px", background:"#0f172a", border:"1px solid #334155", borderRadius:"10px", color:"#f1f5f9", fontSize:"14px", resize:"vertical", fontFamily:"inherit", lineHeight:1.6, paddingRight: "50px" }}
                  />
                  <button onClick={toggleListen} title={isListening ? "Stop Dictation" : "Start Dictation"}
                    style={{ position: "absolute", top: "10px", right: "10px", background: isListening ? "#ef4444" : "#3b82f6", color: "white", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                    🎤
                  </button>
                </div>

                {/* Answered history */}
                <div style={{ display:"flex", gap:"6px", marginTop:"14px", flexWrap:"wrap" }}>
                  {session.questions.map((q,i) => (
                    <div key={i} title={q.question}
                      style={{ width:"28px", height:"28px", borderRadius:"6px", fontSize:"11px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
                        background: i === currentIdx ?"#2563eb" : q.answered ?"#10b981" :"#334155",
                        color: i === currentIdx||q.answered ?"#fff" :"#94a3b8" }}>
                      {i+1}
                    </div>
                  ))}
                </div>

                <div style={{ display:"flex", gap:"12px", marginTop:"20px", justifyContent:"flex-end" }}>
                  <button style={S.btn("#334155")} onClick={skipQuestion}>⏭ Skip</button>
                  <button style={S.btn()} onClick={nextQuestion} disabled={!answer.trim()}>
                    {currentIdx + 1 < session.questions.length ? "Next Question →" : "🏁 Finish Viva"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── COMPLETE PHASE ── */}
          {phase === "complete" && session && (
            <div style={{ maxWidth:"700px" }}>
              <div style={{ ...S.card(), background:"linear-gradient(135deg,#1e293b,#0f172a)", textAlign:"center", padding:"40px" }}>
                <div style={{ fontSize:"64px", marginBottom:"16px" }}>🎓</div>
                <h2 style={{ color:"#f1f5f9", margin:"0 0 8px", fontSize:"28px" }}>Viva Complete!</h2>
                <p style={{ ...S.muted, marginBottom:"30px" }}>{session.projectName} · {session.techStack}</p>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"30px" }}>
                  {[
                    { label:"Viva Score",        value:`${session.score}%`,              color: scoreColor(session.score) },
                    { label:"Pass/Fail",         value: session.score >= 50 ? "PASS" : "FAIL", color: session.score >= 50 ? "#10b981" : "#ef4444" },
                    { label:"Questions Answered", value:`${session.answeredCount}/${session.totalQuestions}`, color:"#60a5fa" },
                    { label:"Completion",         value:`${session.completionPercent}%`,  color:"#a78bfa" },
                  ].map(s => (
                    <div key={s.label} style={{ background:"#0f172a", borderRadius:"12px", padding:"20px" }}>
                      <p style={{ ...S.muted, margin:"0 0 6px", fontSize:"12px" }}>{s.label}</p>
                      <p style={{ color:s.color, margin:0, fontSize:"28px", fontWeight:"900" }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {session.weakAreas?.length > 0 && (
                  <div style={{ background:"#0f172a", borderRadius:"12px", padding:"20px", textAlign:"left", marginBottom:"20px" }}>
                    <h3 style={{ color:"#fbbf24", margin:"0 0 10px", fontSize:"15px" }}>⚠️ Areas Needing Improvement</h3>
                    {session.weakAreas.map((a,i) => (
                      <p key={i} style={{ color:"#94a3b8", margin:"4px 0", fontSize:"13px" }}>• {a}</p>
                    ))}
                  </div>
                )}

                <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
                  <button style={S.btn()} onClick={() => { setPhase("setup"); setSession(null); setSessionId(null); setCurrentIdx(0); }}>
                    🔄 Start New Viva
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
