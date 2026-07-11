import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DSA from "./pages/DSA";
import SQL from "./pages/SQL";
import Challenges from "./pages/Challenges";
import QuestionDetails from "./pages/QuestionDetails";
import Companies from "./pages/Companies";
import CompanyPortal from "./pages/CompanyPortal";
import CompanyQuestions from "./pages/CompanyQuestions";
import Profile from "./pages/Profile";
import EligibilityChecker from "./pages/EligibilityChecker";
import ProtectedRoute from "./components/ProtectedRoute";


import InterviewSimulator from "./pages/InterviewSimulator";

// New feature pages
import QuestionBank   from "./pages/QuestionBank";
import VivaSimulator  from "./pages/VivaSimulator";
import FaceInterview  from "./pages/FaceInterview";
import InterviewHub   from "./pages/InterviewHub";

function App() {
  return (
    <Routes>

      {/* ── Public routes ── */}
      <Route path="/"            element={<Home />} />
      <Route path="/login"       element={<Login />} />
      <Route path="/signup"      element={<Signup />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* ── Protected routes ── */}
      <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/eligibility" element={<ProtectedRoute><EligibilityChecker /></ProtectedRoute>} />

      <Route path="/dsa"         element={<ProtectedRoute><DSA /></ProtectedRoute>} />
      <Route path="/sql"         element={<ProtectedRoute><SQL /></ProtectedRoute>} />
      <Route path="/challenges"  element={<ProtectedRoute><Challenges /></ProtectedRoute>} />

      <Route path="/question/:id" element={<ProtectedRoute><QuestionDetails /></ProtectedRoute>} />


      <Route path="/interview"   element={<ProtectedRoute><InterviewSimulator /></ProtectedRoute>} />

      {/* ── New feature routes ── */}
      <Route path="/question-bank"  element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
      <Route path="/interview-hub"  element={<ProtectedRoute><InterviewHub /></ProtectedRoute>} />
      <Route path="/viva"           element={<ProtectedRoute><VivaSimulator /></ProtectedRoute>} />
      <Route path="/face-interview" element={<ProtectedRoute><FaceInterview /></ProtectedRoute>} />

      <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />

      <Route path="/company/:company"
        element={<ProtectedRoute><CompanyPortal /></ProtectedRoute>} />

      <Route path="/company/:company/questions/:category"
        element={<ProtectedRoute><CompanyQuestions /></ProtectedRoute>} />

    </Routes>
  );
}

export default App;