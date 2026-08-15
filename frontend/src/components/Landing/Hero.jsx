import "./Hero.css";
function Hero() {
  return (
    <section className="hero">
      <div className="hero-visuals" aria-hidden="true">
        <svg
          className="hero-lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path d="M10 20 Q40 50 90 30" />
          <path d="M20 70 Q50 40 80 70" />
          <path d="M30 10 Q60 90 90 50" />
        </svg>

        <div className="floating-card card-one">
          <div className="skeleton-title"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
          <div className="skeleton-line shorter"></div>
        </div>

        <div className="floating-card card-two">
          <div className="skeleton-profile">
            <div className="skeleton-avatar"></div>

            <div className="skeleton-profile-text">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>

          <div className="skeleton-tags">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="floating-card card-three">
          <div className="skeleton-image"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>

      <div className="hero-content">
        <span className="hero-eyebrow">The new standard for portfolios</span>

        <h1>
          Build a professional <span className="hero-accent">identity</span>{" "}
          people remember
        </h1>

        <p>
          Bring your projects, experience, education, skills and achievements
          together into a cohesive portfolio that speaks for itself.
        </p>

        <div className="hero-actions">
          <a href="/signup" className="hero-primary">
            Start with Resume
          </a>

          <a href="/signin" className="hero-secondary">
            Sign In
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
