import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (
      token &&
      token !== "undefined" &&
      token !== "null" &&
      token.trim() !== ""
    ) {
      setIsAuth(true);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return isAuth ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;