import { Link } from "react-router-dom";
import dsaQuestions from "../data/dsaQuestions";
import "../styles/DSA.css";

function DSA() {
  return (
    <div className="dsa-container">

      <div className="dsa-header">
        <h1>DSA Practice Sheet</h1>
        <p>
          Track and solve important coding interview questions
        </p>
      </div>

      <table className="question-table">

        <thead>
          <tr>
            <th>#</th>
            <th>Question</th>
            <th>Topic</th>
            <th>Difficulty</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {dsaQuestions.map((q, index) => (

            <tr key={q.id}>

              <td>{index + 1}</td>

              <td className="question-name">
                {q.title}
              </td>

              <td>{q.topic}</td>

              <td>
                <span
                  className={
                    q.difficulty === "Easy"
                      ? "easy"
                      : q.difficulty === "Medium"
                      ? "medium"
                      : "hard"
                  }
                >
                  {q.difficulty}
                </span>
              </td>

              <td>

                <Link to={`/question/${q.id}`}>
                  <button className="solve-btn">
                    View Question
                  </button>
                </Link>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default DSA;