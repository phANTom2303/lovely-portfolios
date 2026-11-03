import Header from "../../components/Header/Header";
import Hero from "../../components/Landing/Hero";
import Comparison from "../../components/Landing/Comparison";
import HowItWorks from "../../components/Landing/HowItWorks";
import Pipeline from "../../components/Landing/Pipeline";
import RoleShowcase from "../../components/Landing/RoleShowcase";
import Features from "../../components/Landing/Features";
import FinalCTA from "../../components/Landing/FinalCTA";
import Footer from "../../components/Footer/Footer";

function Landing() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Comparison />
        <HowItWorks />
        <Pipeline />
        <RoleShowcase />
        <Features />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

export default Landing;
