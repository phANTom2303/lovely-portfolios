import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getOrderedItems } from "../../utils/orderUtils";
import styles from "./PortfolioSkills.module.css";

const ROTATIONS = [-1.8, 1.6, -1.2, 2.1, -1.5, 1.2, -2.0, 1.9];
const PASTEL_PAPERS = [
  "#ffffff",
  "#fffdeb", // warm pale buttercup
  "#f3f8f5", // soft mint parchment
  "#faf6fc", // subtle lilac
  "#fcf6f2", // warm peach paper
];

function PinboardBackground() {
  return (
    <svg
      className={styles.backgroundArtwork}
      width="100%"
      height="100%"
      viewBox="0 0 1200 1200"
      preserveAspectRatio="xMidYMin slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="pinboardGrid"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 80 0 L 0 0 0 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeOpacity="0.045"
          />
          <path
            d="M 0 5 L 0 -5 M -5 0 L 5 0"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.12"
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#pinboardGrid)" />

      {/* Protractor / Drafting Angle Arc */}
      <g
        transform="translate(60, 95)"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.07"
        fill="none"
      >
        <circle cx="0" cy="0" r="75" strokeDasharray="3 3" />
        <path d="M 0,0 L 68,-32 M 0,0 L 75,0" />
        <path d="M 28,0 A 28 28 0 0 0 25,-12" />
        <circle cx="0" cy="0" r="2.5" fill="currentColor" fillOpacity="0.1" />
      </g>

      {/* Wireframe Cube Drawing */}
      <g
        transform="translate(1040, 80) scale(0.9)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.075"
        fill="none"
      >
        <polygon points="50,10 95,35 95,85 50,110 5,85 5,35" />
        <line x1="50" y1="10" x2="50" y2="60" />
        <line x1="5" y1="35" x2="50" y2="60" />
        <line x1="95" y1="35" x2="50" y2="60" />
        <line x1="50" y1="60" x2="50" y2="110" />
      </g>

      {/* Mathematical Calculus Integral Symbol */}
      <g
        transform="translate(50, 270) scale(0.9)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.07"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M 25,5 C 10,5 5,20 5,45 L 5,95 C 5,120 0,135 -15,135" />
      </g>

      {/* Distributed Node Graph Network */}
      <g
        transform="translate(1010, 310)"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.075"
        fill="none"
      >
        <circle cx="35" cy="20" r="5" fill="currentColor" fillOpacity="0.08" />
        <circle cx="95" cy="40" r="6" fill="currentColor" fillOpacity="0.08" />
        <circle cx="25" cy="80" r="4" fill="currentColor" fillOpacity="0.08" />
        <circle cx="85" cy="100" r="5" fill="currentColor" fillOpacity="0.08" />
        <circle cx="135" cy="70" r="4" fill="currentColor" fillOpacity="0.08" />
        <line x1="35" y1="20" x2="95" y2="40" />
        <line x1="35" y1="20" x2="25" y2="80" strokeDasharray="3 3" />
        <line x1="95" y1="40" x2="85" y2="100" />
        <line x1="95" y1="40" x2="135" y2="70" />
        <line x1="25" y1="80" x2="85" y2="100" strokeDasharray="3 3" />
      </g>

      {/* Circuit Logic with Solder Pads */}
      <g
        transform="translate(980, 540)"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.08"
        fill="none"
      >
        <path d="M 0,20 L 50,20 L 75,55 L 140,55" strokeDasharray="4 3" />
        <circle cx="0" cy="20" r="3" fill="currentColor" fillOpacity="0.12" />
        <circle cx="140" cy="55" r="3" fill="currentColor" fillOpacity="0.12" />
        <path d="M 30,75 L 80,75 L 105,35 L 150,35" />
        <circle cx="30" cy="75" r="3" fill="currentColor" fillOpacity="0.12" />
        <circle cx="150" cy="35" r="3" fill="currentColor" fillOpacity="0.12" />
      </g>
    </svg>
  );
}

export default function PortfolioSkills({ skills }) {
  const categories = getOrderedItems(skills?.categories);

  const [selectedTab, setSelectedTab] = useState(
    () => categories[0]?.name || "",
  );

  const activeTab = categories.some((c) => c.name === selectedTab)
    ? selectedTab
    : categories[0]?.name || "";

  if (categories.length === 0) {
    return null;
  }

  const tabs = categories.map((c) => ({
    name: c.name,
    label: c.name,
  }));

  const visibleCategories = categories.filter(
    (c) => c.name === activeTab,
  );

  let globalSkillCounter = 0;

  return (
    <section className={styles.section} id="skills">
      <PinboardBackground />

      <div className={styles.inner}>
        {/* Section Headline */}
        <div className={styles.headerRow}>
          <div className={styles.headlineGroup}>
            <h2 className={styles.headline}>The tools I build with.</h2>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className={styles.filterPillContainer}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  type="button"
                  className={`${styles.filterPill} ${
                    isActive ? styles.filterPillActive : ""
                  }`}
                  onClick={() => setSelectedTab(tab.name)}
                >
                  {isActive && (
                    <motion.span
                      layoutId="skillsTabBubble"
                      className={styles.filterPillBubble}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 28,
                      }}
                    />
                  )}
                  <span className={styles.filterPillLabel}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Clusters with Spring Motion */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className={styles.categoryClusters}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            {visibleCategories.map((cat, catIdx) => {
              const categorySkills = Array.isArray(cat.skills)
                ? cat.skills
                : [];

              return (
                <div
                  key={cat.name || catIdx}
                  className={styles.clusterBlock}
                >
                  {/* Tactile Sticky Note Grid with Spring Micro-Physics */}
                  <div className={styles.pinboardGrid}>
                    {categorySkills.map((skillItem) => {
                      const skillName =
                        typeof skillItem === "string"
                          ? skillItem
                          : skillItem.name || String(skillItem);

                      const rotation =
                        ROTATIONS[globalSkillCounter % ROTATIONS.length];
                      const paperColor =
                        PASTEL_PAPERS[
                          globalSkillCounter % PASTEL_PAPERS.length
                        ];
                      globalSkillCounter++;

                      return (
                        <motion.div
                          key={skillName}
                          className={styles.stickyNote}
                          style={{
                            backgroundColor: paperColor,
                          }}
                          initial={{ rotate: rotation }}
                          whileHover={{
                            scale: 1.08,
                            rotate: 0,
                            y: -4,
                            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.14)",
                          }}
                          whileTap={{ scale: 0.96 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 22,
                          }}
                        >
                          {/* Washi Tape Accent on Top Edge */}
                          <div
                            className={styles.washiTape}
                            aria-hidden="true"
                          />

                          {/* Skill Title */}
                          <h4 className={styles.noteTitle}>{skillName}</h4>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
