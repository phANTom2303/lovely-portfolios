import { useState, useEffect, useRef } from "react";
import MediaGallery from "./MediaGallery";
import styles from "./PortfolioExtras.module.css";

function ExtrasBackground() {
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
      {/* 1. Global Wireframe Mesh & Coordinate Latitude/Longitude Arcs (Top Right) */}
      <g transform="translate(1040, 100)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.07" fill="none">
        <circle cx="0" cy="0" r="65" />
        <ellipse cx="0" cy="0" rx="65" ry="26" />
        <ellipse cx="0" cy="0" rx="26" ry="65" />
        <line x1="-65" y1="0" x2="65" y2="0" strokeDasharray="3 3" />
        <line x1="0" y1="-65" x2="0" y2="65" strokeDasharray="3 3" />
      </g>

      {/* 2. Constellation Network Cluster (Top Left) */}
      <g transform="translate(70, 90)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.075" fill="none">
        <circle cx="20" cy="20" r="5" fill="currentColor" fillOpacity="0.1" />
        <circle cx="90" cy="35" r="4" fill="currentColor" fillOpacity="0.1" />
        <circle cx="40" cy="90" r="6" fill="currentColor" fillOpacity="0.1" />
        <circle cx="110" cy="110" r="4" fill="currentColor" fillOpacity="0.1" />
        <circle cx="140" cy="45" r="5" fill="currentColor" fillOpacity="0.1" />
        <line x1="20" y1="20" x2="90" y2="35" />
        <line x1="20" y1="20" x2="40" y2="90" />
        <line x1="90" y1="35" x2="140" y2="45" />
        <line x1="90" y1="35" x2="40" y2="90" strokeDasharray="3 3" />
        <line x1="40" y1="90" x2="110" y2="110" />
        <line x1="140" y1="45" x2="110" y2="110" strokeDasharray="3 3" />
      </g>

      {/* 3. Broadcast Signal Waves (Bottom Left) */}
      <g transform="translate(80, 560)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none">
        <circle cx="0" cy="80" r="5" fill="currentColor" fillOpacity="0.1" />
        <path d="M 0,55 A 25 25 0 0 1 25,80" />
        <path d="M 0,35 A 45 45 0 0 1 45,80" strokeDasharray="3 3" />
        <path d="M 0,15 A 65 65 0 0 1 65,80" />
      </g>

      {/* 4. Connected Node Cluster (Bottom Right) */}
      <g transform="translate(1020, 560)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.075" fill="none">
        <circle cx="30" cy="30" r="12" />
        <circle cx="100" cy="70" r="16" />
        <line x1="42" y1="30" x2="84" y2="70" />
        <circle cx="30" cy="110" r="10" />
        <line x1="30" y1="42" x2="30" y2="100" strokeDasharray="2 2" />
        <line x1="40" y1="110" x2="84" y2="70" />
      </g>
    </svg>
  );
}

export default function PortfolioExtras({ extras }) {
  const items = extras && Array.isArray(extras.items) ? extras.items : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const total = items.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // Auto-advance every 6.0s, pauses on hover
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 6000);

    return () => clearInterval(timerRef.current);
  }, [total, isPaused]);

  if (total === 0) return null;

  const currentItem = items[currentIndex];
  const hasMedia =
    (Array.isArray(currentItem.media) && currentItem.media.length > 0) ||
    (Array.isArray(currentItem.images) && currentItem.images.length > 0) ||
    Boolean(currentItem.image);

  return (
    <section className={styles.section} id="extras">
      <ExtrasBackground />
      <div className={styles.inner}>
        {/* Section Header with Carousel Controls */}
        <div className={styles.headerRow} data-reveal>
          <div className={styles.headlineGroup}>
            <div className={styles.boardTag}>
              <span>★</span>
              <span>Community & Leadership</span>
            </div>
            <h2 className={styles.headline}>
              {extras.headline || "Beyond the Terminal"}
            </h2>
          </div>

          {total > 1 && (
            <div className={styles.controls}>
              <div className={styles.counter}>
                <span className={styles.currentNum}>
                  {String(currentIndex + 1).padStart(2, "0")}
                </span>
                <span className={styles.counterDivider}>/</span>
                <span className={styles.totalNum}>
                  {String(total).padStart(2, "0")}
                </span>
              </div>

              <div className={styles.arrowGroup}>
                <button
                  type="button"
                  onClick={prevSlide}
                  className={styles.arrowBtn}
                  aria-label="Previous activity"
                  title="Previous activity"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className={styles.arrowBtn}
                  aria-label="Next activity"
                  title="Next activity"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Carousel Slide Card (Adaptive Left-Right / Media Layout) */}
        <div
          className={styles.carouselContainer}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          data-reveal
        >
          <div
            key={currentItem.id || currentIndex}
            className={`${styles.slideCard} ${
              hasMedia ? styles.slideCardWithMedia : ""
            }`}
          >
            {/* Left Column: Role & Organization */}
            <div className={styles.leftCol}>
              <div className={styles.badgeRow}>
                {currentItem.isCurrent && (
                  <span className={styles.activeBadge}>
                    <span className={styles.activeBeacon} aria-hidden="true" />
                    ACTIVE ROLE
                  </span>
                )}
                {currentItem.period && (
                  <span className={styles.periodBadge}>
                    {currentItem.period}
                  </span>
                )}
              </div>

              <h3 className={styles.roleTitle}>{currentItem.role}</h3>
              <div className={styles.orgName}>{currentItem.org}</div>

              {hasMedia && (
                <p className={styles.summaryWithMedia}>{currentItem.summary}</p>
              )}

              {currentItem.tags && currentItem.tags.length > 0 && (
                <div className={styles.tagsRow}>
                  {currentItem.tags.map((tag) => (
                    <span key={tag} className={styles.tagPill}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Media Gallery OR Narrative Text */}
            {hasMedia ? (
              <div className={styles.mediaCol}>
                <MediaGallery
                  media={currentItem.media || currentItem.images || currentItem.image}
                  altTitle={`${currentItem.role} at ${currentItem.org}`}
                  aspectRatio="16/10"
                />
              </div>
            ) : (
              <div className={styles.rightCol}>
                <p className={styles.summaryText}>{currentItem.summary}</p>

                {currentItem.tags && currentItem.tags.length > 0 && (
                  <div className={styles.tagsRow}>
                    {currentItem.tags.map((tag) => (
                      <span key={tag} className={styles.tagPill}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination Indicators */}
          {total > 1 && (
            <div className={styles.paginationTrack}>
              {items.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`${styles.dotPill} ${
                    dotIdx === currentIndex ? styles.dotPillActive : ""
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
