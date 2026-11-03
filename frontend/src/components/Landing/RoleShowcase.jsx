import "./RoleShowcase.css";

function RoleShowcase() {
  return (
    <section className="landing-role-showcase" id="roles">
      <div className="landing-container">
        <div className="role-showcase-header">
          <span className="landing-eyebrow eyebrow-teal">
            One Profile. Many Stories.
          </span>
          <h2>Tailored for the exact role you want</h2>
          <p className="role-showcase-subtitle">
            Enter your details once. When you apply to different positions,
            Lovely Portfolio curates your experience, highlights matching
            skills, and prioritizes your narrative.
          </p>
        </div>

        {/* Two Portfolios Side by Side */}
        <div className="side-by-side-grid">
          {/* ── CARD 1: LIGHT THEME (Frontend Role) ── */}
          <div className="portfolio-preview-card preview-light">
            <div className="role-badge-tag">
              <span className="badge-target-label">Target Role</span>
              <span className="badge-target-role">Frontend Engineer</span>
            </div>

            <div className="portfolio-canvas canvas-light">
              {/* Background Architectural Artwork from PortfolioHero */}
              <svg
                className="portfolio-bg-artwork"
                viewBox="0 0 600 500"
                fill="none"
                aria-hidden="true"
              >
                <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.08">
                  <ellipse
                    cx="480"
                    cy="220"
                    rx="220"
                    ry="110"
                    transform="rotate(-25 480 220)"
                    strokeDasharray="4 4"
                  />
                  <ellipse
                    cx="480"
                    cy="220"
                    rx="160"
                    ry="80"
                    transform="rotate(-25 480 220)"
                  />
                  <circle cx="100" cy="90" r="40" strokeDasharray="3 3" />
                  <line x1="40" y1="90" x2="160" y2="90" />
                  <line x1="100" y1="30" x2="100" y2="150" />
                </g>
              </svg>

              <div className="canvas-content">
                {/* Status Pill */}
                <div className="portfolio-status-pill">
                  <span className="status-ping-dot"></span>
                  <span>Available for work</span>
                </div>

                {/* Name */}
                <h3 className="portfolio-name">Jake</h3>

                {/* Role Title Row with Exp Badge */}
                <div className="portfolio-title-row">
                  <span className="title-curated-badge title-frontend">
                    Senior Frontend Engineer
                  </span>
                  <span className="title-exp-badge">6 yrs exp</span>
                </div>

                {/* Skeleton Bio Lines */}
                <div className="skeleton-bio-group">
                  <div className="sk-line w-90"></div>
                  <div className="sk-line w-75"></div>
                </div>

                {/* Curated Skills Block */}
                <div className="portfolio-skills-block">
                  <div className="skills-block-label">Prioritized Skills</div>
                  <div className="skills-chips-row">
                    <span className="chip-skill chip-accent">React 19</span>
                    <span className="chip-skill chip-accent">
                      Design Systems
                    </span>
                    <span className="chip-skill">Web Performance</span>
                    <span className="chip-skill">TypeScript</span>
                  </div>
                </div>

                {/* Curated Project Card with Skeleton Body */}
                <div className="portfolio-project-card card-light">
                  <div className="project-card-header"></div>
                  <h4 className="project-title">
                    Realtime Component & Token Engine
                  </h4>
                  <div className="skeleton-project-body">
                    <div className="sk-line w-85"></div>
                    <div className="sk-line w-60"></div>
                  </div>
                  <div className="project-tags-row">
                    <span>React</span>
                    <span>Tokens</span>
                    <span>Figma</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 2: DARK THEME (Backend Role) ── */}
          <div className="portfolio-preview-card preview-dark">
            <div className="role-badge-tag">
              <span className="badge-target-label">Target Role</span>
              <span className="badge-target-role">
                Distributed Systems Engineer
              </span>
            </div>

            <div className="portfolio-canvas canvas-dark" data-theme="dark">
              {/* Background Architectural Artwork from PortfolioHero */}
              <svg
                className="portfolio-bg-artwork"
                viewBox="0 0 600 500"
                fill="none"
                aria-hidden="true"
              >
                <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.12">
                  <ellipse
                    cx="480"
                    cy="220"
                    rx="220"
                    ry="110"
                    transform="rotate(-25 480 220)"
                    strokeDasharray="4 4"
                  />
                  <ellipse
                    cx="480"
                    cy="220"
                    rx="160"
                    ry="80"
                    transform="rotate(-25 480 220)"
                  />
                  <circle cx="100" cy="90" r="40" strokeDasharray="3 3" />
                  <line x1="40" y1="90" x2="160" y2="90" />
                  <line x1="100" y1="30" x2="100" y2="150" />
                </g>
              </svg>

              <div className="canvas-content">
                {/* Status Pill */}
                <div className="portfolio-status-pill status-dark">
                  <span className="status-ping-dot"></span>
                  <span>Available for work</span>
                </div>

                {/* Name */}
                <h3 className="portfolio-name name-dark">Jake</h3>

                {/* Role Title Row with Exp Badge */}
                <div className="portfolio-title-row">
                  <span className="title-curated-badge title-backend">
                    Distributed Systems Engineer
                  </span>
                  <span className="title-exp-badge exp-dark">6 yrs exp</span>
                </div>

                {/* Skeleton Bio Lines */}
                <div className="skeleton-bio-group">
                  <div className="sk-line sk-line-dark w-90"></div>
                  <div className="sk-line sk-line-dark w-75"></div>
                </div>

                {/* Curated Skills Block */}
                <div className="portfolio-skills-block">
                  <div className="skills-block-label label-dark">
                    Prioritized Skills
                  </div>
                  <div className="skills-chips-row">
                    <span className="chip-skill chip-accent-dark">
                      PostgreSQL
                    </span>
                    <span className="chip-skill chip-accent-dark">
                      Distributed Systems
                    </span>
                    <span className="chip-skill chip-dark">Node.js</span>
                    <span className="chip-skill chip-dark">Docker</span>
                  </div>
                </div>

                {/* Curated Project Card with Skeleton Body */}
                <div className="portfolio-project-card card-dark">
                  <div className="project-card-header"></div>
                  <h4 className="project-title title-dark">
                    Event Streaming Telemetry Pipeline
                  </h4>
                  <div className="skeleton-project-body">
                    <div className="sk-line sk-line-dark w-85"></div>
                    <div className="sk-line sk-line-dark w-60"></div>
                  </div>
                  <div className="project-tags-row tags-dark">
                    <span>Kafka</span>
                    <span>Node.js</span>
                    <span>PostgreSQL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RoleShowcase;
