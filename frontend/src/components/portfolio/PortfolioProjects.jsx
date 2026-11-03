import { motion } from "framer-motion";
import MediaGallery from "./MediaGallery";
import useCardSpotlight from "./useCardSpotlight";
import { getOrderedItems } from "../../utils/orderUtils";
import styles from "./PortfolioProjects.module.css";

function hasProjectMedia(proj) {
  if (!proj) return false;
  const a = proj.assets || proj.media || proj.images;
  if (Array.isArray(a) && a.length > 0) return true;
  if (typeof proj.image === "string" && proj.image.trim() !== "") return true;
  return false;
}

function ProjectsBackground() {
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
          id="projectsGrid"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 100 0 L 0 0 0 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeOpacity="0.04"
          />
          <circle cx="0" cy="0" r="1.5" fill="currentColor" fillOpacity="0.08" />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#projectsGrid)" />

      {/* Isometric Layered Application Blueprint Frame */}
      <g transform="translate(60, 90) scale(0.95)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none">
        <polygon points="60,10 120,45 60,80 0,45" />
        <polygon points="60,40 120,75 60,110 0,75" strokeDasharray="3 3" />
        <polygon points="60,70 120,105 60,140 0,105" />
        <line x1="60" y1="10" x2="60" y2="70" />
        <line x1="0" y1="45" x2="0" y2="105" />
        <line x1="120" y1="45" x2="120" y2="105" />
      </g>

      {/* Responsive Screen Aspect Ratio Wireframes */}
      <g transform="translate(1000, 75)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none">
        <rect x="0" y="0" width="130" height="85" rx="8" />
        <line x1="0" y1="20" x2="130" y2="20" strokeOpacity="0.05" />
        <rect x="85" y="45" width="45" height="75" rx="6" />
        <circle cx="107.5" cy="112" r="2.5" />
      </g>

      {/* Modular Bento Layout Schematic */}
      <g transform="translate(45, 520)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.07" fill="none">
        <rect x="0" y="0" width="140" height="110" rx="6" strokeDasharray="4 3" />
        <line x1="0" y1="55" x2="140" y2="55" strokeDasharray="2 2" />
        <line x1="70" y1="0" x2="70" y2="110" strokeDasharray="2 2" />
        <circle cx="35" cy="27" r="14" />
        <rect x="85" y="70" width="40" height="25" rx="3" />
      </g>

      {/* Circuit Data Bus with Traces */}
      <g transform="translate(50, 940)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.08" fill="none">
        <path d="M 0,15 L 45,15 L 75,45 L 140,45" />
        <circle cx="0" cy="15" r="3" fill="currentColor" fillOpacity="0.1" />
        <circle cx="140" cy="45" r="3" fill="currentColor" fillOpacity="0.1" />
        <path d="M 20,60 L 65,60 L 95,30 L 150,30" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}

