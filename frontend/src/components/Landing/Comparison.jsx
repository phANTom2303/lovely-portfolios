import "./Comparison.css";

function Comparison() {
  const crossIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const checkIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <section className="landing-comparison" id="comparison">
      <div className="landing-container">
        <div className="comparison-header">
          <span className="landing-eyebrow">The Problem With Resumes</span>
          <h2>The Resume, Evolved</h2>
          <p className="comparison-subtitle">
            Move beyond the boring PDF. Tell the full story of your career with
            context, visuals, and style.
          </p>
        </div>

        <div className="comparison-grid">
          {/* Traditional PDF Side */}
          <div className="comparison-card traditional-card">
            <div className="card-top-tag tag-traditional">
              Traditional PDF Resume
            </div>

            {/* Standardized visual frame for identical vertical alignment */}
            <div className="comparison-visual-frame" aria-hidden="true">
              <div className="pdf-sheet-mockup">
                <div className="pdf-header-skeleton">
                  <div className="pdf-line title-line"></div>
                  <div className="pdf-line subtitle-line"></div>
                </div>
                <div className="pdf-block">
                  <div className="pdf-line full-line"></div>
                  <div className="pdf-line full-line"></div>
                  <div className="pdf-line full-line"></div>
                  <div className="pdf-line short-line"></div>
                </div>
                <div className="pdf-block">
                  <div className="pdf-line full-line"></div>
                  <div className="pdf-line full-line"></div>
                  <div className="pdf-line short-line"></div>
                </div>
              </div>
            </div>

            <div className="comparison-points">
              <div className="point-item negative">
                <span className="point-icon">{crossIcon}</span>
                <div>
                  <strong>One rigid version for every role</strong>
                  <p>
                    A single generic document sent everywhere, unable to adapt
                    to different role requirements.
                  </p>
                </div>
              </div>
              <div className="point-item negative">
                <span className="point-icon">{crossIcon}</span>
                <div>
                  <strong>Flat and unmemorable</strong>
                  <p>
                    Recruiters glance at plain black-and-white text for seconds
                    and move on.
                  </p>
                </div>
              </div>
              <div className="point-item negative">
                <span className="point-icon">{crossIcon}</span>
                <div>
                  <strong>Guessing keyword matches</strong>
                  <p>
                    Hoping your generic resume hits what the job description
                    actually values.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lovely Portfolio Side */}
          <div className="comparison-card evolved-card">
            <div className="card-top-tag tag-evolved">Lovely Portfolio</div>

            {/* Standardized visual frame for identical vertical alignment */}
            <div className="comparison-visual-frame" aria-hidden="true">
              <div className="evolved-portfolio-frame">
                {/* Background Architectural Artwork from PortfolioHero */}
                <svg
                  className="evolved-bg-artwork"
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

                <div className="evolved-inner-content">
                  {/* Name */}
                  <h3 className="evolved-candidate-name">Jake</h3>

                  {/* Role Title Row with Exp Badge */}
                  <div className="evolved-title-row">
                    <span className="evolved-curated-badge">
                      Senior Frontend Engineer
                    </span>
                    <span className="evolved-exp-badge">6 yrs exp</span>
                  </div>

                  {/* Skeleton Bio Lines */}
                  <div className="evolved-skeleton-bio">
                    <div className="sk-line w-90"></div>
                    <div className="sk-line w-75"></div>
                  </div>

                  {/* Curated Project Card with Skeleton Body */}
                  <div className="evolved-project-card">
                    <h4 className="evolved-project-title">
                      Realtime Component & Token Engine
                    </h4>
                    <div className="evolved-skeleton-project">
                      <div className="sk-line w-85"></div>
                      <div className="sk-line w-60"></div>
                    </div>
                    <div className="evolved-tags-row">
                      <span>React</span>
                      <span>Tokens</span>
                      <span>Figma</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="comparison-points">
              <div className="point-item positive">
                <span className="point-icon">{checkIcon}</span>
                <div>
                  <strong>Tailored to the exact JD</strong>
                  <p>
                    AI extracts role requirements and highlights your most
                    relevant achievements.
                  </p>
                </div>
              </div>
              <div className="point-item positive">
                <span className="point-icon">{checkIcon}</span>
                <div>
                  <strong>Rich, live interactive showcase</strong>
                  <p>
                    Live demo links, project modals, verifiable skills, and rich
                    media in one place.
                  </p>
                </div>
              </div>
              <div className="point-item positive">
                <span className="point-icon">{checkIcon}</span>
                <div>
                  <strong>One profile, unlimited opportunities</strong>
                  <p>
                    Store your details once. Generate dedicated links for every
                    role you target.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Comparison;
