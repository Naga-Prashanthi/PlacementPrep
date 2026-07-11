import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/Challenges.css";
import { getUser, authHeaders, API } from "../utils/auth";

function Challenges() {
  const [dailyQuestions, setDailyQuestions] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  
  const [activeModalQ, setActiveModalQ] = useState(null);
  const [solutionProof, setSolutionProof] = useState("");
  const [notification, setNotification] = useState("");

  const fetchChallenges = async () => {
    try {
      const res = await fetch(`${API}/api/challenges/daily`, { headers: authHeaders() });
      const data = await res.json();
      setDailyQuestions(data);
    } catch(err) {
      console.error(err);
    }
  };

  const fetchUser = () => {
    const user = getUser();
    if (user?.questionProgress) setUserProgress(user.questionProgress || []);
  };

  useEffect(() => {
    fetchChallenges();
    fetchUser();
  }, []);

  const getStatus = (qId) => {
    const p = userProgress.find(u => u.questionId === qId || u.questionId === qId.toString());
    return p ? p.status : 'Not Started';
  };

  const submitProof = async () => {
    if (solutionProof.trim().length < 10) {
      setNotification("Please enter a valid solution proof or explanation.");
      return;
    }
    
    setNotification("Submitting for verification...");
    const user = getUser();
    
    // Auto-Verify for simulation strictly if length > 30, else just Attempted
    const newStatus = solutionProof.length > 50 ? "Solved" : "Attempted";

    try {
      const res = await fetch(`${API}/api/questions/status`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ questionId: activeModalQ._id, status: newStatus })
      });
      const data = await res.json();
      
      // Update local storage
      user.questionProgress = data;
      localStorage.setItem("currentUser", JSON.stringify(user));
      setUserProgress(data);
      
      setNotification(newStatus === "Solved" ? "✅ Verified and Marked as Solved!" : "⏳ Marked as Attempted. Needs Further Verification.");
      
      setTimeout(() => {
        setActiveModalQ(null);
        setSolutionProof("");
        setNotification("");
      }, 3000);
      
    } catch(err) {
      setNotification("Failed to update status.");
    }
  };

  const solvedCount = dailyQuestions.filter(q => getStatus(q._id) === 'Solved').length;
  const attemptedCount = dailyQuestions.filter(q => getStatus(q._id) === 'Attempted').length;

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <Sidebar />
        <div className="content">
          <div className="challenges-header" style={{ marginBottom: '30px' }}>
            <h1>🎯 Daily Challenges</h1>
            <p className="subtitle">Complete these daily questions to build your confidence and streak!</p>
            
            <div className="challenge-stats" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <div className="stat" style={{ background: '#ecfdf5', padding: '15px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
                <span className="stat-label">Today's Solved</span>
                <div className="stat-value solved" style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{solvedCount}/{dailyQuestions.length}</div>
              </div>
              <div className="stat" style={{ background: '#fffbeb', padding: '15px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
                <span className="stat-label">Attempted</span>
                <div className="stat-value attempted" style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{attemptedCount}/{dailyQuestions.length}</div>
              </div>
            </div>

            {solvedCount === dailyQuestions.length && dailyQuestions.length > 0 && (
              <div className="celebration" style={{ background: '#dcfce7', padding: '20px', borderRadius: '8px', marginTop: '20px', color: '#15803d', fontWeight: 'bold' }}>
                🎉 Amazing! You completed today's challenges! Come back tomorrow for new ones.
              </div>
            )}
          </div>

          <div className="questions-container" style={{ display: 'grid', gap: '20px' }}>
            {dailyQuestions.map((q) => {
              const status = getStatus(q._id);
              return (
                <div key={q._id} className="daily-question-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '18px', margin: 0 }}>{q.title}</h2>
                    <div className="badges" style={{ display: 'flex', gap: '8px' }}>
                      <span className="type-badge" style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{q.category}</span>
                      <span className="company-badge" style={{ background: '#f3f4f6', color: '#374151', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{q.company}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="status-label" style={{ fontWeight: 'bold', color: status === 'Solved' ? 'green' : (status === 'Attempted' ? 'orange' : 'gray') }}>
                      Status: {status === 'Solved' ? " ✅ Verified Solved" : (status === 'Attempted' ? " ⏳ Attempted" : " ⭕ Not Started")}
                    </p>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <a href={`/question/${q._id}`}
                        style={{ padding: '8px 16px', background: '#1f2937', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}
                      >
                        View & Attempt ↗
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </>
  );
}

export default Challenges;