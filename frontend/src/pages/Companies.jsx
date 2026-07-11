import { Link } from "react-router-dom";
import { useState } from "react";
import companies from "../data/companies";
import "../styles/Companies.css";

function Companies() {
const [search, setSearch] = useState("");

const filteredCompanies = companies.filter((company) =>
company.name.toLowerCase().includes(search.toLowerCase())
);

return ( <div className="companies-page">

  <div className="companies-header">

    <h1>Company Wise Preparation</h1>

    <p>
      Prepare for placements with company-specific
      DSA, SQL, Aptitude and Interview Questions.
    </p>

    <input
      type="text"
      placeholder="Search company..."
      className="search-box"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

  </div>

  <div className="companies-grid">

    {filteredCompanies.map((company) => (

      <div
        key={company.id}
        className="company-card"
      >

        <div className="company-top">

          <div className="company-logo">
            {company.name.charAt(0)}
          </div>

          <div>
            <h2>{company.name}</h2>
            <p className="company-desc">
              Placement Preparation Portal
            </p>
          </div>

        </div>

        <div className="company-details">

          <div className="detail-row">
            <span>DSA Questions</span>
            <strong>10</strong>
          </div>

          <div className="detail-row">
            <span>SQL Questions</span>
            <strong>5</strong>
          </div>

          <div className="detail-row">
            <span>Aptitude</span>
            <strong>5</strong>
          </div>

          <div className="detail-row">
            <span>Interview</span>
            <strong>5</strong>
          </div>

        </div>

        <Link
          to={`/company/${company.name.toLowerCase()}`}
        >
          <button className="view-btn">
            Start Preparation
          </button>
        </Link>

      </div>

    ))}

  </div>

</div>

);
}

export default Companies;
