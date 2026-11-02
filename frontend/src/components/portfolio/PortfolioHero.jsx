import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TiltCard from "./TiltCard";
import styles from "./PortfolioHero.module.css";

function HeroBackground() {
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
      {/* 1. Large Orbital Trajectory Ellipse (Center Right) */}
      <g
        transform="translate(850, 400)"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.065"
        fill="none"
      >
        <ellipse
          cx="0"
          cy="0"
          rx="360"
          ry="180"
          transform="rotate(-25)"
          strokeDasharray="4 4"
        />
        <ellipse cx="0" cy="0" rx="280" ry="140" transform="rotate(-25)" />
        <circle cx="210" cy="-70" r="4" fill="currentColor" fillOpacity="0.1" />
        <circle
          cx="-180"
          cy="65"
          r="3"
          fill="currentColor"
          fillOpacity="0.08"
        />
      </g>

      {/* 2. Precision Optical Focus / Coordinate Aperture (Top Left) */}
      <g
        transform="translate(140, 140)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.075"
        fill="none"
      >
        <circle cx="0" cy="0" r="60" />
        <circle cx="0" cy="0" r="42" strokeDasharray="3 3" />
        <circle cx="0" cy="0" r="4" fill="currentColor" fillOpacity="0.12" />
        <line x1="-75" y1="0" x2="75" y2="0" />
        <line x1="0" y1="-75" x2="0" y2="75" />
      </g>

      {/* 3. Signal Wave / Harmonic Curves (Bottom Left) */}
      <g
        transform="translate(90, 680)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.07"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M 0,20 Q 30,0 60,20 T 120,20 T 180,20 T 240,20" />
        <path
          d="M 0,35 Q 30,15 60,35 T 120,35 T 180,35 T 240,35"
          strokeDasharray="3 3"
        />
      </g>

      {/* 4. Radial Degree Marks Arc (Top Right) */}
      <g
        transform="translate(1080, 120)"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.07"
        fill="none"
      >
        <path d="M -80,0 A 80 80 0 0 1 0,80" />
        <path d="M -60,0 A 60 60 0 0 1 0,60" strokeDasharray="2 3" />
        <line x1="-80" y1="0" x2="-90" y2="0" />
        <line x1="-56" y1="56" x2="-64" y2="64" />
        <line x1="0" y1="80" x2="0" y2="90" />
      </g>

      {/* 5. Minimal Corner Target Crosshairs */}
      <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.09" fill="none">
        <path d="M 50,40 L 50,60 M 40,50 L 60,50" />
        <path d="M 1150,40 L 1150,60 M 1140,50 L 1160,50" />
        <path d="M 1150,740 L 1150,760 M 1140,750 L 1160,750" />
      </g>
    </svg>
  );
}

export default function PortfolioHero({ about, hero }) {
  const data = about || hero || {};
  const [typedName, setTypedName] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);

  useEffect(() => {
    const fullText = data.name || "";
    let idx = 0;
    let interval;

    const startTimeout = setTimeout(() => {
      setTypedName("");
      setIsTypingDone(false);

      interval = setInterval(() => {
        idx++;
        setTypedName(fullText.slice(0, idx));
        if (idx >= fullText.length) {
          clearInterval(interval);
          setIsTypingDone(true);
        }
      }, 70);
    }, 200);

    return () => {
      clearTimeout(startTimeout);
      if (interval) clearInterval(interval);
    };
  }, [data.name]);

  const userPhoto =
    data["profile-photo"] ||
    data.profilePhoto ||
    data.avatar ||
    "/Images/image.png";

  return (
    <section className={styles.hero} id="about">
      <HeroBackground />
      <div className={styles.gridPattern} aria-hidden="true" />

      <div className={styles.inner}>
        {/* Left Column: Core Identity */}
        <motion.div
          className={styles.leftCol}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {data.available && (
            <div className={styles.statusPill}>
              <span className={styles.radarWrapper} aria-hidden="true">
                <span className={styles.radarPing} />
                <span className={styles.statusDot} />
              </span>
              <span>Available for work</span>
            </div>
          )}

          <h1 className={styles.name}>
            <span>{typedName}</span>
            <span
              className={`${styles.cursor} ${
                isTypingDone ? styles.cursorSettled : ""
              }`}
              aria-hidden="true"
            >
              |
            </span>
          </h1>

          {/* Title Row with Static Role & Experience Badge */}
          <div className={styles.titleRow}>
            <span className={styles.titleBadge}>{data.title}</span>
            {data.experience && (
              <span className={styles.expBadge}>
                <span className={styles.expIcon}>⚡</span> {data.experience}
              </span>
            )}
            {data.location && (
              <span className={styles.locationTag}>📍 {data.location}</span>
            )}
          </div>

          <p className={styles.about}>{data.about}</p>

          <div className={styles.actionsRow}>
            <motion.button
              type="button"
              onClick={() => {
                const el = document.getElementById("projects");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={styles.btnPrimary}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>View Projects</span>
              <span className={styles.actionIcon} aria-hidden="true">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </span>
            </motion.button>

            <motion.a
              href={`mailto:${data.email}`}
              className={styles.btnSecondary}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Get in touch</span>
              <span className={styles.actionIcon} aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
            </motion.a>
          </div>

          {data.socials && data.socials.length > 0 && (
            <div className={styles.socialsList}>
              {data.socials.map((s) => (
                <a
                  key={s.title}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  {s.title} ↗
                </a>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Column: User Photo in 3D Card */}
        <div className={styles.rightCol}>
          <div className={styles.stageWrapper}>
            <TiltCard
              maxRotation={6}
              glare={true}
              className={styles.tiltCardContainer}
            >
              <div className={styles.showcaseCard}>
                <div className={styles.cardTitleBar}>
                  <div className={styles.windowDots} aria-hidden="true">
                    <span className={styles.dotRed} />
                    <span className={styles.dotYellow} />
                    <span className={styles.dotGreen} />
                  </div>
                </div>

                <div className={styles.avatarContainer}>
                  <img
                    src={userPhoto}
                    alt={data.name}
                    className={styles.avatarImage}
                  />
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
