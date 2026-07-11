import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { FaMicrophone, FaVideo, FaUsers, FaRobot, FaArrowLeft } from "react-icons/fa";
import companyData from "../data/companyData";
import "../styles/Interview.css";

function InterviewExperience() {
  const { company } = useParams();
  const [currentRound, setCurrentRound] = useState(0); // 0 = Selection, 1 = Coding, 2 = HR, 3 = Face to Face, 4 = Completed
  const [started, setStarted] = useState(false);
  
  const codingQuestions = [
    "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
    "Reverse a linked list iteratively and recursively.",
    "Find the longest substring without repeating characters."
  ];

  const hrQuestions = [
    "Tell me about yourself.",
    "Why do you want to join our company?",
    "Describe a time when you overcame a challenge."
  ];

  const faceToFaceQuestions = [
    "Walk me through your resume and explain your most impactful project.",
    "How would you design a scalable system like a URL shortener?",
    "Explain your approach to resolving merge conflicts in a team setting."
  ];

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleStartProcess = () => {
    setCurrentRound(1);
    setStarted(true);
    setCurrentQIndex(0);
  };

  const submitAnswer = () => {
    if (answer.trim().length < 30) {
      setFeedback("❌ Your answer is too short and lacks detail. In a real interview, you must provide comprehensive, structured reasoning to clear the round. Please elaborate.");
      return;
    }
    setFeedback("✅ Good response! You've provided a solid level of detail. Keep your pace slow and confident.");
  };

  const nextQuestionOrRound = () => {
    if (!feedback.includes("✅")) {
      alert("You must provide an acceptable answer and submit it before moving forward in a real interview!");
      return;
    }

    setAnswer("");
    setFeedback("");
    
    let questionsForRound = codingQuestions;
    if (currentRound === 2) questionsForRound = hrQuestions;
    if (currentRound === 3) questionsForRound = faceToFaceQuestions;

    if (currentQIndex < questionsForRound.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      if (currentRound < 3) {
        alert("Congratulations on clearing this round! Moving to the next round...");
        setCurrentRound(currentRound + 1);
        setCurrentQIndex(0);
      } else {
        alert("You have successfully completed all interview rounds!");
        setCurrentRound(4);
      }
    }
  };

  if (!started) {
    return (
      <div className="interview-mode-selection">
        <div className="mode-header" style={{ padding: '40px', textAlign: 'center' }}>
          <h1>🚀 {company?.toUpperCase()} Structured Interview Preparation</h1>
          <p>Conquer your interview anxiety by practicing real rounds sequentially.</p>
        </div>
        <div className="mode-grid" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="mode-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Interview Process</h2>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', lineHeight: '2' }}>
              <li><strong>Round 1:</strong> Normal Coding Round</li>
              <li><strong>Round 2:</strong> HR Round</li>
              <li><strong>Round 3:</strong> Face to Face Technical Interview</li>
            </ul>
            <p>Clear each round to move to the next. Get comfortable with the format to remove your fear.</p>
            <button className="mode-btn" onClick={handleStartProcess}>
              Start Full Interview Process
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentRound === 4) {
    return (
      <div className="interview-mode-selection">
        <div className="mode-header" style={{ textAlign: 'center', padding: '40px' }}>
          <h1>🎉 Congratulations!</h1>
          <p>You have conquered your fear and successfully completed all rounds.</p>
          <Link to="/dashboard">
            <button className="mode-btn">Return to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  let questionsForRound = codingQuestions;
  let roundTitle = "Round 1: Coding";
  if (currentRound === 2) {
    questionsForRound = hrQuestions;
    roundTitle = "Round 2: HR Round";
  }
  if (currentRound === 3) {
    questionsForRound = faceToFaceQuestions;
    roundTitle = "Round 3: Face to Face Interview";
  }

  return (
    <div className="interview-session">
      <div className="interview-header">
        <h1>{company?.toUpperCase()} - {roundTitle}</h1>
        <div className="progress">
          Question {currentQIndex + 1} of {questionsForRound.length}
        </div>
      </div>

      <div className="interview-container">
        <div className="question-panel">
          <div className="question-content">
            <h2>{questionsForRound[currentQIndex]}</h2>
          </div>
          {feedback && (
            <div className="ai-feedback" style={{ marginTop: '20px', padding: '15px', background: '#e0f2fe', borderRadius: '8px' }}>
              <h4>💡 Friendly Tip</h4>
              <p>{feedback}</p>
            </div>
          )}
        </div>

        <div className="answer-panel">
          <div className="answer-header">
            <h3>Your Answer</h3>
          </div>
          <textarea
            className="answer-input"
            placeholder="Type your structured answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            style={{ width: '100%', padding: '10px', borderRadius: '5px' }}
          />

          <div className="answer-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button className="btn-primary" onClick={submitAnswer}>
              Submit & Check Tips
            </button>
            <button className="btn-secondary" onClick={nextQuestionOrRound}>
              {currentQIndex === questionsForRound.length - 1 ? "Complete Round ->" : "Next Question ->"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewExperience;