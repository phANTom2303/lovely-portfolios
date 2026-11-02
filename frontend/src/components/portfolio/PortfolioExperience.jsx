import MediaGallery from "./MediaGallery";
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
      {/* 1. Infrastructure Server Rack Wireframe Outline (Top Right) */}
      <g transform="translate(1020, 80) scale(0.9)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none">
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
        <circle cx="20" cy="147" r="3" fill="currentColor" fillOpacity="0.1" />
        <circle cx="32" cy="147" r="3" fill="currentColor" fillOpacity="0.1" />
      </g>

      {/* 2. Microservice Topology / Pipeline Flow Lines (Top Left) */}
      <g transform="translate(45, 120)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.075" fill="none">
        <circle cx="30" cy="20" r="14" />
        <circle cx="110" cy="70" r="18" />
        <circle cx="30" cy="130" r="14" />
        <path d="M 44,20 L 92,60" />
        <path d="M 92,80 L 44,120" strokeDasharray="3 3" />
        <polyline points="70,36 78,48 66,48" strokeWidth="1.2" />
        <polyline points="74,96 66,96 72,108" strokeWidth="1.2" />
      </g>

      {/* 3. High-Throughput Bus Pathway (Middle Right) */}
      <g transform="translate(1000, 560)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.08" fill="none">
        <path d="M 0,20 L 60,20 L 90,60 L 160,60" />
        <circle cx="0" cy="20" r="3" fill="currentColor" fillOpacity="0.12" />
        <circle cx="160" cy="60" r="3" fill="currentColor" fillOpacity="0.12" />
        <path d="M 20,80 L 80,80 L 110,40 L 170,40" strokeDasharray="4 3" />
        <circle cx="20" cy="80" r="3" fill="currentColor" fillOpacity="0.12" />
        <circle cx="170" cy="40" r="3" fill="currentColor" fillOpacity="0.12" />
      </g>

      {/* 4. Telemetry Oscilloscope Waveform (Middle Left) */}
      <g transform="translate(50, 680)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none" strokeLinecap="round">
        <path d="M 0,40 L 30,40 L 45,10 L 60,70 L 75,20 L 90,55 L 105,40 L 150,40" />
        <line x1="0" y1="40" x2="160" y2="40" strokeDasharray="2 3" strokeOpacity="0.04" />
      </g>

      {/* 5. Parallel Railway Track Vectors (Bottom Left) */}
      <g transform="translate(50, 980)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.07" fill="none">
        <line x1="0" y1="10" x2="160" y2="10" />
        <line x1="0" y1="30" x2="160" y2="30" />
        <line x1="20" y1="5" x2="20" y2="35" />
        <line x1="50" y1="5" x2="50" y2="35" />
        <line x1="80" y1="5" x2="80" y2="35" />
        <line x1="110" y1="5" x2="110" y2="35" />
        <line x1="140" y1="5" x2="140" y2="35" />
      </g>
    </svg>
  );
}

export default function PortfolioExperience({ experience }) {
  if (!experience || !Array.isArray(experience.items) || experience.items.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} id="career">
      <ExperienceBackground />
      <div className={styles.inner}>
        {/* Section Header */}
        <div className={styles.headerGroup} data-reveal>
          <div className={styles.boardTag}>
            <span>★</span>
            <span>Career Milestones</span>
          </div>
          <h2 className={styles.headline}>
            {experience.headline || "Where I've built & shipped."}
          </h2>
        </div>

        {/* Milestone Timeline */}
        <div className={styles.timeline}>
          {experience.items.map((exp, i) => {
            const hasMedia =
              (Array.isArray(exp.media) && exp.media.length > 0) ||
              (Array.isArray(exp.images) && exp.images.length > 0);
            const hasLinks = Array.isArray(exp.links) && exp.links.length > 0;

            return (
              <div
                key={exp.id || i}
                className={styles.item}
                data-reveal
                data-reveal-delay={i}
                style={{ transitionDelay: `${i * 0.14}s` }}
              >
                {/* Visual Timeline Node */}
                <div
                  className={`${styles.timelineNode} ${
                    exp.isCurrent ? styles.nodeCurrent : styles.nodePast
                  }`}
                  aria-hidden="true"
                >
                  <div className={styles.nodeCore} />
                </div>

                {/* Adaptive Experience Card */}
                <article
                  className={`${styles.card} ${
                    exp.isCurrent ? styles.cardCurrent : ""
                  }`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.roleGroup}>
                      <h3 className={styles.role}>{exp.role}</h3>
                      <div className={styles.companyRow}>
                        <span className={styles.company}>{exp.company}</span>
                        {exp.location && (
                          <span className={styles.locationTag}>📍 {exp.location}</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.badgeGroup}>
                      {exp.isCurrent && (
                        <span className={styles.currentBadge}>
                          <span className={styles.currentBeacon} aria-hidden="true" />
                          CURRENT
                        </span>
                      )}
                      {exp.period && (
                        <span className={styles.periodBadge}>{exp.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Adaptive Body (2-Col if media present, 1-Col full width if text only) */}
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
                                →
                              </span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Links Showcase Container (rendered only if links exist) */}
                      {hasLinks && (
                        <div className={styles.linksRow}>
                          {exp.links.map((link, li) => (
                            <a
                              key={li}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={
                                link.isPrimary
                                  ? styles.linkPrimary
                                  : styles.linkSecondary
                              }
                            >
                              <span>{link.label}</span>
                              <span className={styles.linkArrow} aria-hidden="true">
                                ↗
                              </span>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Tech Stack Pills */}
                      {Array.isArray(exp.skills) && exp.skills.length > 0 && (
                        <div className={styles.skillsRow}>
                          {exp.skills.map((skill) => (
                            <span key={skill} className={styles.skillTag}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Media / Image & Video Showcase Container */}
                    {hasMedia && (
                      <div className={styles.mediaContainer}>
                        <MediaGallery
                          media={exp.media || exp.images}
                          altTitle={`${exp.company} work preview`}
                          aspectRatio="16/10"
                        />
                      </div>
                    )}
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
