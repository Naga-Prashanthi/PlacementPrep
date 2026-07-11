import { Link } from "react-router-dom";
import {
  FaAmazon,
  FaGoogle,
  FaCode,
  FaDatabase,
  FaBrain,
  FaChartLine,
  FaPlay,
  FaCheckCircle,
  FaStar,
  FaUsers,
  FaTrophy,
} from "react-icons/fa";
import { SiInfosys, SiAccenture } from "react-icons/si";
import Navbar from "../components/Navbar";
import "../styles/Home.css";

function Home() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-left">

          <p className="hero-badge">
            🚀 Trusted by Placement Aspirants
          </p>

          <h1>
            Master Assessments.
            <br />
            Unlock Opportunities.
          </h1>

          <p>
            Practice company-specific DSA, SQL,
            Aptitude and Interview Questions.
            Track your progress and prepare smarter
            for placements.
          </p>

          <div className="hero-buttons">
            <Link to="/signup">
              <button className="btn-primary">
                Get Started
              </button>
            </Link>

            <Link to="/login">
              <button className="btn-secondary">
                Student Login
              </button>
            </Link>

            <Link to="/admin-login">
              <button className="btn-secondary" style={{ border: '2px solid tomato', color: 'tomato' }}>
                Admin Access
              </button>
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
            alt="Placement Preparation"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="stats">

        <div className="stat-card">
          <span className="stat-icon">🏢</span>
          <h2>15+</h2>
          <p>Companies</p>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📘</span>
          <h2>200+</h2>
          <p>DSA Questions</p>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🗄️</span>
          <h2>100+</h2>
          <p>SQL Questions</p>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🧠</span>
          <h2>150+</h2>
          <p>Aptitude Questions</p>
        </div>

      </section>

      {/* Features */}
      <section className="features">
        <h2>Why Choose PlacementPrep?</h2>

        <div className="feature-grid">

          <div className="card">
            <FaCode size={45} />
            <h3>DSA Preparation</h3>
            <p>
              Practice company-specific coding questions.
            </p>
          </div>

          <div className="card">
            <FaDatabase size={45} />
            <h3>SQL Practice</h3>
            <p>
              Prepare important SQL interview questions.
            </p>
          </div>

          <div className="card">
            <FaBrain size={45} />
            <h3>Aptitude Training</h3>
            <p>
              Improve logical and quantitative skills.
            </p>
          </div>

          <div className="card">
            <FaChartLine size={45} />
            <h3>Progress Tracking</h3>
            <p>
              Monitor your preparation journey.
            </p>
          </div>

        </div>
      </section>

      {/* Recruiters */}
      <section className="companies">

        <h2>Top Recruiters</h2>

        <div className="company-grid">

          <div className="company-card">
            <FaAmazon size={55} />
            <h3>Amazon</h3>
          </div>

          <div className="company-card">
            <FaGoogle size={55} />
            <h3>Google</h3>
          </div>

          <div className="company-card">
            <SiInfosys size={55} />
            <h3>Infosys</h3>
          </div>

          <div className="company-card">
            <h3>TCS</h3>
          </div>

          <div className="company-card">
            <h3>Wipro</h3>
          </div>

          <div className="company-card">
            <SiAccenture size={55} />
            <h3>Accenture</h3>
          </div>

        </div>

      </section>

      {/* Dashboard Preview */}
      <section className="preview">

        <h2>Track Your Progress</h2>

        <div className="preview-card">

          <div>
            <h3>📘 DSA</h3>
            <p>200+ Questions</p>
          </div>

          <div>
            <h3>🗄️ SQL</h3>
            <p>100+ Questions</p>
          </div>

          <div>
            <h3>🧠 Aptitude</h3>
            <p>150+ Questions</p>
          </div>

          <div>
            <h3>🎤 Interview</h3>
            <p>100+ Questions</p>
          </div>

        </div>

      </section>

      {/* How It Works */}
      <section className="features">

        <h2>How It Works</h2>

        <div className="feature-grid">

          <div className="card">
            <h3>1️⃣ Choose Company</h3>
            <p>Select your dream company.</p>
          </div>

          <div className="card">
            <h3>2️⃣ Practice Questions</h3>
            <p>Prepare DSA, SQL and Aptitude.</p>
          </div>

          <div className="card">
            <h3>3️⃣ Interview Prep</h3>
            <p>Learn HR and Technical Questions.</p>
          </div>

          <div className="card">
            <h3>4️⃣ Track Progress</h3>
            <p>Monitor your preparation journey.</p>
          </div>

        </div>

      </section>

      {/* Interview Experience Section */}
      <section className="interview-section">
        <h2>AI-Powered Interview Practice</h2>

        <div className="interview-grid">
          <div className="interview-card">
            <h3>🤖 AI Interviewer Mode</h3>
            <p>
              Practice with our AI interviewer that simulates real interview scenarios. 
              Get instant feedback on your answers and suggestions for improvement.
            </p>
            <div className="rating">
              <span>⭐⭐⭐⭐⭐</span>
              <span>(500+ reviews)</span>
            </div>
          </div>

          <div className="interview-card">
            <h3>👥 Peer Interview Practice</h3>
            <p>
              Connect with other students and practice interviews together. 
              Experience real scenarios and get constructive feedback from peers.
            </p>
            <div className="rating">
              <span>⭐⭐⭐⭐⭐</span>
              <span>(320+ reviews)</span>
            </div>
          </div>

          <div className="interview-card">
            <h3>📊 Performance Analytics</h3>
            <p>
              Track your interview performance over time. Get detailed analytics 
              and insights to improve your weak areas.
            </p>
            <div className="rating">
              <span>⭐⭐⭐⭐⭐</span>
              <span>(280+ reviews)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>Success Stories</h2>

        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>
              "PlacementPrep helped me crack Amazon! The AI interviewer was incredibly realistic 
              and helped me identify my weak areas before the actual interview."
            </p>
            <div className="author">
              <div className="avatar">AJ</div>
              <div className="author-info">
                <h4>Arjun Joshi</h4>
                <p>Amazon - SDE Intern</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <p>
              "The peer interview practice sessions were game-changers for me. I practiced with 
              real people and got feedback that helped me improve my communication skills."
            </p>
            <div className="author">
              <div className="avatar">SP</div>
              <div className="author-info">
                <h4>Sarah Patel</h4>
                <p>Google - Associate</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <p>
              "From DSA to SQL to Aptitude, PlacementPrep has everything I needed. 
              The progress tracking feature kept me motivated throughout my preparation."
            </p>
            <div className="author">
              <div className="avatar">RK</div>
              <div className="author-info">
                <h4>Raj Kumar</h4>
                <p>Microsoft - Developer</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <p>
              "The company-specific question banks were incredibly helpful. I knew exactly 
              what to expect when I walked into my interview with Infosys."
            </p>
            <div className="author">
              <div className="avatar">MP</div>
              <div className="author-info">
                <h4>Meera Rao</h4>
                <p>Infosys - Systems Engineer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">

        <h2>
          Ready to Crack Your Dream Company?
        </h2>

        <Link to="/signup">
          <button className="btn-primary">
            Start Preparation
          </button>
        </Link>

      </section>

      {/* Footer */}
      <footer className="footer">
        <h3>PlacementPrep</h3>

        <p>
          MERN Stack Placement Preparation Portal
        </p>

        <p>
          © 2026 All Rights Reserved
        </p>
      </footer>
    </>
  );
}

export default Home;