import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    // If not logged in at all, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    // If route requires admin but user is student, redirect to student dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized
  return children;
}

export default ProtectedRoute;
