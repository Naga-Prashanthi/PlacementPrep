import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import companyData from "../data/companyData";
import "../styles/Questions.css";

function AptitudeQuestions() {

  const { company } = useParams();

  const [search, setSearch] = useState("");

  const questions =
    companyData[company]?.aptitude || [];

  const filteredQuestions =
    questions.filter((q) =>
      q.title.toLowerCase().includes(
        search.toLowerCase()
      )
    );

  return (
    <>
      <Navbar />
      <div className="questions-page">

      <div className="page-header">
        <h1>
          🧠 {company?.toUpperCase()} Aptitude
        </h1>

        <p>
          Total Questions:
          {filteredQuestions.length}
        </p>
      </div>

      <input
        type="text"
        placeholder="🔍 Search Aptitude Topic..."
        className="search-box"
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <div className="question-grid">

        {filteredQuestions.map(
          (q, index) => (

            <div
              key={index}
              className="question-card"
            >

              <h2>{q.title}</h2>

              <p className="platform">
                🧠 {q.platform}
              </p>

              <a
                href={q.link}
                target="_blank"
                rel="noreferrer"
              >
                <button className="solve-btn">
                  Practice Now
                </button>
              </a>

            </div>

          )
        )}

      </div>

    </div>
    </>
  );
}

export default AptitudeQuestions;