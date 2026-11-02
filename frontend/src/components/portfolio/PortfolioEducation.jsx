import styles from "./PortfolioEducation.module.css";

function EducationBackground() {
  return (
    <svg
      className={styles.backgroundArtwork}
      width="100%"
      height="100%"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMin slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 1. Drafting Compass Divider Tool Geometry (Top Left) */}
      <g transform="translate(100, 90)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.075" fill="none">
        <circle cx="50" cy="15" r="8" />
        <line x1="50" y1="23" x2="20" y2="105" />
        <line x1="50" y1="23" x2="80" y2="105" />
        <path d="M 30,75 A 40 40 0 0 0 70,75" strokeDasharray="2 3" />
        <circle cx="20" cy="105" r="2" fill="currentColor" fillOpacity="0.1" />
        <circle cx="80" cy="105" r="2" fill="currentColor" fillOpacity="0.1" />
      </g>

      {/* 2. Open Book / Research Folio Isometric Curve (Top Right) */}
      <g transform="translate(1030, 90)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none">
        <path d="M 10,20 Q 50,5 90,20 L 90,75 Q 50,60 10,75 Z" />
        <path d="M 90,20 Q 130,5 170,20 L 170,75 Q 130,60 90,75 Z" />
        <line x1="90" y1="20" x2="90" y2="75" />
        <line x1="25" y1="35" x2="75" y2="35" strokeDasharray="2 2" />
        <line x1="25" y1="50" x2="75" y2="50" strokeDasharray="2 2" />
        <line x1="105" y1="35" x2="155" y2="35" strokeDasharray="2 2" />
        <line x1="105" y1="50" x2="155" y2="50" strokeDasharray="2 2" />
      </g>

      {/* 3. Atomic Orbital Electron Rings (Bottom Left) */}
      <g transform="translate(90, 520)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.075" fill="none">
        <circle cx="50" cy="50" r="8" fill="currentColor" fillOpacity="0.1" />
        <ellipse cx="50" cy="50" rx="45" ry="16" transform="rotate(30 50 50)" />
        <ellipse cx="50" cy="50" rx="45" ry="16" transform="rotate(-30 50 50)" />
        <ellipse cx="50" cy="50" rx="45" ry="16" transform="rotate(90 50 50)" strokeDasharray="3 3" />
        <circle cx="75" cy="35" r="3" fill="currentColor" fillOpacity="0.12" />
      </g>

      {/* 4. Angle Protractor Arc (Bottom Right) */}
      <g transform="translate(1060, 530)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.07" fill="none">
        <path d="M 0,80 A 80 80 0 0 1 80,0 L 0,0 Z" />
        <path d="M 0,55 A 55 55 0 0 1 55,0" strokeDasharray="2 3" />
        <line x1="0" y1="0" x2="68" y2="42" />
      </g>
    </svg>
  );
}

export default function PortfolioEducation({ education }) {
  if (
    !education ||
    !Array.isArray(education.items) ||
    education.items.length === 0
  ) {
    return null;
  }

  return (
    <section className={styles.section} id="education">
      <EducationBackground />
      <div className={styles.inner}>
        {/* Section Header */}
        <div className={styles.headerGroup} data-reveal>
          <div className={styles.boardTag}>
            <span>★</span>
            <span>Academic Grounds</span>
          </div>
          <h2 className={styles.headline}>
            {education.headline || "Academic Foundations"}
          </h2>
        </div>

        {/* Education Grid */}
        <div className={styles.eduGrid}>
          {education.items.map((item, idx) => (
            <article
              key={item.id || idx}
              className={styles.eduCard}
              data-reveal
              data-reveal-delay={idx}
              style={{ transitionDelay: `${idx * 0.12}s` }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.badgeRow}>
                  {item.period && (
                    <span className={styles.periodBadge}>{item.period}</span>
                  )}
                  {item.grade && (
                    <span className={styles.gradeBadge}>{item.grade}</span>
                  )}
                </div>

                <h3 className={styles.degreeTitle}>{item.degree}</h3>
                <div className={styles.institution}>{item.institution}</div>
              </div>

              {item.coursework && item.coursework.length > 0 && (
                <div className={styles.courseworkSection}>
                  <span className={styles.courseworkLabel}>Core Focus:</span>
                  <div className={styles.courseworkPills}>
                    {item.coursework.map((course) => (
                      <span key={course} className={styles.coursePill}>
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
