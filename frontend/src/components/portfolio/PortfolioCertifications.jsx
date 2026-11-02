import { motion } from "framer-motion";
import { getOrderedItems } from "../../utils/orderUtils";
import styles from "./PortfolioCertifications.module.css";

function CertificateCard({ cert, idx }) {
  return (
    <motion.article
      className={styles.certCard}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (idx % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      {/* Holographic Metallic Shimmer Sweep on Hover */}
      <div className={styles.holographicShimmer} aria-hidden="true" />

      {/* Decorative Certificate Inner Border Frame */}
      <div className={styles.certFrame} aria-hidden="true" />
      <div className={styles.cornerTopLeft} aria-hidden="true" />
      <div className={styles.cornerTopRight} aria-hidden="true" />
      <div className={styles.cornerBottomLeft} aria-hidden="true" />
      <div className={styles.cornerBottomRight} aria-hidden="true" />

      <div className={styles.certContent}>
        {/* Certificate Heading */}
        <div className={styles.certHeader}>
          <span className={styles.certTypeBadge}>Certificate of Proficiency</span>
          <span className={styles.yearTag}>{cert.year}</span>
        </div>

        {/* Certificate Title */}
        <h3 className={styles.certTitle}>{cert.title}</h3>

        {/* Issuing Authority */}
        <div className={styles.authorityRow}>
          <span className={styles.authorityLabel}>Issued by</span>
          <span className={styles.authorityName}>
            {cert.org || cert.subtitle}
          </span>
        </div>

        {/* Footer: Validity & Direct Link */}
        <div className={styles.certFooter}>
          {cert.validUntil && (
            <span className={styles.validityBadge}>
              Valid: {cert.validUntil}
            </span>
          )}

          {(cert.link || cert.verifyUrl) && (
            <motion.a
              href={cert.link || cert.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.certLink}
              title="View Certificate"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={styles.certLinkLabel}>
                {cert.linkTitle || "View Certificate"}
              </span>
              <span className={styles.certLinkArrow} aria-hidden="true">
                ↗
              </span>
            </motion.a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function CertificationsBackground() {
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
      {/* 1. Geometric Guilloche Rosette Curves */}
      <g transform="translate(1050, 100)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.07" fill="none">
        <circle cx="0" cy="0" r="50" />
        <circle cx="0" cy="0" r="65" strokeDasharray="2 3" />
        <path d="M 0,-65 C 35,-65 65,-35 65,0 C 65,35 35,65 0,65 C -35,65 -65,35 -65,0 C -65,-35 -35,-65 0,-65" />
      </g>

      {/* 2. Certificate Seal Geometry */}
      <g transform="translate(100, 120)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.075" fill="none">
        <circle cx="0" cy="0" r="45" />
        <circle cx="0" cy="0" r="36" strokeDasharray="3 3" />
        <polygon points="0,-24 7,-7 24,0 7,7 0,24 -7,7 -24,0 -7,-7" fill="currentColor" fillOpacity="0.06" />
      </g>
    </svg>
  );
}

export default function PortfolioCertifications({ certifications }) {
  if (
    !certifications ||
    !Array.isArray(certifications.items) ||
    certifications.items.length === 0
  ) {
    return null;
  }

  const items = getOrderedItems(certifications.items);

  return (
    <section className={styles.section} id="certifications">
      <CertificationsBackground />
      <div className={styles.inner}>
        {/* Section Header */}
        <div className={styles.headerGroup}>
          <h2 className={styles.headline}>Professional Certifications & Licenses</h2>
        </div>

        {/* Certificate Cards Grid */}
        <div className={styles.certGrid}>
          {items.map((cert, idx) => (
            <CertificateCard
              key={cert.id || (cert.title ? `${cert.title}-${idx}` : idx)}
              cert={cert}
              idx={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
