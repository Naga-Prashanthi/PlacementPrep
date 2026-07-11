import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { authHeaders, API } from "../utils/auth";

const INTERVIEW_QUESTIONS = {
  HR: [
    "Tell me about yourself.",
    "What are your greatest strengths?",
    "What is your biggest weakness?",
    "Why do you want to work at this company?",
    "Where do you see yourself in 5 years?",
    "Tell me about a time you handled a difficult situation.",
    "What motivates you?",
    "Describe a situation where you showed leadership.",
    "How do you handle stress and pressure?",
    "Do you have any questions for us?",
  ],
  Technical: [
    "Explain Object-Oriented Programming concepts.",
    "What is the difference between stack and queue?",
    "Explain database normalization.",
    "What is REST API and how does it work?",
    "What is the difference between HTTP and HTTPS?",
    "Explain the concept of recursion with an example.",
    "What is time complexity and space complexity?",
    "Explain ACID properties in databases.",
    "What is the difference between SQL and NoSQL?",
    "How does memory management work in Java/C++?",
  ],
  SQL: [
    "What is the difference between INNER JOIN and LEFT JOIN?",
    "Write a query to find the second highest salary.",
    "What is a subquery? Give an example.",
    "Explain the GROUP BY and HAVING clauses.",
    "What are window functions in SQL?",
    "Write a query to find duplicate records.",
    "What is database indexing and why is it used?",
    "Explain stored procedures vs functions.",
    "What is a CTE (Common Table Expression)?",
    "Write a query using RANK() to rank employees by salary.",
  ],
  DSA: [
    "Explain the Two-Pointer technique.",
    "What is dynamic programming? Give an example.",
    "Implement a stack using an array.",
    "Explain BFS and DFS traversal.",
    "What is a hash table and how does it work?",
    "Explain the merge sort algorithm.",
    "What is a binary search tree?",
    "Solve: Find all pairs in an array that sum to a target.",
    "Explain the sliding window technique.",
    "What is the difference between a tree and a graph?",
  ],
  "Company-Specific": [
    "Why do you want to join us specifically?",
    "How does your skill set align with this role?",
    "What do you know about our company culture?",
    "Describe a project that demonstrates your readiness for this role.",
    "How would you handle a conflict with a colleague?",
    "Tell me about a time you exceeded expectations.",
    "What is your approach to learning new technologies?",
    "How do you prioritize tasks when you have multiple deadlines?",
    "Describe your experience working in a team.",
    "What salary expectations do you have for this role?",
  ],
};

const TYPES = Object.keys(INTERVIEW_QUESTIONS);

