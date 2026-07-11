import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/Portal.css";

function CompanyPortal() {
  const { company } = useParams();

  return (
    <>
      <Navbar />
      <div className="portal-container">

      <div className="portal-header">
        <h1>{company?.toUpperCase()} Placement Portal</h1>
        <p>
          Practice company-specific questions and interview preparation
        </p>
      </div>

      <div className="portal-grid">

        <Link
          to={`/company/${company}/questions/DSA`}
          className="portal-card"
        >
          <h2>📘 DSA Questions</h2>
          <p>Practice Coding Questions</p>
        </Link>

        <Link
          to={`/company/${company}/questions/SQL`}
          className="portal-card"
        >
          <h2>🗄 SQL Questions</h2>
          <p>Database & SQL Practice</p>
        </Link>

        <Link
          to={`/company/${company}/questions/Aptitude`}
          className="portal-card"
        >
          <h2>🧠 Aptitude</h2>
          <p>Quantitative & Logical Questions</p>
        </Link>

        <Link
          to={`/company/${company}/questions/Technical Interview`}
          className="portal-card"
        >
          <h2>💻 Technical Interview</h2>
          <p>Core CS & System Design</p>
        </Link>

        <Link
          to={`/company/${company}/questions/HR Interview`}
          className="portal-card"
        >
          <h2>🤝 HR Interview</h2>
          <p>Behavioral & Soft Skills</p>
        </Link>

      </div>

    </div>
    </>
  );
}

export default CompanyPortal;