import { useState, useEffect, useRef } from "react";
import MediaGallery from "./MediaGallery";
import styles from "./PortfolioAchievements.module.css";

function AchievementsBackground() {
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
      {/* 1. Faceted Jewel / Crystal Wireframe (Top Left) */}
      <g transform="translate(60, 90) scale(0.9)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.075" fill="none">
        <polygon points="50,10 90,30 80,75 20,75 10,30" />
        <polygon points="50,10 70,30 65,75 35,75 30,30" strokeDasharray="3 3" />
        <line x1="10" y1="30" x2="90" y2="30" />
        <line x1="50" y1="10" x2="50" y2="75" />
      </g>

      {/* 2. Geometric Laurel Branch Outline (Top Right) */}
      <g transform="translate(1060, 90)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none">
        <path d="M 40,0 Q 10,60 40,120" />
        <ellipse cx="25" cy="25" rx="14" ry="7" transform="rotate(-30 25 25)" />
        <ellipse cx="18" cy="60" rx="14" ry="7" transform="rotate(-15 18 60)" />
        <ellipse cx="25" cy="95" rx="14" ry="7" transform="rotate(15 25 95)" />
      </g>

      {/* 3. Starburst Ray Compass Geometry (Middle Left) */}
      <g transform="translate(60, 480)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.07" fill="none">
        <circle cx="50" cy="50" r="45" strokeDasharray="2 3" />
        <line x1="50" y1="0" x2="50" y2="100" />
        <line x1="0" y1="50" x2="100" y2="50" />
        <line x1="15" y1="15" x2="85" y2="85" strokeDasharray="3 3" />
        <line x1="15" y1="85" x2="85" y2="15" strokeDasharray="3 3" />
        <polygon points="50,30 55,45 70,50 55,55 50,70 45,55 30,50 45,45" fill="currentColor" fillOpacity="0.08" />
      </g>

      {/* 4. Trophy Cup Geometric Vector Contour (Bottom Right) */}
      <g transform="translate(1040, 560) scale(0.9)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.075" fill="none">
        <path d="M 20,10 L 80,10 L 70,55 A 20 20 0 0 1 30,55 Z" />
        <line x1="50" y1="55" x2="50" y2="80" />
        <line x1="30" y1="80" x2="70" y2="80" />
        <path d="M 20,18 C 5,18 5,40 25,40" />
        <path d="M 80,18 C 95,18 95,40 75,40" />
      </g>
    </svg>
  );
}

export default function PortfolioAchievements({ achievements }) {
  const items =
    achievements && Array.isArray(achievements.items) ? achievements.items : [];
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

  // Auto-advance every 5.5 seconds, pauses when user hovers
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5500);

    return () => clearInterval(timerRef.current);
  }, [total, isPaused]);

  if (total === 0) return null;

  const currentItem = items[currentIndex];
  const hasMedia =
    (Array.isArray(currentItem.media) && currentItem.media.length > 0) ||
    (Array.isArray(currentItem.images) && currentItem.images.length > 0) ||
    Boolean(currentItem.image);

  return (
    <section className={styles.section} id="achievements">
      <AchievementsBackground />
      <div className={styles.inner}>
        {/* Section Header with Carousel Controls */}
        <div className={styles.headerRow} data-reveal>
          <div className={styles.headlineGroup}>
            <div className={styles.boardTag}>
              <span>★</span>
              <span>Proof of Work</span>
            </div>
            <h2 className={styles.headline}>
              {achievements.headline || "Honors & Proof of Work"}
            </h2>
          </div>

          {/* Navigation Controls */}
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
                  aria-label="Previous achievement"
                  title="Previous achievement"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className={styles.arrowBtn}
                  aria-label="Next achievement"
                  title="Next achievement"
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
            {/* Left Column: Prestigious Identity & Narrative */}
            <div className={styles.leftCol}>
              <div className={styles.badgeRow}>
                {currentItem.rank && (
                  <span className={styles.rankBadge}>{currentItem.rank}</span>
                )}
                {currentItem.category && (
                  <span className={styles.categoryBadge}>
                    {currentItem.category}
                  </span>
                )}
              </div>

              <h3 className={styles.title}>{currentItem.title}</h3>

              <div className={styles.metaRow}>
                <span className={styles.org}>{currentItem.org}</span>
                {currentItem.year && (
                  <>
                    <span className={styles.metaDot}>·</span>
                    <span className={styles.year}>{currentItem.year}</span>
                  </>
                )}
              </div>

              {hasMedia && (
                <p className={styles.summaryWithMedia}>{currentItem.summary}</p>
              )}

              {currentItem.tags && currentItem.tags.length > 0 && (
                <div className={styles.tagsRow}>
                  {currentItem.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Media Gallery OR Narrative Quote */}
            {hasMedia ? (
              <div className={styles.mediaCol}>
                <MediaGallery
                  media={currentItem.media || currentItem.images || currentItem.image}
                  altTitle={`${currentItem.title} proof of work`}
                  aspectRatio="16/10"
                />
              </div>
            ) : (
              <div className={styles.rightCol}>
                <div className={styles.quoteMark} aria-hidden="true">
                  “
                </div>
                <p className={styles.summary}>{currentItem.summary}</p>

                {currentItem.tags && currentItem.tags.length > 0 && (
                  <div className={styles.tagsRow}>
                    {currentItem.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination Track Dots */}
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
