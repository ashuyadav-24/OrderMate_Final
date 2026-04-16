import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // ❌ If not logged in → go to login
  if (!token) {
    return <Navigate to="/" />;
  }

  // ✅ If logged in → allow access
  return children;
};

export default ProtectedRoute;