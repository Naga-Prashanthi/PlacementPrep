import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getUser, authHeaders, API } from "../utils/auth";

function CompanyQuestions() {
  const { company, category } = useParams();
  const [questions, setQuestions] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  
  const [activeModalQ, setActiveModalQ] = useState(null);
  const [solutionProof, setSolutionProof] = useState("");
  const [notification, setNotification] = useState("");

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${API}/api/questions?company=${company}&category=${category}`, { headers: authHeaders() });
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUser = () => {
    const user = getUser();
    if (user?.questionProgress) setUserProgress(user.questionProgress || []);
  };

  useEffect(() => {
    fetchQuestions();
    fetchUser();
  }, [company, category]);

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

  return (
    <>
      <Navbar />
      <div className="page" style={{ padding: '20px' }}>
        <h1>{company.toUpperCase()} - {category} Questions</h1>

        <table className="question-table" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Question</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => {
              const status = getStatus(q._id);
              return (
                <tr key={q._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{q.title}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: status === 'Solved' ? 'green' : (status === 'Attempted' ? 'orange' : 'gray') }}>
                    {status}
                  </td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <a 
                      href={category === 'DSA' || category === 'SQL' 
                        ? `https://leetcode.com/problems/${q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/` 
                        : `https://www.google.com/search?q=${encodeURIComponent(q.title + " " + company + " assessment questions")}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ padding: '6px 12px', background: '#f59e0b', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}
                    >
                      Solve on Platform ↗
                    </a>
                    
                    <button 
                      onClick={() => setActiveModalQ(q)}
                      disabled={status === 'Solved'}
                      style={{ padding: '6px 12px', background: status === 'Solved' ? '#ccc' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: status === 'Solved' ? 'not-allowed' : 'pointer' }}
                    >
                      {status === 'Attempted' ? 'Submit Proof' : (status === 'Solved' ? 'Completed' : 'Verify')}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {activeModalQ && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
              <h2>Attempt Question</h2>
              <p><strong>{activeModalQ.title}</strong></p>
              <textarea 
                rows="6" 
                style={{ width: '100%', padding: '10px', marginTop: '10px', marginBottom: '10px' }}
                placeholder="Provide your solution proof, code link, or explanation here for verification..."
                value={solutionProof}
                onChange={(e) => setSolutionProof(e.target.value)}
              ></textarea>
              {notification && <p style={{ color: notification.includes('❌') || notification.includes('Failed') ? 'red' : 'green', margin: '10px 0' }}>{notification}</p>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={submitProof}
                  style={{ flex: 1, padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Submit for Verification
                </button>
                <button 
                  onClick={() => { setActiveModalQ(null); setNotification(""); setSolutionProof(""); }}
                  style={{ padding: '10px', background: 'gray', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default CompanyQuestions;