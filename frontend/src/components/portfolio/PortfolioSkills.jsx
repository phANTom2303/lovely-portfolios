import styles from "./PortfolioSkills.module.css";

const ROTATIONS = [-1.8, 1.6, -1.2, 2.1, -1.5, 1.2, -2.0, 1.9];
const PASTEL_PAPERS = [
  "#ffffff",
  "#fffdeb", // warm pale buttercup
  "#f3f8f5", // soft mint parchment
  "#faf6fc", // subtle lilac
  "#fcf6f2", // warm peach paper
];

function PinboardBackground() {
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
        {/* Architectural drafting grid pattern with crosshairs */}
        <pattern
          id="pinboardGrid"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 80 0 L 0 0 0 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeOpacity="0.045"
          />
          {/* Small crosshair ticks at grid intersections */}
          <path
            d="M 0 5 L 0 -5 M -5 0 L 5 0"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.12"
          />
        </pattern>
      </defs>

      {/* Grid Pattern Fill */}
      <rect width="100%" height="100%" fill="url(#pinboardGrid)" />

      {/* 1. Protractor / Drafting Angle Arc (Top Left) */}
      <g transform="translate(60, 95)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.07" fill="none">
        <circle cx="0" cy="0" r="75" strokeDasharray="3 3" />
        <path d="M 0,0 L 68,-32 M 0,0 L 75,0" />
        <path d="M 28,0 A 28 28 0 0 0 25,-12" />
        <circle cx="0" cy="0" r="2.5" fill="currentColor" fillOpacity="0.1" />
      </g>

      {/* 2. Isometric 3D Wireframe Cube Drawing (Top Right) */}
      <g transform="translate(1040, 80) scale(0.9)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.075" fill="none">
        <polygon points="50,10 90,32 90,82 50,60" />
        <polygon points="50,10 10,32 10,82 50,60" />
        <polygon points="50,60 90,32 50,10 10,32" />
        <line x1="50" y1="60" x2="50" y2="105" />
        <line x1="10" y1="82" x2="50" y2="105" />
        <line x1="90" y1="82" x2="50" y2="105" />
      </g>

      {/* 3. Database / Storage Cylinders Sketch (Upper Left) */}
      <g transform="translate(50, 270) scale(0.85)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none">
        <ellipse cx="40" cy="20" rx="35" ry="12" />
        <path d="M 5,20 L 5,48 A 35 12 0 0 0 75,48 L 75,20" />
        <path d="M 5,48 L 5,76 A 35 12 0 0 0 75,76 L 75,48" />
        <path d="M 5,76 L 5,104 A 35 12 0 0 0 75,104 L 75,76" />
        <line x1="85" y1="20" x2="110" y2="20" strokeDasharray="2 2" />
        <line x1="85" y1="60" x2="110" y2="60" strokeDasharray="2 2" />
      </g>

      {/* 4. Network Graph Cluster (Upper Right) */}
      <g transform="translate(1010, 310)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.075" fill="none">
        <circle cx="35" cy="20" r="5" fill="currentColor" fillOpacity="0.08" />
        <circle cx="95" cy="40" r="6" fill="currentColor" fillOpacity="0.08" />
        <circle cx="25" cy="80" r="4" fill="currentColor" fillOpacity="0.08" />
        <circle cx="85" cy="100" r="5" fill="currentColor" fillOpacity="0.08" />
        <circle cx="135" cy="70" r="4" fill="currentColor" fillOpacity="0.08" />
        <line x1="35" y1="20" x2="95" y2="40" />
        <line x1="35" y1="20" x2="25" y2="80" strokeDasharray="3 3" />
        <line x1="95" y1="40" x2="85" y2="100" />
        <line x1="95" y1="40" x2="135" y2="70" />
        <line x1="25" y1="80" x2="85" y2="100" strokeDasharray="3 3" />
      </g>

      {/* 5. Hand-drawn Curly Braces Drawing (Left Middle) */}
      <g transform="translate(50, 480) scale(0.9)" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.07" fill="none" strokeLinecap="round">
        <path d="M 30,10 C 15,10 10,25 10,45 C 10,65 0,70 0,75 C 0,80 10,85 10,105 C 10,125 15,140 30,140" />
      </g>

      {/* 6. Circuit Logic / Data Flow Lines with solder pads (Right Middle) */}
      <g transform="translate(980, 540)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.08" fill="none">
        <path d="M 0,20 L 50,20 L 75,55 L 140,55" strokeDasharray="4 3" />
        <circle cx="0" cy="20" r="3" fill="currentColor" fillOpacity="0.12" />
        <circle cx="140" cy="55" r="3" fill="currentColor" fillOpacity="0.12" />
        <path d="M 30,75 L 80,75 L 105,35 L 150,35" />
        <circle cx="30" cy="75" r="3" fill="currentColor" fillOpacity="0.12" />
        <circle cx="150" cy="35" r="3" fill="currentColor" fillOpacity="0.12" />
      </g>

      {/* 7. Flowchart Logic Decision Diamond (Lower Left) */}
      <g transform="translate(50, 690) scale(0.85)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none">
        <polygon points="50,15 85,50 50,85 15,50" />
        <line x1="50" y1="0" x2="50" y2="15" />
        <path d="M 85,50 L 115,50 L 115,80" />
        <polyline points="111,74 115,80 119,74" />
        <line x1="50" y1="85" x2="50" y2="110" />
        <polyline points="46,104 50,110 54,104" />
      </g>

      {/* 8. Signal Waveform / Harmonic Curve (Lower Right) */}
      <g transform="translate(980, 750)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none" strokeLinecap="round">
        <path d="M 0,30 Q 25,2 50,30 T 100,30 T 150,30" />
        <line x1="0" y1="30" x2="160" y2="30" strokeDasharray="2 3" strokeOpacity="0.04" />
      </g>

      {/* 9. Code Glyph < / > and Lambda (Bottom Left) */}
      <g transform="translate(55, 930) scale(0.9)" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.075" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20,10 6,25 20,40" />
        <line x1="26" y1="42" x2="36" y2="8" />
        <polyline points="42,10 56,25 42,40" />
        <path d="M 80,12 L 96,40 M 91,28 L 84,40" strokeWidth="1.4" />
      </g>

      {/* 10. Terminal prompt glyph >_ (Bottom Right) */}
      <g transform="translate(1040, 960)" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.08" fill="none" strokeLinecap="round">
        <polyline points="0,0 12,9 0,18" />
        <line x1="18" y1="18" x2="32" y2="18" />
      </g>

      {/* Subtle Registration Crosshairs at key margins */}
      <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.09" fill="none">
        <path d="M 1120,220 L 1120,230 M 1115,225 L 1125,225" />
        <path d="M 80,610 L 80,620 M 75,615 L 85,615" />
        <path d="M 1120,890 L 1120,900 M 1115,895 L 1125,895" />
      </g>
    </svg>
  );
}

