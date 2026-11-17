import "./HowItWorks.css";

function HowItWorks() {
  const steps = [
    {
      number: "01",
      badge: "One-Time Setup",
      title: "Add your details",
      desc: "Save your projects, work experience, education, skills, certifications, and achievements once in your master profile. No more repetitive typing.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      pillClass: "step-pill-mustard"
    },
    {
      number: "02",
      badge: "Target The Role",
      title: "Paste a job description",
      desc: "Drop in the requirements from any job posting. Our intelligent parser analyzes technical demands, culture signals, and key competencies.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      pillClass: "step-pill-teal"
    },
    {
      number: "03",
      badge: "Instant Publish",
      title: "Get your tailored portfolio",
      desc: "Receive a live, custom-crafted portfolio that emphasizes your most relevant accomplishments, complete with a clean shareable URL.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      pillClass: "step-pill-coral"
    }
  ];

  return (
    <section className="landing-how" id="how-it-works">
      <div className="landing-container">
        <div className="how-header">
          <span className="landing-eyebrow eyebrow-teal">Simple & Intuitive</span>
          <h2>Three Steps, One Portfolio</h2>
          <p className="how-subtitle">
            Say goodbye to maintaining dozens of disconnected Word documents and custom websites.
            Here is how you go from details to a standout application.
          </p>
        </div>

        <div className="how-steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-top-row">
                <span className={`step-number ${step.pillClass}`}>{step.number}</span>
                <span className="step-badge">{step.badge}</span>
              </div>
              <div className="step-icon-wrapper">
                {step.icon}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
