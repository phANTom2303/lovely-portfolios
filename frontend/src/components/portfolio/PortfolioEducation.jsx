import { motion } from "framer-motion";
import { getOrderedItems } from "../../utils/orderUtils";
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
      {/* 1. Drafting Compass Divider Tool Geometry */}
      <g
        transform="translate(100, 90)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.075"
        fill="none"
      >
        <circle cx="50" cy="15" r="8" />
        <line x1="50" y1="23" x2="20" y2="105" />
        <line x1="50" y1="23" x2="80" y2="105" />
        <path d="M 30,75 A 40 40 0 0 0 70,75" strokeDasharray="2 3" />
        <circle cx="20" cy="105" r="2" fill="currentColor" fillOpacity="0.1" />
        <circle cx="80" cy="105" r="2" fill="currentColor" fillOpacity="0.1" />
      </g>

      {/* 2. Open Book / Research Folio Isometric Curve */}
      <g
        transform="translate(1030, 90)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.07"
        fill="none"
      >
        <path d="M 10,20 Q 50,5 90,20 L 90,75 Q 50,60 10,75 Z" />
        <path d="M 90,20 Q 130,5 170,20 L 170,75 Q 130,60 90,75 Z" />
        <line x1="90" y1="20" x2="90" y2="75" />
      </g>

      {/* 3. Atomic Orbital Electron Rings */}
      <g
        transform="translate(90, 520)"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.075"
        fill="none"
      >
        <circle cx="50" cy="50" r="8" fill="currentColor" fillOpacity="0.1" />
        <ellipse cx="50" cy="50" rx="45" ry="16" transform="rotate(30 50 50)" />
        <ellipse
          cx="50"
          cy="50"
          rx="45"
          ry="16"
          transform="rotate(-30 50 50)"
        />
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
        <div className={styles.headerGroup}>
          <h2 className={styles.headline}>Academic Background</h2>
        </div>

        {/* Education Grid */}
        <div className={styles.eduGrid}>
          {getOrderedItems(education.items).map((item, idx) => (
            <motion.article
              key={item.id || (item.degree ? `${item.degree}-${idx}` : idx)}
              className={styles.eduCard}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: idx * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className={styles.cardHeader}>
                {(() => {
                  const s = item.from_date || item.startDate;
                  const e = item.to_date || item.endDate;
                  const sYear = s ? String(s).slice(0, 4) : "";
                  const eYear = e ? String(e).slice(0, 4) : "Present";
                  const dateText = sYear ? `${sYear} – ${eYear}` : item.period || "";

                  return (
                    <div className={styles.badgeRow}>
                      {dateText && (
                        <span className={styles.periodBadge}>{dateText}</span>
                      )}
                      {item.grade && (
                        <span className={styles.gradeBadge}>{item.grade}</span>
                      )}
                    </div>
                  );
                })()}

                <h3 className={styles.degreeTitle}>
                  {item.degree}
                  {item.stream && (
                    <span className={styles.streamText}> — {item.stream}</span>
                  )}
                </h3>
                <div className={styles.institution}>
                  {item.institute_name || item.institution}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
