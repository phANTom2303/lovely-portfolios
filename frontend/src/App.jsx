import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Landing from "./pages/Landing/Landing";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import Profile from "./pages/profile/Profile";
import PortfolioPage from "./pages/Portfolio/PortfolioPage";
import PortfolioEdit from "./pages/PortfolioEdit/PortfolioEdit";
import GeneratePortfolioTest from "./pages/GeneratePortfolioTest/GeneratePortfolioTest";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/generate"
            element={
              <ProtectedRoute>
                <GeneratePortfolioTest />
              </ProtectedRoute>
            }
          />
          {/* Public: published portfolios only */}
          <Route path="/portfolio/:portfolioId" element={<PortfolioPage mode="public" />} />
          <Route path="/p/:portfolioId" element={<PortfolioPage mode="public" />} />
          <Route
            path="/portfolio/:portfolioId/preview"
            element={
              <ProtectedRoute>
                <PortfolioPage mode="preview" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio/:portfolioId/edit"
            element={
              <ProtectedRoute>
                <PortfolioEdit />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
