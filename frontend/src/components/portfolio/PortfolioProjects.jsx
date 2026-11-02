import MediaGallery from "./MediaGallery";
import styles from "./PortfolioProjects.module.css";

function hasProjectMedia(proj) {
  if (!proj) return false;
  if (Array.isArray(proj.media) && proj.media.length > 0) return true;
  if (Array.isArray(proj.images) && proj.images.length > 0) return true;
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

      {/* 1. Isometric Layered Application Blueprint Frame (Top Left) */}
      <g transform="translate(60, 90) scale(0.95)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none">
        <polygon points="60,10 120,45 60,80 0,45" />
        <polygon points="60,40 120,75 60,110 0,75" strokeDasharray="3 3" />
        <polygon points="60,70 120,105 60,140 0,105" />
        <line x1="60" y1="10" x2="60" y2="70" />
        <line x1="0" y1="45" x2="0" y2="105" />
        <line x1="120" y1="45" x2="120" y2="105" />
      </g>

      {/* 2. Responsive Screen Aspect Ratio Wireframes (Top Right) */}
      <g transform="translate(1000, 75)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none">
        <rect x="0" y="0" width="130" height="85" rx="8" />
        <line x1="0" y1="20" x2="130" y2="20" strokeOpacity="0.05" />
        <rect x="85" y="45" width="45" height="75" rx="6" />
        <circle cx="107.5" cy="112" r="2.5" />
      </g>

      {/* 3. Modular Bento Layout Schematic (Middle Left) */}
      <g transform="translate(45, 520)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.07" fill="none">
        <rect x="0" y="0" width="140" height="110" rx="6" strokeDasharray="4 3" />
        <line x1="0" y1="55" x2="140" y2="55" strokeDasharray="2 2" />
        <line x1="70" y1="0" x2="70" y2="110" strokeDasharray="2 2" />
        <circle cx="35" cy="27" r="14" />
        <rect x="85" y="70" width="40" height="25" rx="3" />
      </g>

      {/* 4. Drafting Angle Arc & Compass Vectors (Middle Right) */}
      <g transform="translate(1050, 560)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none">
        <circle cx="40" cy="40" r="50" strokeDasharray="3 3" />
        <circle cx="40" cy="40" r="3" fill="currentColor" fillOpacity="0.1" />
        <line x1="-10" y1="40" x2="90" y2="40" />
        <line x1="40" y1="-10" x2="40" y2="90" />
        <path d="M 40,40 L 78,12" />
      </g>

      {/* 5. Circuit Data Bus with Traces (Bottom Left) */}
      <g transform="translate(50, 940)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.08" fill="none">
        <path d="M 0,15 L 45,15 L 75,45 L 140,45" />
        <circle cx="0" cy="15" r="3" fill="currentColor" fillOpacity="0.1" />
        <circle cx="140" cy="45" r="3" fill="currentColor" fillOpacity="0.1" />
        <path d="M 20,60 L 65,60 L 95,30 L 150,30" strokeDasharray="3 3" />
      </g>

      {/* 6. Geometric Prism Hexagon (Bottom Right) */}
      <g transform="translate(1020, 950) scale(0.9)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.075" fill="none">
        <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" />
        <line x1="50" y1="5" x2="50" y2="95" strokeDasharray="3 3" />
        <line x1="10" y1="28" x2="90" y2="72" strokeDasharray="3 3" />
        <line x1="90" y1="28" x2="10" y2="72" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}

export default function PortfolioProjects({ projects }) {
  if (!projects || !Array.isArray(projects.items) || projects.items.length === 0) {
    return null;
  }

  const items = projects.items;
  const featuredId = projects.featuredId;

  // Separate flagship project from companion builds
  const flagship =
    items.find((p) => p.featured || p.id === featuredId) || items[0];
  const companions = items.filter((p) => p.id !== flagship.id);

  const flagshipHasMedia = hasProjectMedia(flagship);

  return (
    <section className={styles.section} id="builds">
      {/* Subtle Pure Vector Background Drawing (Zero Text) */}
      <ProjectsBackground />

      <div className={styles.inner}>
        {/* Section Header */}
        <div className={styles.headerGroup} data-reveal>
          <div className={styles.boardTag}>
            <span>★</span>
            <span>Selected Builds</span>
          </div>
          <h2 className={styles.headline}>
            {projects.headline || "Things I've built & shipped."}
          </h2>
        </div>

        {/* Bento Product Exhibition */}
        <div className={styles.bentoGallery}>
          {/* 1. Flagship Hero Card */}
          {flagship && (
            <article
              className={`${styles.flagshipCard} ${
                flagshipHasMedia ? "" : styles.flagshipCardNoMedia
              }`}
              data-reveal
            >
              <div className={styles.flagshipContent}>
                <div className={styles.productBadgeRow}>
                  <span className={styles.featuredBadge}>FEATURED PROJECT</span>
                  {flagship.category && (
                    <span className={styles.categoryPill}>
                      {flagship.category}
                    </span>
                  )}
                </div>

                <h3 className={styles.flagshipTitle}>{flagship.name}</h3>

                {flagship.tagline && (
                  <p className={styles.flagshipTagline}>{flagship.tagline}</p>
                )}

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
                    {flagship.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          link.isPrimary
                            ? styles.btnPrimary
                            : styles.btnSecondary
                        }
                      >
                        <span>{link.label}</span>
                        <span className={styles.btnArrow} aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Project Preview (Rendered ONLY if media exists - no placeholders!) */}
              {flagshipHasMedia && (
                <div className={styles.flagshipViewport}>
                  <MediaGallery
                    media={flagship.media || flagship.images || flagship.image}
                    altTitle={`${flagship.name} interface preview`}
                    aspectRatio="16/10"
                  />
                </div>
              )}
            </article>
          )}

          {/* 2. Companion Product Bento Grid */}
          <div className={styles.companionGrid}>
            {companions.map((proj, idx) => {
              const hasMedia = hasProjectMedia(proj);

              return (
                <article
                  key={proj.id || idx}
                  className={`${styles.companionCard} ${
                    hasMedia ? "" : styles.companionCardNoMedia
                  }`}
                  data-reveal
                  data-reveal-delay={idx}
                  style={{ transitionDelay: `${(idx + 1) * 0.12}s` }}
                >
                  {/* Visual Preview (Rendered ONLY if project has image/media - NO placeholders!) */}
                  {hasMedia && (
                    <MediaGallery
                      media={proj.media || proj.images || proj.image}
                      altTitle={`${proj.name} interface preview`}
                      aspectRatio="16/10"
                    />
                  )}

                  <div className={styles.companionBody}>
                    <div className={styles.productBadgeRow}>
                      <span className={styles.categoryPill}>
                        {proj.category || "Open Source"}
                      </span>
                    </div>

                    <h4 className={styles.companionTitle}>{proj.name}</h4>

                    {proj.tagline && (
                      <p className={styles.companionTagline}>{proj.tagline}</p>
                    )}

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
                        {proj.links.map((link) => (
                          <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={
                              link.isPrimary
                                ? styles.btnPrimarySmall
                                : styles.btnSecondarySmall
                            }
                          >
                            <span>{link.label}</span>
                            <span className={styles.btnArrow} aria-hidden="true">
                              ↗
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
