import styles from "./PortfolioCertifications.module.css";

function CertificateCard({ cert, idx }) {
  return (
    <article
      className={styles.certCard}
      data-reveal
      data-reveal-delay={idx}
      style={{ transitionDelay: `${(idx % 4) * 0.1}s` }}
    >
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
          <span className={styles.authorityName}>{cert.org}</span>
        </div>

        {/* Footer: Credential ID + Verify Link */}
        <div className={styles.certFooter}>
          <div className={styles.credentialGroup}>
            {cert.credentialId && (
              <span className={styles.credentialId}>ID: {cert.credentialId}</span>
            )}
            {cert.validUntil && (
              <span className={styles.validityBadge}>
                Valid: {cert.validUntil}
              </span>
            )}
          </div>

          {cert.verifyUrl && (
            <a
              href={cert.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.verifyLink}
              title={`Verify ${cert.title}`}
            >
              <span>Verify</span>
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </article>
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
      {/* 1. Geometric Guilloche Rosette Curves (Top Right) */}
      <g transform="translate(1050, 100)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.07" fill="none">
        <circle cx="0" cy="0" r="50" />
        <circle cx="0" cy="0" r="65" strokeDasharray="2 3" />
        <path d="M 0,-65 C 35,-65 65,-35 65,0 C 65,35 35,65 0,65 C -35,65 -65,35 -65,0 C -65,-35 -35,-65 0,-65" />
        <path d="M -46,-46 C 0,-65 46,-46 65,0 C 46,46 0,65 -46,46 C -65,0 -46,-46 -46,-46" />
      </g>

      {/* 2. Certificate Seal Geometry (No letters, strictly geometric rings & rays) (Top Left) */}
      <g transform="translate(100, 120)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.075" fill="none">
        <circle cx="0" cy="0" r="45" />
        <circle cx="0" cy="0" r="36" strokeDasharray="3 3" />
        <circle cx="0" cy="0" r="28" />
        <polygon points="0,-24 7,-7 24,0 7,7 0,24 -7,7 -24,0 -7,-7" fill="currentColor" fillOpacity="0.06" />
        <line x1="0" y1="45" x2="-18" y2="85" />
        <line x1="-18" y1="85" x2="0" y2="72" />
        <line x1="0" y1="45" x2="18" y2="85" />
        <line x1="18" y1="85" x2="0" y2="72" />
      </g>

      {/* 3. Diploma Double Border Frame Vectors (Bottom Right) */}
      <g transform="translate(1020, 560)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.07" fill="none">
        <rect x="0" y="0" width="120" height="150" rx="4" />
        <rect x="8" y="8" width="104" height="134" rx="2" strokeDasharray="3 3" />
        <circle cx="60" cy="40" r="14" />
        <line x1="30" y1="75" x2="90" y2="75" />
        <line x1="25" y1="95" x2="95" y2="95" />
        <line x1="35" y1="115" x2="85" y2="115" />
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

  return (
    <section className={styles.section} id="certs">
      <CertificationsBackground />
      <div className={styles.inner}>
        {/* Section Header */}
        <div className={styles.headerGroup} data-reveal>
          <div className={styles.boardTag}>
            <span>★</span>
            <span>Accreditations</span>
          </div>
          <h2 className={styles.headline}>
            {certifications.headline || "Verified Credentials"}
          </h2>
        </div>

        {/* Certificate Cards Gallery */}
        <div className={styles.certGrid}>
          {certifications.items.map((cert, idx) => (
            <CertificateCard key={cert.id || idx} cert={cert} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