function CompanionCard({ proj, idx }) {
  const { spotlightProps } = useCardSpotlight();
  const hasMedia = hasProjectMedia(proj);
  const projAssets = proj.assets || proj.media || proj.images || proj.image;

  return (
    <motion.article
      {...spotlightProps}
      className={`${styles.companionCard} ${
        hasMedia ? "" : styles.companionCardNoMedia
      }`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      <div className={styles.spotlightOverlay} aria-hidden="true" />

      {/* Visual Preview */}
      {hasMedia && (
        <div className={styles.mediaFrame}>
          <MediaGallery
            assets={projAssets}
            altTitle={`${proj.name} interface preview`}
            aspectRatio="16/10"
          />
        </div>
      )}

      <div className={styles.companionBody}>
        {(proj.subtitle || proj.category) && (
          <div className={styles.productBadgeRow}>
            <span className={styles.categoryPill}>
              {proj.subtitle || proj.category}
            </span>
          </div>
        )}

        <h4 className={styles.companionTitle}>{proj.name || proj.title}</h4>

        <p className={styles.companionDesc}>{proj.description}</p>

        {/* Tech Stack Chips */}
        {proj.skills && proj.skills.length > 0 && (
          <div className={styles.skillsRow}>
            {proj.skills.map((skill) => (
              <span key={skill} className={styles.skillPill}>
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Action links */}
        {proj.links && proj.links.length > 0 && (
          <div className={styles.actionsRow}>
            {proj.links.map((link, linkIdx) => {
              const isPrimary =
                link.isPrimary !== undefined ? link.isPrimary : linkIdx === 0;
              return (
                <motion.a
                  key={link.title || link.label || linkIdx}
                  href={link.link || link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    isPrimary
                      ? styles.btnPrimarySmall
                      : styles.btnSecondarySmall
                  }
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{link.title || link.label}</span>
                  <span className={styles.btnArrow} aria-hidden="true">
                    ↗
                  </span>
                </motion.a>
              );
            })}
          </div>
        )}
      </div>
    </motion.article>
  );
}

function FlagshipCard({ flagship, flagshipHasMedia }) {
  const { spotlightProps } = useCardSpotlight();

  return (
    <article
      {...spotlightProps}
      className={`${styles.flagshipCard} ${
        flagshipHasMedia ? "" : styles.flagshipCardNoMedia
      }`}
    >
      <div className={styles.spotlightOverlay} aria-hidden="true" />
      <div className={styles.flagshipContent}>
        <div className={styles.productBadgeRow}>
          <span className={styles.featuredBadge}>FEATURED PROJECT</span>
          {(flagship.subtitle || flagship.category) && (
            <span className={styles.categoryPill}>
              {flagship.subtitle || flagship.category}
            </span>
          )}
        </div>

        <h3 className={styles.flagshipTitle}>{flagship.name || flagship.title}</h3>

        <p className={styles.flagshipDesc}>{flagship.description}</p>

        {/* Tech Stack Chips */}
        {flagship.skills && flagship.skills.length > 0 && (
          <div className={styles.skillsRow}>
            {flagship.skills.map((skill) => (
              <span key={skill} className={styles.skillPill}>
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Action CTAs */}
        {flagship.links && flagship.links.length > 0 && (
          <div className={styles.actionsRow}>
            {flagship.links.map((link, linkIdx) => {
              const isPrimary =
                link.isPrimary !== undefined ? link.isPrimary : linkIdx === 0;
              return (
                <motion.a
                  key={link.title || link.label || linkIdx}
                  href={link.link || link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    isPrimary ? styles.btnPrimary : styles.btnSecondary
                  }
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{link.title || link.label}</span>
                  <span className={styles.btnArrow} aria-hidden="true">
                    ↗
                  </span>
                </motion.a>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Project Preview */}
      {flagshipHasMedia && (
        <div className={styles.flagshipViewport}>
          <MediaGallery
            assets={flagship.assets || flagship.media || flagship.images || flagship.image}
            altTitle={`${flagship.name} interface preview`}
            aspectRatio="16/10"
          />
        </div>
      )}
    </article>
  );
}

export default function PortfolioProjects({ projects }) {
  if (!projects || !Array.isArray(projects.items) || projects.items.length === 0) {
    return null;
  }

  const items = getOrderedItems(projects.items);

  // First project in items is always the flagship / featured project
  const flagship = items[0];
  const companions = items.slice(1);

  const flagshipHasMedia = hasProjectMedia(flagship);

  return (
    <section className={styles.section} id="projects">
      <ProjectsBackground />

      <div className={styles.inner}>
        {/* Section Header */}
        <div className={styles.headerGroup}>
          <h2 className={styles.headline}>Featured Projects & Builds</h2>
        </div>

        {/* Bento Gallery */}
        <div className={styles.bentoGallery}>
          {/* 1. Flagship Product Hero Showcase */}
          {flagship && (
            <FlagshipCard
              flagship={flagship}
              flagshipHasMedia={flagshipHasMedia}
            />
          )}

          {/* 2. Companion Product Bento Grid with Spotlight and Spring Entrance */}
          <div className={styles.companionGrid}>
            {companions.map((proj, idx) => (
              <CompanionCard
                key={proj.id || (proj.name ? `${proj.name}-${idx}` : idx)}
                proj={proj}
                idx={idx}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
