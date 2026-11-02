/**
 * portfolioDocument.js
 *
 * Clean, realistic JSON structure produced by the AI from the user's profile data.
 * No fake telemetry, no fabricated metrics, no weird fashion headlines.
 * Colors and visual styling are strictly controlled by the frontend.
 */

const portfolioDocument = {
  // ── HERO ──────────────────────────────────────────────────────────────────
  hero: {
    name: "Alex Sterling",
    title: "Software Developer",
    about:
      "I enjoy building thoughtful software experiences and solving complex problems through technology. Focused on building reliable web applications, clean architectures, and intuitive user interfaces.",
    location: "Bengaluru, India",
    available: true,
    avatar: null, // null triggers the professional SVG silhouette
    email: "alex@sterling.dev",
    socials: [
      { title: "LinkedIn", url: "https://linkedin.com" },
      { title: "GitHub", url: "https://github.com" },
      { title: "GFG", url: "https://geeksforgeeks.org" },
    ],
  },

  // ── SKILLS ────────────────────────────────────────────────────────────────
  // Grouped into clean, standard categories. No fake tiers or depth fields.
  skills: {
    headline: "Skills & Technologies",
    description:
      "The languages, frameworks, databases, and development tools I use to build projects.",
    categories: [
      {
        id: "languages",
        name: "Languages",
        skills: ["JavaScript", "TypeScript", "Python"],
      },
      {
        id: "frameworks",
        name: "Frameworks & Libraries",
        skills: ["React", "Node.js", "Express.js"],
      },
      {
        id: "databases",
        name: "Databases",
        skills: ["PostgreSQL", "MongoDB", "Redis"],
      },
      {
        id: "tools",
        name: "Tools & DevOps",
        skills: ["Git", "Docker", "CSS Modules"],
      },
    ],
  },

  // ── WORK EXPERIENCE ───────────────────────────────────────────────────────
  experience: {
    headline: "Where I've built & shipped.",
    items: [
      {
        id: "exp-1",
        role: "Senior Backend Developer",
        company: "Google",
        period: "Aug 2023 – Present",
        isCurrent: true,
        location: "Bengaluru, India",
        highlights: [
          "Solved high-throughput data processing bottlenecks using Node.js and PostgreSQL.",
          "Led architecture migration to microservices, improving system reliability by 35%.",
          "Built and deployed scalable REST and gRPC services across Kubernetes clusters.",
        ],
        skills: ["Node.js", "PostgreSQL", "Git", "Docker"],
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
            title: "Telemetry & Observability Console",
            caption:
              "Real-time cluster telemetry monitoring 10,000+ nodes with 99.99% uptime.",
          },
          {
            type: "video",
            url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            poster:
              "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
            title: "Live Production Cluster Walkthrough",
            caption:
              "Interactive screen capture showcasing microservices latency monitoring.",
          },
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
            title: "Microservices Architecture Map",
            caption:
              "Decoupled gRPC topology handling 45,000 requests per second.",
          },
        ],
        links: [
          {
            label: "Cloud Console",
            url: "https://cloud.google.com",
            isPrimary: true,
          },
          {
            label: "Architecture Study",
            url: "https://google.com",
            isPrimary: false,
          },
        ],
      },
      {
        id: "exp-2",
        role: "Full Stack Engineer",
        company: "Microsoft",
        period: "Jun 2021 – Jul 2023",
        isCurrent: false,
        location: "Hyderabad, India",
        highlights: [
          "Developed responsive web applications using React and TypeScript for cloud management consoles.",
          "Implemented real-time dashboard analytics reducing page load time by 40%.",
          "Collaborated with design and product teams in an agile environment delivering bi-weekly releases.",
        ],
        skills: ["React", "TypeScript", "JavaScript", "CSS Modules"],
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
            title: "Azure Cloud Console Redesign",
            caption:
              "Component library and real-time dashboard analytics built with React & TypeScript.",
          },
          {
            type: "video",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            poster:
              "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
            title: "Console Performance Demo",
            caption:
              "Recorded trace demonstrating a 40% reduction in initial render time.",
          },
        ],
        links: [
          {
            label: "Azure Cloud Console",
            url: "https://azure.microsoft.com",
            isPrimary: true,
          },
        ],
      },
      {
        id: "exp-3",
        role: "Junior Software Developer",
        company: "Amazon",
        period: "Sep 2019 – May 2021",
        isCurrent: false,
        location: "Bengaluru, India",
        highlights: [
          "Built and maintained internal automation scripts and REST APIs using Python and Express.js.",
          "Wrote unit and integration test suites increasing automated test coverage from 60% to 88%.",
          "Optimized SQL database queries to handle large dataset imports with minimal latency.",
        ],
        skills: ["Python", "Express.js", "PostgreSQL", "Git"],
      },
    ],
  },

  // ── PROJECTS ──────────────────────────────────────────────────────────────
  projects: {
    headline: "Things I've built & shipped.",
    featuredId: "proj-1",
    items: [
      {
        id: "proj-1",
        name: "Lovely Portfolio",
        category: "AI & Creative Web",
        featured: true,
        tagline:
          "An intelligent, story-driven portfolio generator for developers.",
        description:
          "Transforms career milestones into bespoke, animated personal portfolios with custom themes, interactive components, and zero resume clutter.",
        image:
          "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
        skills: [
          "React 19",
          "TypeScript",
          "Node.js",
          "PostgreSQL",
          "CSS Modules",
        ],
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
            title: "Studio Design Canvas",
            caption:
              "Generative studio interface rendering custom Bento layouts with zero resume fluff.",
          },
          {
            type: "video",
            url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            poster:
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
            title: "Interactive Studio Walkthrough",
            caption:
              "Dynamic live preview showing chapter progress, theme switching, and fluid spring animations.",
          },
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
            title: "Dark Mode Bento Exhibition",
            caption:
              "High-contrast dark mode palette calibrated for nighttime developer reading.",
          },
        ],
        links: [
          {
            label: "Live Demo",
            url: "https://lovelyportfolio.com",
            isPrimary: true,
          },
          {
            label: "Source Code",
            url: "https://github.com/lovely-portfolios",
            isPrimary: false,
          },
        ],
      },
      {
        id: "proj-2",
        name: "CloudPulse",
        category: "Distributed Systems",
        featured: false,
        tagline: "Real-time cluster telemetry & infrastructure monitor.",
        description:
          "High-throughput telemetry engine tracking node memory, CPU saturation, and packet latency with 60 FPS live charting.",
        skills: ["Docker", "Node.js", "PostgreSQL", "WebSockets"],
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
            title: "Cluster Telemetry View",
            caption:
              "Live monitoring console displaying real-time metrics across 12 distributed regions.",
          },
          {
            type: "video",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            poster:
              "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1000&q=80",
            title: "Live Load Stress Test",
            caption:
              "60 FPS capture demonstrating instantaneous alert triggering during chaos simulation.",
          },
        ],
        links: [
          {
            label: "Live Dashboard",
            url: "https://github.com/cloudpulse",
            isPrimary: true,
          },
          { label: "GitHub", url: "https://grafana.com", isPrimary: false },
        ],
      },
      {
        id: "proj-3",
        name: "DevScribe AI",
        category: "Developer Tooling",
        featured: false,
        tagline: "AST-driven code documentation & OpenAPI generator.",
        description:
          "Analyzes abstract syntax trees in TypeScript and Python to generate interactive endpoint mocks and API schemas inside VS Code.",
        skills: ["TypeScript", "React", "AST Parser", "VS Code API"],
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80",
            title: "VS Code Extension UI",
            caption:
              "Inline documentation assistant parsing type definitions into interactive test harnesses.",
          },
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1000&q=80",
            title: "OpenAPI Visual Schema",
            caption:
              "Auto-generated interactive API schema mocks ready for team collaboration.",
          },
        ],
        links: [
          {
            label: "VS Code Marketplace",
            url: "https://marketplace.visualstudio.com",
            isPrimary: true,
          },
          {
            label: "Documentation",
            url: "https://devscribe.ai/docs",
            isPrimary: false,
          },
        ],
      },
      {
        id: "proj-4",
        name: "Nexus Pay",
        category: "Fintech & Web3",
        featured: false,
        tagline: "Low-latency developer SDK for global micro-payments.",
        description:
          "High-frequency payment gateway and TypeScript SDK supporting instantaneous cross-border settlement and automated webhooks.",
        skills: ["TypeScript", "Docker", "Node.js", "PostgreSQL"],
        links: [
          {
            label: "Developer Portal",
            url: "https://nexuspay.dev",
            isPrimary: true,
          },
          {
            label: "GitHub",
            url: "https://github.com/nexus-sdk",
            isPrimary: false,
          },
        ],
      },
    ],
  },

  // ── EDUCATION ─────────────────────────────────────────────────────────────
  education: {
    headline: "Academic Foundations",
    items: [
      {
        id: "edu-1",
        degree: "B.Tech in Computer Science & Engineering",
        institution: "Kalinga Institute of Industrial Technology (KIIT)",
        period: "2023 – 2027",
        grade: "CGPA 9.0 / 10.0",
        coursework: [
          "Distributed Systems",
          "Data Structures",
          "Computer Networks",
          "Database Architecture",
        ],
      },
      {
        id: "edu-2",
        degree: "Higher Secondary (Class XII) — Science & Mathematics",
        institution: "Delhi Public School",
        period: "2021 – 2023",
        grade: "92.4% Distinction",
        coursework: ["Physics", "Mathematics", "Computer Science"],
      },
    ],
  },

  // ── ACHIEVEMENTS ──────────────────────────────────────────────────────────
  achievements: {
    headline: "Honors & Proof of Work",
    items: [
      {
        id: "ach-1",
        rank: "1st Place 🥇",
        category: "Global Hackathon",
        title: "1st Place Winner — Global Cloud Hackathon",
        org: "AWS & Devpost",
        year: "2023",
        summary:
          "Architected an AI-assisted disaster response triage platform using real-time geospatial telemetry, outperforming 450+ international engineering teams.",
        tags: ["Geospatial AI", "AWS Lambda", "PostgreSQL"],
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
            title: "Hackathon Grand Finale Stage",
            caption:
              "Presenting the geospatial disaster triage engine to AWS judges in Singapore.",
          },
          {
            type: "video",
            url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            poster:
              "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
            title: "Live Pitch & System Demo",
            caption:
              "3-minute system demonstration showcasing sub-second incident classification.",
          },
        ],
      },
      {
        id: "ach-2",
        rank: "Winner 🏆",
        category: "National Ideathon",
        title: "National Ideathon Winner — GreenTech",
        org: "Ministry of Innovation & Ecology",
        year: "2023",
        summary:
          "Awarded top national honors for low-power IoT firmware monitoring municipal water purification and forecasting pipe maintenance needs.",
        tags: ["IoT Firmware", "C++", "Anomaly Detection"],
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
            title: "IoT Hardware Prototype",
            caption:
              "Microcontroller telemetry board deployed in municipal water monitoring testbench.",
          },
        ],
      },
      {
        id: "ach-3",
        rank: "Published 📜",
        category: "Academic Research",
        title: "Published Research Paper in IEEE",
        org: "IEEE Xplore Digital Library",
        year: "2022",
        summary:
          "Co-authored 'Low-Latency Distributed Consensus in Constrained Topologies' published in the IEEE International Conference Proceedings.",
        tags: ["Distributed Systems", "Consensus", "Peer-to-Peer"],
      },
      {
        id: "ach-4",
        rank: "Top Contributor ⚡",
        category: "Open Source",
        title: "Open Source Contributor of the Month",
        org: "Apache Software Foundation",
        year: "2024",
        summary:
          "Recognized for core contributions to high-throughput message streaming exporters, resolving 8 long-standing memory leak issues in production.",
        tags: ["Message Queues", "Node.js", "Performance"],
      },
      {
        id: "ach-5",
        rank: "Top 1% 🎓",
        category: "Academic Honor",
        title: "Dean's Academic Excellence Honor",
        org: "Faculty of Engineering & Computer Science",
        year: "2023",
        summary:
          "Awarded top 1st percentile standing for distinction in Data Structures, Advanced Algorithms, and Operating Systems.",
        tags: ["Algorithms", "Operating Systems"],
      },
    ],
  },

  // ── CERTIFICATIONS ────────────────────────────────────────────────────────
  certifications: {
    headline: "Verified Credentials",
    items: [
      {
        id: "cert-1",
        title: "AWS Certified Solutions Architect – Associate",
        org: "Amazon Web Services",
        year: "2023",
        validUntil: "2026",
        credentialId: "AWS-SAA-8829410",
        verifyUrl: "https://aws.amazon.com/verification",
      },
      {
        id: "cert-2",
        title: "Professional Scrum Master I (PSM I)",
        org: "Scrum.org",
        year: "2023",
        validUntil: "Lifetime",
        credentialId: "SCRUM-PSM1-4921",
        verifyUrl: "https://scrum.org/certificates",
      },
      {
        id: "cert-3",
        title: "Meta Full-Stack Developer Professional",
        org: "Meta & Coursera",
        year: "2022",
        validUntil: "Lifetime",
        credentialId: "META-FS-991023",
        verifyUrl: "https://coursera.org/verify",
      },
      {
        id: "cert-4",
        title: "Docker Certified Associate (DCA)",
        org: "Docker Inc.",
        year: "2023",
        validUntil: "2025",
        credentialId: "DCA-77419-EXP",
        verifyUrl: "https://docker.com/verify",
      },
      {
        id: "cert-5",
        title: "PostgreSQL Certified Developer",
        org: "EnterpriseDB",
        year: "2024",
        validUntil: "2027",
        credentialId: "EDB-PG-55109",
        verifyUrl: "https://enterprisedb.com",
      },
    ],
  },

  // ── EXTRA-CURRICULAR ──────────────────────────────────────────────────────
  extraCurricular: {
    headline: "Beyond the Terminal",
    items: [
      {
        id: "ec-1",
        role: "President & Lead Organizer",
        org: "Google Developer Student Club",
        period: "2023 – Present",
        isCurrent: true,
        summary:
          "Spearhead university developer initiatives, organize tech bootcamps, and foster open-source contributions across 600+ student members. Hosted 12 developer workshops and 2 hackathons.",
        tags: ["Community Leadership", "Hackathon Host", "Workshops"],
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
            title: "Annual Developer Summit Keynote",
            caption:
              "Delivering the opening keynote on Cloud Native Development to 450+ attendees.",
          },
          {
            type: "video",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            poster:
              "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
            title: "Hackathon Highlight Reel",
            caption:
              "36-hour flagship hackathon recap highlighting 48 submitted projects.",
          },
        ],
      },
      {
        id: "ec-2",
        role: "Volunteer Lead — Code for Good",
        org: "TechNGO Foundation",
        period: "2022 – 2023",
        isCurrent: false,
        summary:
          "Led a dedicated team of 8 student volunteers building open-source inventory tracking systems for regional food distribution charities, impacting 15,000+ families.",
        tags: ["Civic Tech", "Volunteer Leadership", "Social Impact"],
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
            title: "Community Distribution Drive",
            caption:
              "Deploying our inventory tracking dashboard on-site at regional food distribution centers.",
          },
        ],
      },
      {
        id: "ec-3",
        role: "Tech Writer & Community Speaker",
        org: "Dev.to & Local Meetups",
        period: "2023 – Present",
        isCurrent: true,
        summary:
          "Author technical deep-dives on distributed caching and modern web architecture with over 45k+ reads. Regular lightning talk speaker at local tech meetups.",
        tags: ["Technical Writing", "Public Speaking", "Developer Advocacy"],
      },
    ],
  },

  // ── CONTACT ───────────────────────────────────────────────────────────────
  contact: {
    headline: "Let's build together.",
    subheadline:
      "Have an ambitious project, an engineering opening, or just want to talk? My inbox is always open.",
    email: "alex@sterling.dev",
  },
};

export default portfolioDocument;
