import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import useScrollReveal from "../../components/portfolio/useScrollReveal";
import {
  getPortfolioByIdOrSlug,
  getActivePortfolio,
} from "../../services/portfolioStorage";

import PortfolioHero from "../../components/portfolio/PortfolioHero";
import PortfolioSkills from "../../components/portfolio/PortfolioSkills";
import PortfolioExperience from "../../components/portfolio/PortfolioExperience";
import PortfolioProjects from "../../components/portfolio/PortfolioProjects";
import PortfolioAchievements from "../../components/portfolio/PortfolioAchievements";
import PortfolioCertifications from "../../components/portfolio/PortfolioCertifications";
import PortfolioEducation from "../../components/portfolio/PortfolioEducation";
import PortfolioExtras from "../../components/portfolio/PortfolioExtras";
import PortfolioCTA from "../../components/portfolio/PortfolioCTA";

import styles from "./Portfolio.module.css";

const CHAPTERS = [
  { id: "about", label: "About" },
  { id: "profile", label: "Profile" },
  { id: "career", label: "Career" },
  { id: "builds", label: "Builds" },
  { id: "achievements", label: "Achievements" },
  { id: "certs", label: "Certs" },
  { id: "extras", label: "Extras" },
  { id: "contact", label: "Contact" },
];

export default function Portfolio() {
  useScrollReveal();
  const { identifier } = useParams();

  const [portfolioData, setPortfolioData] = useState(() => {
    if (identifier) {
      return getPortfolioByIdOrSlug(identifier);
    }
    return getActivePortfolio();
  });

  const [theme, setTheme] = useState(() => {
    return portfolioData?.theme || localStorage.getItem("portfolio_theme") || "light";
  });

  useEffect(() => {
    let resolved = null;
    if (identifier) {
      resolved = getPortfolioByIdOrSlug(identifier);
    } else {
      resolved = getActivePortfolio();
    }
    setPortfolioData(resolved);
    if (resolved?.theme) {
      setTheme(resolved.theme);
    }
  }, [identifier]);

  const [activeChapter, setActiveChapter] = useState("about");

  // Dock hysteresis state to prevent rapid hover jitter / flutter
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const dockTimerRef = useRef(null);

  const handleDockEnter = () => {
    if (dockTimerRef.current) {
      clearTimeout(dockTimerRef.current);
      dockTimerRef.current = null;
    }
    setIsDockExpanded(true);
  };

  const handleDockLeave = () => {
    if (dockTimerRef.current) {
      clearTimeout(dockTimerRef.current);
    }
    dockTimerRef.current = setTimeout(() => {
      setIsDockExpanded(false);
    }, 350);
  };

  useEffect(() => {
    return () => {
      if (dockTimerRef.current) clearTimeout(dockTimerRef.current);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("portfolio_theme", next);
      return next;
    });
  };

  useEffect(() => {
    function handleScroll() {
      const scrollPos = window.scrollY + 250;
      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        const el = document.getElementById(CHAPTERS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveChapter(CHAPTERS[i].id);
          break;
        }
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!portfolioData || !portfolioData.document) {
    return (
      <div className={styles.notFoundPage} data-theme={theme}>
        <div className={styles.notFoundCard}>
          <span className={styles.notFoundEmoji}>🔍</span>
          <h2 className={styles.notFoundTitle}>Portfolio Not Found</h2>
          <p className={styles.notFoundDesc}>
            The portfolio link <code>{identifier || "default"}</code> could not be found or may have been deleted.
          </p>
          <Link to="/" className={styles.notFoundAction}>
            ← Back to My Portfolios
          </Link>
        </div>
      </div>
    );
  }

  const {
    hero,
    skills,
    experience,
    projects,
    achievements,
    certifications,
    education,
    extraCurricular,
    extras,
    contact,
    cta,
  } = portfolioData.document;

  const resolvedExtras = extraCurricular || extras;
  const resolvedContact = contact || cta;


  return (
    <div className={styles.page} data-theme={theme}>
      {/* Floating Story Progress Dock (With hysteresis hover & calm easing to prevent shake) */}
      <div
        className={styles.dockWrapper}
        data-expanded={isDockExpanded}
        onMouseEnter={handleDockEnter}
        onMouseLeave={handleDockLeave}
        onFocus={handleDockEnter}
        onBlur={handleDockLeave}
        onTouchStart={handleDockEnter}
      >
        <nav className={styles.storyDock} aria-label="Story chapter navigation">
          <Link to="/" className={styles.backHome} title="Back to Lovely Portfolio">
            ← Exit
          </Link>
          <span className={styles.dockDivider} aria-hidden="true" />
          {CHAPTERS.map((ch) => (
            <a
              key={ch.id}
              href={`#${ch.id}`}
              className={`${styles.dockChapter} ${
                activeChapter === ch.id ? styles.dockChapterActive : ""
              }`}
            >
              {ch.label}
            </a>
          ))}
          <span className={styles.dockDivider} aria-hidden="true" />
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.dockThemeBtn}
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </nav>
      </div>

      {/* Chapter 01: Hero & Trajectory */}
      <div id="about">
        <PortfolioHero hero={hero} />
      </div>

      {/* Chapter 02: Tech Stack */}
      <PortfolioSkills skills={skills} />

      {/* Chapter 03: Experience Timeline */}
      <PortfolioExperience experience={experience} />

      {/* Chapter 04: Flagship Bento Projects */}
      <PortfolioProjects projects={projects} />

      {/* Chapter 05: Proof of Work & Foundations */}
      <PortfolioAchievements achievements={achievements} />
      <PortfolioCertifications certifications={certifications} />
      <PortfolioEducation education={education} />
      {resolvedExtras && <PortfolioExtras extras={resolvedExtras} />}

      {/* Chapter 06: Contact CTA */}
      <PortfolioCTA contact={resolvedContact} location={hero.location} />

      {/* Minimal Story Footnote */}
      <footer className={styles.miniFooter}>
        <span>
          © {new Date().getFullYear()} {hero.name} · Curated by Lovely Portfolio AI
        </span>
        <div className={styles.miniFooterLinks}>
          <a href="#about">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