export default function FaceInterviewSimulator() {
  const [phase,     setPhase]     = useState("setup"); // setup | active | complete
  const [type,      setType]      = useState("HR");
  const [company,   setCompany]   = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [session,   setSession]   = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [timer,     setTimer]     = useState(0);
  const [totalTimer,setTotalTimer]= useState(0);
  const [listening, setListening] = useState(false);
  const [webcamOn,  setWebcamOn]  = useState(false);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [permError, setPermError] = useState("");

  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef    = useRef(null);
  const totalTimerRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/interview/my`, { headers: authHeaders() })
      .then(r => r.json()).then(setPastSessions).catch(() => {});
    return () => { stopAll(); };
  }, []);

  const stopAll = () => {
    if (timerRef.current)      clearInterval(timerRef.current);
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    if (streamRef.current)     streamRef.current.getTracks().forEach(t => t.stop());
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  const enableWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setWebcamOn(true);
      setPermError("");
    } catch (e) {
      setPermError("⚠️ Camera/Mic access denied. Please allow permissions to continue.");
    }
  };

  const startInterview = async () => {
    setLoading(true);
    const questions = INTERVIEW_QUESTIONS[type] || [];
    const res = await fetch(`${API}/api/interview/start`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ interviewType: type, company, questions })
    });
    const data = await res.json();
    setSessionId(data._id);
    setSession(data);
    setPhase("active");
    setCurrentIdx(0);
    setTranscript("");
    setTimer(0);
    setTotalTimer(0);

    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    totalTimerRef.current = setInterval(() => setTotalTimer(t => t + 1), 1000);
    setLoading(false);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Please use Chrome.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang            = "en-US";
    rec.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }
      setTranscript(text.trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    setListening(false);
  };

  const saveAnswer = async () => {
    if (!transcript.trim()) return;
    const res = await fetch(`${API}/api/interview/${sessionId}/answer`, {
      method: "PUT", headers: authHeaders(),
      body: JSON.stringify({ questionIndex: currentIdx, transcript, timeTaken: timer })
    });
    const updated = await res.json();
    setSession(updated);
  };

  const nextQuestion = async () => {
    stopListening();
    await saveAnswer();
    clearInterval(timerRef.current);
    setTranscript("");
    setTimer(0);

    if (currentIdx + 1 < session.questions.length) {
      setCurrentIdx(currentIdx + 1);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      await completeInterview();
    }
  };

  const completeInterview = async () => {
    stopAll();
    const res = await fetch(`${API}/api/interview/${sessionId}/complete`, {
      method: "PUT", headers: authHeaders(),
      body: JSON.stringify({ totalDuration: totalTimer })
    });
    const completed = await res.json();
    setSession(completed);
    setPhase("complete");
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setWebcamOn(false);
    fetch(`${API}/api/interview/my`, { headers: authHeaders() }).then(r => r.json()).then(setPastSessions).catch(() => {});
  };

  const scoreColor = (s) => s >= 80 ? "#10b981" : s >= 50 ? "#f59e0b" : "#ef4444";

  const S = {
    page: { display:"flex", minHeight:"100vh", background:"#0a0a0a" },
    content: { flex:1, padding:"28px", overflowY:"auto" },
    card: (accent="#2563eb") => ({ background:"#111827", borderRadius:"16px", padding:"24px", border:`1px solid ${accent}44`, boxShadow:`0 4px 24px ${accent}15`, marginBottom:"20px" }),
    btn: (bg="#2563eb", hover) => ({ background:bg, color:"#fff", border:"none", borderRadius:"10px", padding:"12px 24px", cursor:"pointer", fontWeight:"700", fontSize:"14px" }),
    muted: { color:"#6b7280" },
    text:  { color:"#e5e7eb" },
    h1: { color:"#f9fafb", margin:"0 0 6px", fontSize:"26px" },
  };

  return (
    <>
      <Navbar />
      <div style={S.page}>
        <Sidebar />
        <div style={S.content}>
          <h1 style={S.h1}>🎤 Face-to-Face Interview Simulator</h1>
          <p style={{ ...S.muted, marginBottom:"24px" }}>Simulate real interviews with webcam, speech-to-text, and performance tracking.</p>

          {/* ── SETUP ── */}
          {phase === "setup" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px" }}>
              <div>
                <div style={S.card("#2563eb")}>
                  <h2 style={{ ...S.text, margin:"0 0 20px", fontSize:"18px" }}>🎯 Interview Setup</h2>

                  <div style={{ marginBottom:"14px" }}>
                    <label style={{ ...S.muted, display:"block", marginBottom:"6px", fontSize:"13px", fontWeight:"600" }}>Interview Type</label>
                    <select value={type} onChange={e => setType(e.target.value)}
                      style={{ width:"100%", padding:"10px 14px", background:"#0a0a0a", border:"1px solid #374151", borderRadius:"8px", color:"#e5e7eb", fontSize:"14px" }}>
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  {type === "Company-Specific" && (
                    <div style={{ marginBottom:"14px" }}>
                      <label style={{ ...S.muted, display:"block", marginBottom:"6px", fontSize:"13px", fontWeight:"600" }}>Company Name</label>
                      <input value={company} onChange={e => setCompany(e.target.value)}
                        placeholder="e.g. Google, TCS..."
                        style={{ width:"100%", padding:"10px 14px", background:"#0a0a0a", border:"1px solid #374151", borderRadius:"8px", color:"#e5e7eb", fontSize:"14px" }} />
                    </div>
                  )}

                  <div style={{ background:"#0a0a0a", borderRadius:"8px", padding:"14px", marginBottom:"20px" }}>
                    <p style={{ ...S.muted, margin:"0 0 8px", fontSize:"12px", fontWeight:"600" }}>SAMPLE QUESTIONS ({(INTERVIEW_QUESTIONS[type]||[]).length} total)</p>
                    {(INTERVIEW_QUESTIONS[type]||[]).slice(0,3).map((q,i) => (
                      <p key={i} style={{ color:"#6b7280", fontSize:"12px", margin:"4px 0" }}>• {q}</p>
                    ))}
                  </div>

                  {permError && <p style={{ color:"#f87171", fontSize:"13px", marginBottom:"12px" }}>{permError}</p>}

                  <div style={{ display:"flex", gap:"10px" }}>
                    <button style={S.btn("#374151")} onClick={enableWebcam}>📹 Enable Camera</button>
                    <button style={S.btn()} onClick={startInterview} disabled={loading}>
                      {loading ? "⏳ Starting..." : "🚀 Start Interview"}
                    </button>
                  </div>
                </div>

                {/* Past sessions */}
                <div style={S.card("#8b5cf6")}>
                  <h3 style={{ ...S.text, margin:"0 0 14px", fontSize:"16px" }}>📋 Past Sessions</h3>
                  {pastSessions.length === 0
                    ? <p style={S.muted}>No interviews yet.</p>
                    : pastSessions.slice(0,4).map(s => (
                      <div key={s._id} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #374151" }}>
                        <div>
                          <p style={{ ...S.text, margin:0, fontWeight:"600", fontSize:"13px" }}>{s.interviewType} Interview</p>
                          <p style={{ ...S.muted, margin:"2px 0 0", fontSize:"11px" }}>{new Date(s.createdAt).toLocaleDateString()} · {formatTime(s.totalDuration||0)}</p>
                        </div>
                        <span style={{ color: scoreColor(s.overallScore), fontWeight:"800", fontSize:"18px" }}>{s.overallScore}%</span>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Webcam preview */}
              <div style={S.card("#10b981")}>
                <h3 style={{ ...S.text, margin:"0 0 14px", fontSize:"16px" }}>📷 Camera Preview</h3>
                <video ref={videoRef} muted style={{ width:"100%", borderRadius:"10px", background:"#0a0a0a", minHeight:"240px", objectFit:"cover" }} />
                {!webcamOn && (
                  <div style={{ textAlign:"center", marginTop:"16px" }}>
                    <p style={S.muted}>Click "Enable Camera" to activate webcam preview.</p>
                  </div>
                )}
                {webcamOn && <p style={{ color:"#10b981", marginTop:"10px", fontWeight:"600", fontSize:"13px" }}>✅ Camera active — you're ready!</p>}
              </div>
            </div>
          )}

          {/* ── ACTIVE ── */}
          {phase === "active" && session && (
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"20px" }}>
              <div>
                {/* Progress */}
                <div style={{ background:"#111827", borderRadius:"12px", padding:"14px 18px", marginBottom:"16px", border:"1px solid #374151", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ display:"flex", gap:"6px" }}>
                      {session.questions.map((_,i) => (
                        <div key={i} style={{ width:"10px", height:"10px", borderRadius:"50%",
                          background: i < currentIdx ? "#10b981" : i === currentIdx ? "#2563eb" : "#374151" }} />
                      ))}
                    </div>
                    <p style={{ ...S.muted, margin:"6px 0 0", fontSize:"12px" }}>Question {currentIdx+1}/{session.questions.length}</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <span style={{ color:"#60a5fa", fontWeight:"700", fontFamily:"monospace", fontSize:"20px" }}>⏱ {formatTime(timer)}</span>
                    <p style={{ ...S.muted, margin:"2px 0 0", fontSize:"11px" }}>Total: {formatTime(totalTimer)}</p>
                  </div>
                </div>

                {/* Question */}
                <div style={S.card("#2563eb")}>
                  <div style={{ background:"#1d4ed820", border:"1px solid #3b82f640", borderRadius:"10px", padding:"16px", marginBottom:"20px" }}>
                    <p style={{ ...S.muted, margin:"0 0 6px", fontSize:"12px", fontWeight:"600" }}>QUESTION {currentIdx+1}</p>
                    <h2 style={{ ...S.text, margin:0, fontSize:"18px", lineHeight:1.6 }}>{session.questions[currentIdx].question}</h2>
                  </div>

                  {/* Speech control */}
                  <div style={{ display:"flex", gap:"10px", marginBottom:"14px" }}>
                    <button onClick={listening ? stopListening : startListening}
                      style={{ ...S.btn(listening ? "#ef4444" : "#10b981"), display:"flex", alignItems:"center", gap:"6px" }}>
                      {listening ? "🔴 Stop Recording" : "🎙️ Start Speaking"}
                    </button>
                    {listening && <span style={{ color:"#10b981", fontWeight:"600", fontSize:"13px", alignSelf:"center" }}>🔴 Recording...</span>}
                  </div>

                  <div>
                    <label style={{ ...S.muted, display:"block", marginBottom:"6px", fontSize:"12px", fontWeight:"600" }}>
                      YOUR ANSWER {transcript ? `(${transcript.split(" ").length} words)` : "(speak or type)"}
                    </label>
                    <textarea
                      value={transcript}
                      onChange={e => setTranscript(e.target.value)}
                      placeholder="Your answer will appear here as you speak... or type manually."
                      style={{ width:"100%", minHeight:"120px", padding:"12px 14px", background:"#0a0a0a", border:"1px solid #374151", borderRadius:"10px", color:"#e5e7eb", fontSize:"14px", resize:"vertical", fontFamily:"inherit", lineHeight:1.6 }}
                    />
                  </div>

                  <div style={{ display:"flex", gap:"10px", marginTop:"16px", justifyContent:"flex-end" }}>
                    <button style={S.btn("#374151")} onClick={() => { setTranscript(""); }}>🗑 Clear</button>
                    <button style={S.btn()} onClick={nextQuestion}>
                      {currentIdx + 1 < session.questions.length ? "Next →" : "🏁 Finish"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live webcam */}
              <div>
                <div style={S.card("#10b981")}>
                  <p style={{ ...S.muted, margin:"0 0 8px", fontSize:"12px", fontWeight:"600" }}>📷 LIVE FEED</p>
                  <video ref={videoRef} muted style={{ width:"100%", borderRadius:"8px", background:"#0a0a0a", minHeight:"180px", objectFit:"cover" }} />
                  {!webcamOn && <p style={{ ...S.muted, fontSize:"12px", marginTop:"8px" }}>Camera not enabled. Answers are still recorded.</p>}
                </div>

                {/* Answered summary */}
                <div style={S.card("#374151")}>
                  <p style={{ ...S.muted, margin:"0 0 10px", fontSize:"12px", fontWeight:"600" }}>ANSWERS RECORDED</p>
                  {session.questions.map((q,i) => (
                    <div key={i} style={{ display:"flex", gap:"8px", alignItems:"center", padding:"5px 0" }}>
                      <span style={{ width:"20px", height:"20px", borderRadius:"50%", fontSize:"10px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center",
                        background: i < currentIdx && session.questions[i].completed ? "#10b981" : i === currentIdx ? "#2563eb" : "#374151",
                        color:"#fff" }}>
                        {i+1}
                      </span>
                      <p style={{ ...S.muted, margin:0, fontSize:"11px", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {q.question.slice(0, 35)}...
                      </p>
                      {i < currentIdx && <span style={{ color: session.questions[i].completed?"#10b981":"#ef4444", fontSize:"12px" }}>
                        {session.questions[i].completed?"✅":"⭕"}
                      </span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── COMPLETE ── */}
          {phase === "complete" && session && (
            <div style={{ maxWidth:"700px" }}>
              <div style={{ background:"linear-gradient(135deg,#111827,#0a0a0a)", borderRadius:"20px", padding:"40px", border:"1px solid #374151", textAlign:"center", marginBottom:"20px" }}>
                <div style={{ fontSize:"64px", marginBottom:"16px" }}>🎤</div>
                <h2 style={{ color:"#f9fafb", margin:"0 0 6px", fontSize:"28px" }}>Interview Complete!</h2>
                <p style={{ color:"#6b7280", marginBottom:"30px" }}>{session.interviewType} Interview · Duration: {formatTime(session.totalDuration||0)}</p>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", marginBottom:"28px" }}>
                  {[
                    { label:"Overall Score",  value:`${session.overallScore}%`,         color: scoreColor(session.overallScore) },
                    { label:"Questions Done", value:`${session.questionsCompleted}/${session.questions?.length||0}`, color:"#60a5fa" },
                    { label:"Duration",       value: formatTime(session.totalDuration||0), color:"#c084fc" },
                  ].map(s => (
                    <div key={s.label} style={{ background:"#0a0a0a", borderRadius:"12px", padding:"20px" }}>
                      <p style={{ color:"#6b7280", margin:"0 0 6px", fontSize:"12px" }}>{s.label}</p>
                      <p style={{ color:s.color, margin:0, fontSize:"26px", fontWeight:"900" }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {session.strengths?.length > 0 && (
                  <div style={{ background:"#022c22", border:"1px solid #10b98140", borderRadius:"12px", padding:"16px", textAlign:"left", marginBottom:"12px" }}>
                    <h4 style={{ color:"#10b981", margin:"0 0 8px" }}>💪 Strengths</h4>
                    {session.strengths.map((s,i) => <p key={i} style={{ color:"#6ee7b7", margin:"3px 0", fontSize:"13px" }}>• {s}</p>)}
                  </div>
                )}
                {session.weaknesses?.length > 0 && (
                  <div style={{ background:"#450a0a", border:"1px solid #ef444440", borderRadius:"12px", padding:"16px", textAlign:"left", marginBottom:"20px" }}>
                    <h4 style={{ color:"#ef4444", margin:"0 0 8px" }}>🔧 Areas to Improve</h4>
                    {session.weaknesses.map((w,i) => <p key={i} style={{ color:"#fca5a5", margin:"3px 0", fontSize:"13px" }}>• {w}</p>)}
                  </div>
                )}

                <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
                  <button style={S.btn()} onClick={() => { setPhase("setup"); setSession(null); setSessionId(null); setTranscript(""); setTimer(0); }}>
                    🔄 New Interview
                  </button>
                </div>
              </div>

              {/* Answer history */}
              <div style={{ background:"#111827", borderRadius:"16px", padding:"20px", border:"1px solid #374151" }}>
                <h3 style={{ color:"#e5e7eb", margin:"0 0 16px" }}>📝 Answer History</h3>
                {session.questions?.map((q,i) => (
                  <div key={i} style={{ padding:"14px 0", borderBottom:"1px solid #1f2937" }}>
                    <p style={{ color:"#60a5fa", margin:"0 0 4px", fontSize:"13px", fontWeight:"600" }}>Q{i+1}: {q.question}</p>
                    <p style={{ color: q.transcript?"#d1d5db":"#6b7280", margin:0, fontSize:"13px", fontStyle: q.transcript?"normal":"italic" }}>
                      {q.transcript || "No answer recorded."}
                    </p>
                    {q.timeTaken > 0 && <p style={{ color:"#6b7280", margin:"4px 0 0", fontSize:"11px" }}>⏱ Time: {formatTime(q.timeTaken)}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
