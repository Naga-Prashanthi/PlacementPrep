import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getUser, authHeaders, API } from "../utils/auth";
import "../styles/DSA.css";

function SQL() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [questionStatus, setQuestionStatus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/api/questions?category=SQL`);
        const qData = await res.json();
        
        // Remove duplicates by title since multiple companies might have the same SQL question
        const uniqueQs = [];
        const seen = new Set();
        for(const q of qData) {
           if(!seen.has(q.title.toLowerCase())) {
              seen.add(q.title.toLowerCase());
              uniqueQs.push({ ...q, difficulty: "Medium", topic: "General" }); // dummy topic/difficulty
           }
        }
        setQuestions(uniqueQs);

        const userRes = await fetch(`${API}/api/student/profile`, { headers: authHeaders() });
        if(userRes.ok) {
          const userData = await userRes.json();
          const progress = userData.questionProgress || [];
          
          const statusMap = {};
          progress.forEach(p => {
             if (p.questionId && p.questionId.title) {
                 statusMap[p.questionId.title] = p.status;
             }
          });
          setQuestionStatus(statusMap);
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const toggleDone = async (title) => {
    try {
      const q = questions.find(dbq => dbq.title === title);
      const currentStatus = questionStatus[title];
      const newStatus = currentStatus === "Solved" ? "Not Started" : "Solved";
      
      const res = await fetch(`${API}/api/questions/status`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ questionId: q._id, status: newStatus === "Not Started" ? "Attempted" : "Solved" }) 
        // Note: the backend handles "Attempted" marking for students marking "Solved" if verification is needed,
        // but since we just want to send status update, we send Solved/Attempted.
      });
      const data = await res.json();
      
      setQuestionStatus(prev => ({ ...prev, [title]: newStatus }));
      
      const user = getUser();
      if(user) {
        user.questionProgress = data.questionProgress;
        localStorage.setItem("currentUser", JSON.stringify(user));
      }
    } catch(err) { console.error(err); }
  };

  const filtered = questions.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase())
  );

  const total = questions.length;
  const solved = Object.values(questionStatus).filter(s => s === "Solved").length;

  return (
    <>
    <Navbar />
    <div className="page" style={{ padding: "40px" }}>
      <h1>SQL Tracker</h1>
      <p>
        Total Questions: {total} | Solved: {solved}
      </p>

      <input
        className="search"
        type="text"
        placeholder="Search SQL questions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
      />

      <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Done</th>
            <th style={{ padding: "10px", borderBottom: "2px solid #ddd", textAlign:"left" }}>Question</th>
            <th style={{ padding: "10px", borderBottom: "2px solid #ddd", textAlign:"left" }}>Company</th>
            <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(q => {
            const isDone = questionStatus[q.title] === "Solved";
            return (
            <tr key={q._id}>
              <td style={{ textAlign:"center", padding:"10px", borderBottom:"1px solid #ddd" }}>
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleDone(q.title)}
                />
              </td>
              <td style={{ padding:"10px", borderBottom:"1px solid #ddd" }}>{q.title}</td>
              <td style={{ padding:"10px", borderBottom:"1px solid #ddd" }}>{q.company}</td>
              <td style={{ textAlign:"center", padding:"10px", borderBottom:"1px solid #ddd" }}>
                <span className="tag-medium">{q.difficulty}</span>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
    </>
  );
}

export default SQL;