import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import companyData from "../data/companyData";
import "../styles/Questions.css";

function DSAQuestions() {
  const { company } = useParams();

  const [search, setSearch] = useState("");
  const [questionStatus, setQuestionStatus] = useState({});

  const questions = companyData[company]?.dsa || [];

  useEffect(() => {
    const savedStatus =
      JSON.parse(localStorage.getItem(`${company}-dsa-status`)) || {};

    setQuestionStatus(savedStatus);
  }, [company]);

  const updateStatus = (title, status) => {
    const updatedStatus = {
      ...questionStatus,
      [title]: status,
    };

    setQuestionStatus(updatedStatus);

    localStorage.setItem(
      `${company}-dsa-status`,
      JSON.stringify(updatedStatus)
    );

    // Update global dsaData for dashboard sync
    const dsaData = JSON.parse(localStorage.getItem("dsaData")) || [];
    const existingIndex = dsaData.findIndex(q => q.title === title && q.category === "dsa");
    
    if (existingIndex >= 0) {
      if (status === "Solved") {
        dsaData[existingIndex].done = true;
        dsaData[existingIndex].attempted = true;
      } else if (status === "Attempted") {
        dsaData[existingIndex].attempted = true;
      }
    } else {
      dsaData.push({
        title,
        category: "dsa",
        company,
        done: status === "Solved",
        attempted: true
      });
    }
    
    localStorage.setItem("dsaData", JSON.stringify(dsaData));
  };

  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  const attemptedCount = Object.values(questionStatus).filter(
    (status) => status === "Attempted"
  ).length;

  const solvedCount = Object.values(questionStatus).filter(
    (status) => status === "Solved"
  ).length;

  return (
    <>
      <Navbar />
      <div className="questions-page">
        <div className="page-header">
          <h1>📘 {company?.toUpperCase()} DSA Questions</h1>

        <p>Total Questions: {filteredQuestions.length}</p>

        <p className="progress-text">
          🟡 Attempted: {attemptedCount}
        </p>

        <p className="progress-text">
          🟢 Solved: {solvedCount}
        </p>
      </div>

      <input
        type="text"
        placeholder="🔍 Search Question..."
        className="search-box"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="question-grid">
        {filteredQuestions.map((q, index) => (
          <div key={index} className="question-card">
            <h2>{q.title}</h2>

            <span
              className={`difficulty ${q.difficulty.toLowerCase()}`}
            >
              {q.difficulty}
            </span>

            <p className="platform">
              💻 {q.platform}
            </p>

            <a
              href={q.link}
              target="_blank"
              rel="noreferrer"
            >
              <button className="solve-btn">
                Solve Question
              </button>
            </a>

            <p className="status-text">
              Status:
              {questionStatus[q.title] === "Solved"
                ? " 🟢 Solved"
                : questionStatus[q.title] === "Attempted"
                ? " 🟡 Attempted"
                : " ⚪ Not Started"}
            </p>

            {questionStatus[q.title] !== "Attempted" &&
              questionStatus[q.title] !== "Solved" && (
                <button
                  className="attempt-btn"
                  onClick={() =>
                    updateStatus(q.title, "Attempted")
                  }
                >
                  Mark Attempted
                </button>
              )}

            {questionStatus[q.title] === "Attempted" && (
              <button
                className="mark-btn"
                onClick={() =>
                  updateStatus(q.title, "Solved")
                }
              >
                Mark Solved
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

export default DSAQuestions;