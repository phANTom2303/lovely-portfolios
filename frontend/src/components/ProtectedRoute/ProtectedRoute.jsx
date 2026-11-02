import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";

function ProtectedRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;