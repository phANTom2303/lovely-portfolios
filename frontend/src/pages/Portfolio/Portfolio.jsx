import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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

const DEFAULT_SECTION_ORDER = [
  "about",
  "skills",
  "experience",
  "projects",
  "achievements",
  "certifications",
  "education",
  "extraCurricular",
  "contact",
];

function normalizeSectionKey(key) {
  if (key === "extras") return "extraCurricular";
  if (key === "cta") return "contact";
  if (key === "hero") return "about";
  return key;
}

const SECTION_CONFIG = {
  about: {
    id: "about",
    label: "About",
    hasContent: (doc, resolved) => Boolean(resolved.about),
    render: (doc, resolved) => (
      <div id="about" key="about">
        <PortfolioHero about={resolved.about} />
      </div>
    ),
  },
  skills: {
    id: "skills",
    label: "Skills",
    hasContent: (doc) =>
      Array.isArray(doc.skills?.categories) && doc.skills.categories.length > 0,
    render: (doc) => <PortfolioSkills key="skills" skills={doc.skills} />,
  },
  experience: {
    id: "experience",
    label: "Experience",
    hasContent: (doc) =>
      Array.isArray(doc.experience?.items) && doc.experience.items.length > 0,
    render: (doc) => (
      <PortfolioExperience key="experience" experience={doc.experience} />
    ),
  },
  projects: {
    id: "projects",
    label: "Projects",
    hasContent: (doc) =>
      Array.isArray(doc.projects?.items) && doc.projects.items.length > 0,
    render: (doc) => (
      <PortfolioProjects key="projects" projects={doc.projects} />
    ),
  },
  achievements: {
    id: "achievements",
    label: "Achievements",
    hasContent: (doc) =>
      Array.isArray(doc.achievements?.items) && doc.achievements.items.length > 0,
    render: (doc) => (
      <PortfolioAchievements
        key="achievements"
        achievements={doc.achievements}
      />
    ),
  },
  certifications: {
    id: "certifications",
    label: "Certifications",
    hasContent: (doc) =>
      Array.isArray(doc.certifications?.items) &&
      doc.certifications.items.length > 0,
    render: (doc) => (
      <PortfolioCertifications
        key="certifications"
        certifications={doc.certifications}
      />
    ),
  },
  education: {
    id: "education",
    label: "Education",
    hasContent: (doc) =>
      Array.isArray(doc.education?.items) && doc.education.items.length > 0,
    render: (doc) => (
      <PortfolioEducation key="education" education={doc.education} />
    ),
  },
  extraCurricular: {
    id: "extras",
    label: "Extras",
    hasContent: (doc, resolved) =>
      Array.isArray(resolved.extras?.items) && resolved.extras.items.length > 0,
    render: (doc, resolved) => (
      <PortfolioExtras key="extras" extras={resolved.extras} />
    ),
  },
  contact: {
    id: "contact",
    label: "Contact",
    hasContent: (doc, resolved) => Boolean(resolved.contact),
    render: (doc, resolved) => (
      <PortfolioCTA
        key="contact"
        contact={resolved.contact}
        location={resolved.about?.location}
      />
    ),
  },
};