export default function PortfolioSkills({ skills }) {
  const categories =
    skills && Array.isArray(skills.categories) ? skills.categories : [];

  if (categories.length === 0) {
    return null;
  }

  let globalSkillCounter = 0;

  return (
    <section className={styles.section} id="profile">
      {/* Background Architectural Drawings & Blueprint Watermarks */}
      <PinboardBackground />

      <div className={styles.inner}>
        {/* Section Headline */}
        <div className={styles.headerRow}>
          <div className={styles.headlineGroup}>
            <div className={styles.boardTag}>
              <span>★</span>
              <span>Technical Arsenal</span>
            </div>
            <h2 className={styles.headline}>The tools I build with.</h2>
          </div>
        </div>

        {/* Category Clusters (Organically placed sticky notes, no rigid outer card) */}
        <div className={styles.categoryClusters}>
          {categories.map((cat, catIdx) => {
            const categorySkills = Array.isArray(cat.skills) ? cat.skills : [];

            return (
              <div key={cat.id || cat.name || catIdx} className={styles.clusterBlock}>
                {/* Category Pinboard Marker */}
                <div className={styles.clusterHeader}>
                  <span className={styles.clusterNumber}>
                    {String(catIdx + 1).padStart(2, "0")}
                  </span>
                  <h3 className={styles.clusterTitle}>{cat.name}</h3>
                  <div className={styles.clusterDottedLine} aria-hidden="true" />
                </div>

                {/* Tactile Sticky Note Grid */}
                <div className={styles.pinboardGrid}>
                  {categorySkills.map((skillItem) => {
                    const skillName =
                      typeof skillItem === "string"
                        ? skillItem
                        : skillItem.name || String(skillItem);

                    const rotation =
                      ROTATIONS[globalSkillCounter % ROTATIONS.length];
                    const paperColor =
                      PASTEL_PAPERS[globalSkillCounter % PASTEL_PAPERS.length];
                    globalSkillCounter++;

                    return (
                      <div
                        key={skillName}
                        className={styles.stickyNote}
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          backgroundColor: paperColor,
                        }}
                      >
                        {/* Washi Tape Accent on Top Edge */}
                        <div className={styles.washiTape} aria-hidden="true" />

                        {/* Skill Title */}
                        <h4 className={styles.noteTitle}>{skillName}</h4>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
