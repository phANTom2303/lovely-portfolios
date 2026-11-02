import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useAuth } from "../../context/authContext";

function Home() {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <main>
        <h1>Welcome, {user?.name || "there"}.</h1>
        <p>Your portfolio workspace is ready.</p>
        <Link to="/profile">Open your profile</Link>
      </main>
      <Footer />
    </>
  );
}

export default Home;