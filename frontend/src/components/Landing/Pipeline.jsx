import "./Pipeline.css";

function Pipeline() {
  const stages = [
    {
      id: "jd-parser",
      title: "JD Parser",
      tagline: "Stage 01",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      description:
        "Extracts technical demands, soft skills, and core expectations from the job posting."
    },
    {
      id: "re-prioritizer",
      title: "RE Prioritizer",
      tagline: "Stage 02",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      ),
      description:
        "Ranks the user's stored experiences based on their relevance to the specific role."
    },
    {
      id: "content-optimizer",
      title: "Content Optimizer",
      tagline: "Stage 03",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      description:
        "Actively rewrites bullet points to highlight relevant achievements matching JD phrasing, without fabricating facts."
    },
    {
      id: "portfolio-generator",
      title: "Portfolio Generator",
      tagline: "Stage 04",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      description:
        "Compiles the optimized data into a unique database schema and pushes it to a live, tailored URL."
    }
  ];

  return (
    <section className="landing-pipeline" id="pipeline">
      <div className="landing-container">
        <div className="pipeline-header">
          <span className="landing-eyebrow eyebrow-coral">Sequential Pipeline</span>
          <h2>The Four-Stage Intelligent Assembly Line</h2>
          <p className="pipeline-subtitle">
            A sequential LLM pipeline moves far beyond basic keyword matching to{" "}
            <strong>prioritize</strong> and <strong>optimize</strong> the candidate's
            exact professional narrative.
          </p>
        </div>

        {/* Assembly Line Cards Grid */}
        <div className="stages-grid">
            {stages.map((stage) => (
              <div key={stage.id} className="stage-card">
                <div className="stage-top-meta">
                  <span className="stage-tag">{stage.tagline}</span>
                  <div className="stage-icon-circle">{stage.icon}</div>
                </div>

                <h3 className="stage-card-title">{stage.title}</h3>
                <p className="stage-card-desc">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
  );
}

export default Pipeline;
