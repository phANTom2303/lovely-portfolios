import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import MediaGallery from "./MediaGallery";
import useCardSpotlight from "./useCardSpotlight";
import { getOrderedItems } from "../../utils/orderUtils";
import styles from "./PortfolioExperience.module.css";

function ExperienceBackground() {
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
      {/* 1. Infrastructure Server Rack Wireframe Outline */}
      <g
        transform="translate(1020, 80) scale(0.9)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.07"
        fill="none"
      >
        <rect x="0" y="0" width="130" height="170" rx="8" />
        <line x1="0" y1="42" x2="130" y2="42" />
        <line x1="0" y1="84" x2="130" y2="84" />
        <line x1="0" y1="126" x2="130" y2="126" />
        <circle cx="20" cy="21" r="3" fill="currentColor" fillOpacity="0.1" />
        <circle cx="32" cy="21" r="3" fill="currentColor" fillOpacity="0.1" />
        <circle cx="20" cy="63" r="3" fill="currentColor" fillOpacity="0.1" />
        <circle cx="32" cy="63" r="3" fill="currentColor" fillOpacity="0.1" />
        <circle cx="20" cy="105" r="3" fill="currentColor" fillOpacity="0.1" />
        <circle cx="32" cy="105" r="3" fill="currentColor" fillOpacity="0.1" />
      </g>

      {/* 2. Microservice Topology / Pipeline Flow Lines */}
      <g
        transform="translate(45, 120)"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.075"
        fill="none"
      >
        <circle cx="30" cy="20" r="14" />
        <circle cx="110" cy="70" r="18" />
        <circle cx="30" cy="130" r="14" />
        <path d="M 44,20 L 92,60" />
        <path d="M 92,80 L 44,120" strokeDasharray="3 3" />
      </g>

      {/* 3. High-Throughput Bus Pathway */}
      <g
        transform="translate(1000, 560)"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.08"
        fill="none"
      >
        <path d="M 0,20 L 60,20 L 90,60 L 160,60" />
        <circle cx="0" cy="20" r="3" fill="currentColor" fillOpacity="0.12" />
        <circle cx="160" cy="60" r="3" fill="currentColor" fillOpacity="0.12" />
      </g>
    </svg>
  );
}

function ExperienceItem({ exp, i }) {
  const { spotlightProps } = useCardSpotlight();
  const expAssets = exp.assets || exp.media || exp.images;
  const hasMedia = Array.isArray(expAssets) && expAssets.length > 0;
  const hasLinks = Array.isArray(exp.links) && exp.links.length > 0;

  // Determine current status: endDate is null, undefined, empty, or "present"
  const isCurrent =
    exp.endDate === null ||
    exp.endDate === undefined ||
    exp.endDate === "" ||
    (typeof exp.endDate === "string" &&
      exp.endDate.toLowerCase() === "present") ||
    Boolean(exp.isCurrent);

  const displayPeriod = exp.startDate
    ? `${exp.startDate} – ${isCurrent ? "Present" : exp.endDate}`
    : exp.period || "";

  return (
    <div className={styles.item}>
      {/* Visual Timeline Node with Pulse Halos */}
      <div
        className={`${styles.timelineNode} ${
          isCurrent ? styles.nodeCurrent : styles.nodePast
        }`}
        aria-hidden="true"
      >
        <div className={styles.nodeCore} />
        {isCurrent && <span className={styles.activeHalo} />}
      </div>

      {/* Adaptive Experience Card with 3D Spring Slide-in and Spotlight */}
      <motion.article
        {...spotlightProps}
        className={`${styles.card} ${isCurrent ? styles.cardCurrent : ""}`}
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
      >
        <div className={styles.spotlightOverlay} aria-hidden="true" />

        <div className={styles.cardHeader}>
          <div className={styles.roleGroup}>
            <h3 className={styles.role}>{exp.role || exp.title}</h3>
            <div className={styles.companyRow}>
              <span className={styles.company}>{exp.company || exp.subtitle}</span>
            </div>
          </div>

          <div className={styles.badgeGroup}>
            {isCurrent && (
              <span className={styles.currentBadge}>
                <span className={styles.currentBeacon} aria-hidden="true" />
                CURRENT
              </span>
            )}
            {displayPeriod && (
              <span className={styles.periodBadge}>{displayPeriod}</span>
            )}
          </div>
        </div>

        {/* Adaptive Body */}
        <div
          className={`${styles.cardBody} ${
            hasMedia ? styles.withMedia : styles.textOnly
          }`}
        >
          <div className={styles.mainContent}>
            {/* Highlighted Achievements */}
            {Array.isArray(exp.highlights) && exp.highlights.length > 0 && (
              <ul className={styles.highlights}>
                {exp.highlights.map((h, hi) => (
                  <li key={hi} className={styles.highlight}>
                    <span className={styles.bulletArrow} aria-hidden="true">
                      ▸
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Core Competencies Chips */}
            {Array.isArray(exp.skills) && exp.skills.length > 0 && (
              <div className={styles.skillsRow}>
                {exp.skills.map((s) => (
                  <span key={s} className={styles.skillPill}>
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Live Reference Links */}
            {hasLinks && (
              <div className={styles.linksRow}>
                {exp.links.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.refLink}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span>{link.label}</span>
                    <span className={styles.linkArrow} aria-hidden="true">
                      ↗
                    </span>
                  </motion.a>
                ))}
              </div>
            )}
          </div>

          {/* Media Gallery Preview */}
          {hasMedia && (
            <div className={styles.mediaContainer}>
              <MediaGallery
                assets={expAssets}
                altTitle={`${exp.company} deliverables preview`}
                aspectRatio="16/9"
              />
            </div>
          )}
        </div>
      </motion.article>
    </div>
  );
}

export default function PortfolioExperience({ experience }) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const laserScaleY = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  if (
    !experience ||
    !Array.isArray(experience.items) ||
    experience.items.length === 0
  ) {
    return null;
  }

  return (
    <section className={styles.section} id="experience" ref={containerRef}>
      <ExperienceBackground />
      <div className={styles.inner}>
        {/* Section Header */}
        <div className={styles.headerGroup}>
          <h2 className={styles.headline}>Career Journey</h2>
        </div>

        {/* Milestone Timeline with Scroll Laser Beam */}
        <div className={styles.timeline}>
          {/* Scroll Laser Track */}
          <div className={styles.timelineSpine} aria-hidden="true">
            <motion.div
              className={styles.timelineLaser}
              style={{ scaleY: laserScaleY }}
            />
          </div>

          {getOrderedItems(experience.items).map((exp, i) => (
            <ExperienceItem
              key={exp.id || (exp.company ? `${exp.company}-${i}` : i)}
              exp={exp}
              i={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