export default function Portfolio({ overrideData, isPreview = false }) {
  useScrollReveal();
  const { identifier } = useParams();

  const portfolioData = useMemo(() => {
    if (overrideData) {
      return overrideData;
    }
    if (identifier) {
      return getPortfolioByIdOrSlug(identifier);
    }
    return getActivePortfolio();
  }, [overrideData, identifier]);

  const [themeOverride, setThemeOverride] = useState(null);
  const theme =
    themeOverride ||
    overrideData?.theme ||
    portfolioData?.theme ||
    localStorage.getItem("portfolio_theme") ||
    "light";

  const [activeChapter, setActiveChapter] = useState("about");

  // Dock state: fully visible on initial load/reload so the user is aware of it,
  // then transitions to limited visible state once user begins scrolling.
  const [isDockExpanded, setIsDockExpanded] = useState(true);
  const isDockHoveredRef = useRef(false);
  const dockTimerRef = useRef(null);

  const handleDockEnter = () => {
    isDockHoveredRef.current = true;
    if (dockTimerRef.current) {
      clearTimeout(dockTimerRef.current);
      dockTimerRef.current = null;
    }
    setIsDockExpanded(true);
  };

  const handleDockLeave = () => {
    isDockHoveredRef.current = false;
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
    const next = theme === "light" ? "dark" : "light";
    localStorage.setItem("portfolio_theme", next);
    setThemeOverride(next);
  };

  const doc = portfolioData?.document;
  const resolved = useMemo(
    () => ({
      about: doc ? doc.about || doc.hero : null,
      extras: doc ? doc.extraCurricular || doc.extras : null,
      contact: doc ? doc.contact || doc.cta : null,
    }),
    [doc]
  );

  // Derive dynamic section order: doc.sectionOrder -> doc key sequence -> DEFAULT_SECTION_ORDER
  const effectiveSectionOrder = useMemo(() => {
    if (Array.isArray(doc?.sectionOrder) && doc.sectionOrder.length > 0) {
      return doc.sectionOrder.map(normalizeSectionKey);
    }
    if (doc) {
      const docKeys = Object.keys(doc)
        .map(normalizeSectionKey)
        .filter((k) => SECTION_CONFIG[k]);
      if (docKeys.length > 0) {
        return [...new Set(docKeys)];
      }
    }
    return DEFAULT_SECTION_ORDER;
  }, [doc]);

  // Dynamically compute active chapters based on available section data in effectiveSectionOrder!
  const activeChapters = useMemo(() => {
    if (!doc) return [];
    return effectiveSectionOrder
      .map((key) => {
        const cfg = SECTION_CONFIG[key];
        if (!cfg || !cfg.hasContent(doc, resolved)) return null;
        return { id: cfg.id, label: cfg.label };
      })
      .filter(Boolean);
  }, [doc, effectiveSectionOrder, resolved]);

  // In preview mode, ensure all reveal elements are immediately visible
  useEffect(() => {
    if (isPreview) {
      const revealAll = () => {
        document.querySelectorAll("[data-reveal]").forEach((el) => {
          el.setAttribute("data-visible", "true");
        });
      };
      revealAll();
      const t = setTimeout(revealAll, 100);
      return () => clearTimeout(t);
    }
  }, [isPreview, doc]);

  useEffect(() => {
    if (!doc || isPreview) return;
    function handleScroll() {
      // If user scrolls down and dock is not hovered, glide into limited visible state
      if (!isDockHoveredRef.current && window.scrollY > 20) {
        setIsDockExpanded(false);
      }

      const scrollPos = window.scrollY + 250;
      for (let i = activeChapters.length - 1; i >= 0; i--) {
        const el = document.getElementById(activeChapters[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveChapter(activeChapters[i].id);
          break;
        }
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [doc, activeChapters, isPreview]);

  useEffect(() => {
    if (isPreview) return;
    if (window.location.hash) {
      const targetId = window.location.hash.replace("#", "");
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [isPreview]);

  if (!portfolioData || !doc) {
    return (
      <div className={styles.notFoundPage} data-theme={theme}>
        <div className={styles.notFoundCard}>
          <span className={styles.notFoundEmoji}>🔍</span>
          <h2 className={styles.notFoundTitle}>Portfolio Not Found</h2>
          <p className={styles.notFoundDesc}>
            The portfolio link <code>{identifier || "default"}</code> could not
            be found or may have been deleted.
          </p>
          <Link to="/" className={styles.notFoundAction}>
            ← Back to My Portfolios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.page} ${isPreview ? styles.previewPage : ""}`}
      data-theme={theme}
    >
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
          {activeChapters.map((ch) => {
            const isActive = activeChapter === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                className={`${styles.dockChapter} ${
                  isActive ? styles.dockChapterActive : ""
                }`}
                onClick={() => {
                  setActiveChapter(ch.id);
                  const el = document.getElementById(ch.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="dockActiveBubble"
                    className={styles.dockActiveBubble}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={styles.dockChapterLabel}>{ch.label}</span>
              </button>
            );
          })}
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

      {/* Dynamic Ordered Sections */}
      {effectiveSectionOrder.map((key) => {
        const cfg = SECTION_CONFIG[key];
        if (!cfg || !cfg.hasContent(doc, resolved)) return null;
        return cfg.render(doc, resolved);
      })}

      {/* Minimal Story Footnote */}
      <footer className={styles.miniFooter}>
        <span>
          © {new Date().getFullYear()} {resolved.about?.name} · Curated by Lovely Portfolio AI
        </span>
        <div className={styles.miniFooterLinks}>
          <button
            type="button"
            className={styles.backToTopBtn}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setActiveChapter("about");
            }}
          >
            Back to top ↑
          </button>
        </div>
      </footer>
    </div>
  );
}
