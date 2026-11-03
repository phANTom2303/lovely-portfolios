import "./Features.css";

function Features() {
  const secondaryFeatures = [
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="12" x2="18" y2="12" />
          <line x1="6" y1="12" x2="2" y2="12" />
          <line x1="12" y1="6" x2="12" y2="2" />
          <line x1="12" y1="22" x2="12" y2="18" />
        </svg>
      ),
      title: "Context-Aware Phrasing",
      description:
        "Our pipeline rewrites your bullet points using the terminology in the job description while preserving 100% of your real accomplishments.",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      title: "Instant In-Browser Editor",
      description:
        "Fine-tune AI-generated copy, reorder your experiences, or swap tags with a live WYSIWYG editor before sharing.",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      title: "Clean Shareable Links",
      description:
        "Every generated portfolio gets a dedicated URL you can paste straight into job applications, emails, or messages.",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
      title: "Dark & Light Theme Tokens",
      description:
        "Clean modern design tokens ensure your portfolio renders crisply in high contrast, whether viewers prefer daylight or night mode.",
    },
  ];

  return (
    <section className="landing-features" id="features">
      <div className="landing-container">
        <div className="features-header">
          <span className="landing-eyebrow eyebrow-teal">
            Crafted for Impact
          </span>
          <h2>Built for depth and detail.</h2>
          <p className="features-subtitle">
            Every element is crafted to showcase your professional journey with
            the fidelity it deserves.
          </p>
        </div>

        {/* Two Featured Marquee Cards (from inspiration) */}
        <div className="marquee-grid">
          {/* Card 1: Immersive Project Modals */}
          <div className="marquee-card">
            <div
              className="marquee-visual modal-visual-preview"
              aria-hidden="true"
            >
              <div className="desktop-screen-mockup">
                <div className="modal-dialog-preview">
                  <div className="dialog-header">
                    <span className="dialog-category">FEATURED PROJECT</span>
                  </div>
                  <h4 className="dialog-title">
                    Next-Gen Realtime Design System
                  </h4>
                  <div className="dialog-tags">
                    <span>Figma</span>
                    <span>Tokens</span>
                    <span>React 19</span>
                  </div>
                  <div className="dialog-content-skeleton">
                    <div className="sk-bar w-80"></div>
                    <div className="sk-bar w-100"></div>
                    <div className="sk-bar w-60"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="marquee-info">
              <h3>Immersive Project Modals</h3>
              <p>
                Don't just list a project. Open up a rich, full-screen case
                study directly from your profile without losing context.
              </p>
            </div>
          </div>

          {/* Card 2: Flawless on any device */}
          <div className="marquee-card">
            <div
              className="marquee-visual device-visual-preview"
              aria-hidden="true"
            >
              <div className="phone-screen-mockup">
                <div className="phone-speaker"></div>
                <div className="phone-inner-content">
                  <div className="phone-avatar"></div>
                  <div className="phone-line title"></div>
                  <div className="phone-line subtitle"></div>
                  <div className="phone-chips">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="phone-card-block"></div>
                </div>
              </div>
            </div>

            <div className="marquee-info">
              <h3>Flawless on any device</h3>
              <p>
                Your profile automatically adapts to look stunning on mobile,
                tablet, and ultra-wide desktop displays.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Feature Sub-cards */}
        <div className="features-subgrid">
          {secondaryFeatures.map((item, idx) => (
            <div key={idx} className="subfeature-card">
              <div className="subfeature-icon">{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
