import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Landing from "./pages/Landing/Landing";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import Profile from "./pages/profile/Profile";
import Portfolio from "./pages/Portfolio/Portfolio";
import PortfolioEdit from "./pages/PortfolioEdit/PortfolioEdit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:identifier" element={<Portfolio />} />
        <Route path="/portfolio/:identifier/edit" element={<PortfolioEdit />} />
        <Route path="/edit/:identifier" element={<PortfolioEdit />} />
        <Route path="/p/:identifier" element={<Portfolio />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;

