/**
 * portfolioDocument.js
 *
 * Clean, realistic JSON structure produced by the AI from the user's profile data.
 * Free of redundant synthetic IDs, duplicate categories, or hardcoded UI text.
 * Matches DB schema conventions directly, preserving only intentional presentation
 * mappings (title/subtitle per section, grade, and skill categories).
 */

const portfolioDocument = {
  // ── SECTION ORDER ──────────────────────────────────────────────────────────
  // Defines the display sequence of sections on the portfolio page and floating dock.
  sectionOrder: [
    "about",
    "skills",
    "experience",
    "projects",
    "achievements",
    "certifications",
    "education",
    "extraCurricular",
    "contact",
  ],

  // ── ABOUT (matches users table + profile links) ───────────────────────────
  about: {
    name: "Alex Sterling",
    title: "Software Developer",
    about:
      "I enjoy building thoughtful software experiences and solving complex problems through technology. Focused on building reliable web applications, clean architectures, and intuitive user interfaces.",
    current_location: "Bengaluru, India",
    profile_photo_link: "/Images/image.png",
    email: "alex@sterling.dev",
    socials: [
      { title: "LinkedIn", link: "https://linkedin.com" },
      { title: "GitHub", link: "https://github.com" },
      { title: "GFG", link: "https://geeksforgeeks.org" },
    ],
  },

  // ── SKILLS (profile-level skills grouped into categories) ──────────────────
  skills: {
    categories: [
      {
        name: "Languages",
        skills: ["JavaScript", "TypeScript", "Python"],
      },
      {
        name: "Frameworks & Libraries",
        skills: ["React", "Node.js", "Express.js"],
      },
      {
        name: "Databases",
        skills: ["PostgreSQL", "MongoDB", "Redis"],
      },
      {
        name: "Tools & DevOps",
        skills: ["Git", "Docker", "CSS Modules"],
      },
    ],
  },

  // ── WORK EXPERIENCE (re_type: 'work_exp') ─────────────────────────────────
  experience: {
    items: [
      {
        role: "Senior Backend Developer",
        company: "Google",
        from_date: "2023-08-01",
        to_date: null,
        description:
          "Solved high-throughput data processing bottlenecks using Node.js and PostgreSQL. Led architecture migration to microservices, improving system reliability by 35%. Built and deployed scalable REST and gRPC services across Kubernetes clusters.",
        skills: ["Node.js", "PostgreSQL", "Git", "Docker"],
        assets: [
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
            title: "Telemetry & Observability Console",
            description:
              "Real-time cluster telemetry monitoring 10,000+ nodes with 99.99% uptime.",
          },
          {
            asset_type: "youtube",
            link: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            title: "Live Production Cluster Walkthrough",
            description:
              "Interactive screen capture showcasing microservices latency monitoring.",
          },
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
            title: "Microservices Architecture Map",
            description:
              "Decoupled gRPC topology handling 45,000 requests per second.",
          },
        ],
        links: [
          {
            title: "Cloud Console",
            link: "https://cloud.google.com",
          },
          {
            title: "Architecture Study",
            link: "https://google.com",
          },
        ],
      },
      {
        role: "Full Stack Engineer",
        company: "Microsoft",
        from_date: "2021-06-01",
        to_date: "2023-07-31",
        description:
          "Developed responsive web applications using React and TypeScript for cloud management consoles. Implemented real-time dashboard analytics reducing page load time by 40%. Collaborated with design and product teams in an agile environment delivering bi-weekly releases.",
        skills: ["React", "TypeScript", "JavaScript", "CSS Modules"],
        assets: [
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
            title: "Azure Cloud Console Redesign",
            description:
              "Component library and real-time dashboard analytics built with React & TypeScript.",
          },
          {
            asset_type: "youtube",
            link: "https://www.w3schools.com/html/mov_bbb.mp4",
            title: "Console Performance Demo",
            description:
              "Recorded trace demonstrating a 40% reduction in initial render time.",
          },
        ],
        links: [
          {
            title: "Azure Cloud Console",
            link: "https://azure.microsoft.com",
          },
        ],
      },
      {
        role: "Junior Software Developer",
        company: "Amazon",
        from_date: "2019-09-01",
        to_date: "2021-05-31",
        description:
          "Built and maintained internal automation scripts and REST APIs using Python and Express.js. Wrote unit and integration test suites increasing automated test coverage from 60% to 88%. Optimized SQL database queries to handle large dataset imports with minimal latency.",
        skills: ["Python", "Express.js", "PostgreSQL", "Git"],
        links: [
          {
            title: "AWS Internal Developer Portal",
            link: "https://aws.amazon.com",
          },
        ],
      },
    ],
  },

  // ── PROJECTS (re_type: 'project') ─────────────────────────────────────────
  // The first project is always the featured/flagship showcase.
  projects: {
    items: [
      {
        name: "Lovely Portfolio",
        subtitle: "AI & Creative Web",
        from_date: "2024-01-01",
        to_date: null,
        description:
          "An intelligent, story-driven portfolio generator for developers. Transforms career milestones into bespoke, animated personal portfolios with custom themes, interactive components, and zero resume clutter.",
        skills: [
          "React 19",
          "TypeScript",
          "Node.js",
          "PostgreSQL",
          "CSS Modules",
        ],
        assets: [
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
            title: "Studio Design Canvas",
            description:
              "Generative studio interface rendering custom Bento layouts with zero resume fluff.",
          },
          {
            asset_type: "youtube",
            link: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            title: "Interactive Studio Walkthrough",
            description:
              "Dynamic live preview showing chapter progress, theme switching, and fluid spring animations.",
          },
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
            title: "Dark Mode Bento Exhibition",
            description:
              "High-contrast dark mode palette calibrated for nighttime developer reading.",
          },
        ],
        links: [
          {
            title: "Live Demo",
            link: "https://lovelyportfolio.com",
          },
          {
            title: "Source Code",
            link: "https://github.com/lovely-portfolios",
          },
        ],
      },
      {
        name: "CloudPulse",
        subtitle: "Distributed Systems",
        from_date: "2023-05-01",
        to_date: "2023-12-01",
        description:
          "Real-time cluster telemetry & infrastructure monitor. High-throughput telemetry engine tracking node memory, CPU saturation, and packet latency with 60 FPS live charting.",
        skills: ["Docker", "Node.js", "PostgreSQL", "WebSockets"],
        assets: [
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
            title: "Cluster Telemetry View",
            description:
              "Live monitoring console displaying real-time metrics across 12 distributed regions.",
          },
          {
            asset_type: "youtube",
            link: "https://www.w3schools.com/html/mov_bbb.mp4",
            title: "Live Load Stress Test",
            description:
              "60 FPS capture demonstrating instantaneous alert triggering during chaos simulation.",
          },
        ],
        links: [
          {
            title: "Live Dashboard",
            link: "https://github.com/cloudpulse",
          },
          { title: "GitHub", link: "https://grafana.com" },
        ],
      },
      {
        name: "DevScribe AI",
        subtitle: "Developer Tooling",
        from_date: "2023-01-01",
        to_date: "2023-06-01",
        description:
          "AST-driven code documentation & OpenAPI generator. Analyzes abstract syntax trees in TypeScript and Python to generate interactive endpoint mocks and API schemas inside VS Code.",
        skills: ["TypeScript", "React", "AST Parser", "VS Code API"],
        assets: [
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80",
            title: "VS Code Extension UI",
            description:
              "Inline documentation assistant parsing type definitions into interactive test harnesses.",
          },
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1000&q=80",
            title: "OpenAPI Visual Schema",
            description:
              "Auto-generated interactive API schema mocks ready for team collaboration.",
          },
        ],
        links: [
          {
            title: "VS Code Marketplace",
            link: "https://marketplace.visualstudio.com",
          },
          {
            title: "Documentation",
            link: "https://devscribe.ai/docs",
          },
        ],
      },
      {
        name: "Nexus Pay",
        from_date: "2022-08-01",
        to_date: "2023-02-01",
        description:
          "Low-latency developer SDK for global micro-payments. High-frequency payment gateway and TypeScript SDK supporting instantaneous cross-border settlement and automated webhooks.",
        skills: ["TypeScript", "Docker", "Node.js", "PostgreSQL"],
        links: [
          {
            title: "Developer Portal",
            link: "https://nexuspay.dev",
          },
          {
            title: "GitHub",
            link: "https://github.com/nexus-sdk",
          },
        ],
      },
    ],
  },

  // ── EDUCATION (matches education table) ───────────────────────────────────
  education: {
    items: [
      {
        degree: "B.Tech",
        stream: "Computer Science & Engineering",
        institute_name: "Kalinga Institute of Industrial Technology (KIIT)",
        from_date: "2023-08-01",
        to_date: "2027-05-01",
        grade: "CGPA 9.0 / 10.0",
      },
      {
        degree: "Higher Secondary (Class XII)",
        stream: "Science & Mathematics",
        institute_name: "Delhi Public School",
        from_date: "2021-06-01",
        to_date: "2023-05-01",
        grade: "92.4% Distinction",
      },
    ],
  },

  // ── ACHIEVEMENTS (re_type: 'achievements') ─────────────────────────────────
  achievements: {
    items: [
      {
        title: "1st Place Winner — Global Cloud Hackathon",
        org: "AWS & Devpost",
        from_date: "2023-10-15",
        to_date: null,
        description:
          "Architected an AI-assisted disaster response triage platform using real-time geospatial telemetry, outperforming 450+ international engineering teams.",
        skills: ["Geospatial AI", "AWS Lambda", "PostgreSQL"],
        assets: [
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
            title: "Hackathon Grand Finale Stage",
            description:
              "Presenting the geospatial disaster triage engine to AWS judges in Singapore.",
          },
          {
            asset_type: "youtube",
            link: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            title: "Live Pitch & System Demo",
            description:
              "3-minute system demonstration showcasing sub-second incident classification.",
          },
        ],
        links: [
          {
            title: "Hackathon Submission",
            link: "https://devpost.com/software/cloud-triage",
          },
          {
            title: "Award Announcement",
            link: "https://aws.amazon.com/blogs/startups",
          },
        ],
      },
      {
        title: "National Ideathon Winner — GreenTech",
        org: "Ministry of Innovation & Ecology",
        from_date: "2023-06-20",
        to_date: null,
        description:
          "Awarded top national honors for low-power IoT firmware monitoring municipal water purification and forecasting pipe maintenance needs.",
        skills: ["IoT Firmware", "C++", "Anomaly Detection"],
        assets: [
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
            title: "IoT Hardware Prototype",
            description:
              "Microcontroller telemetry board deployed in municipal water monitoring testbench.",
          },
        ],
        links: [
          {
            title: "Project Showcase",
            link: "https://greentech-innovation.gov.in",
          },
        ],
      },
      {
        title: "Published Research Paper in IEEE",
        org: "IEEE Xplore Digital Library",
        from_date: "2022-12-05",
        to_date: null,
        description:
          "Co-authored 'Low-Latency Distributed Consensus in Constrained Topologies' published in the IEEE International Conference Proceedings.",
        skills: ["Distributed Systems", "Consensus", "Peer-to-Peer"],
        links: [
          {
            title: "IEEE Publication",
            link: "https://ieeexplore.ieee.org/document/9876543",
          },
        ],
      },
      {
        title: "Open Source Contributor of the Month",
        org: "Apache Software Foundation",
        from_date: "2024-03-01",
        to_date: null,
        description:
          "Recognized for core contributions to high-throughput message streaming exporters, resolving 8 long-standing memory leak issues in production.",
        skills: ["Message Queues", "Node.js", "Performance"],
        links: [
          {
            title: "GitHub Contribution",
            link: "https://github.com/apache",
          },
        ],
      },
      {
        title: "Dean's Academic Excellence Honor",
        org: "Faculty of Engineering & Computer Science",
        from_date: "2023-05-25",
        to_date: null,
        description:
          "Awarded top 1st percentile standing for distinction in Data Structures, Advanced Algorithms, and Operating Systems.",
        skills: ["Algorithms", "Operating Systems"],
        links: [
          {
            title: "Honor Roll List",
            link: "https://university.edu/dean-list-2023",
          },
        ],
      },
    ],
  },

  // ── CERTIFICATIONS (re_type: 'certification') ─────────────────────────────
  certifications: {
    items: [
      {
        title: "AWS Certified Solutions Architect – Associate",
        org: "Amazon Web Services",
        from_date: "2023-04-15",
        to_date: "2026-04-15",
        description:
          "Validates technical skills and cloud expertise to design and deploy scalable, highly available systems on AWS.",
        links: [
          {
            title: "Verify Credential",
            link: "https://aws.amazon.com/verification",
          },
        ],
        assets: [
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
            title: "AWS Validation Badge",
            description:
              "Official AWS Solutions Architect accreditation badge.",
          },
        ],
      },
      {
        title: "Professional Scrum Master I (PSM I)",
        org: "Scrum.org",
        from_date: "2023-09-10",
        to_date: null,
        description:
          "Demonstrates fundamental knowledge of Scrum framework and ability to apply it in agile teams.",
        links: [
          {
            title: "Verify Credential",
            link: "https://scrum.org/certificates",
          },
        ],
      },
      {
        title: "Meta Full-Stack Developer Professional",
        org: "Meta & Coursera",
        from_date: "2022-11-20",
        to_date: null,
        description:
          "Comprehensive professional program covering React, Django, database architecture, and full-stack deployment.",
        links: [
          {
            title: "Verify Credential",
            link: "https://coursera.org/verify",
          },
        ],
      },
      {
        title: "Docker Certified Associate (DCA)",
        org: "Docker Inc.",
        from_date: "2023-02-18",
        to_date: "2025-02-18",
        description:
          "Certifies skills in container orchestration, Docker Swarm, enterprise cluster configuration, and security.",
        links: [
          {
            title: "Verify Credential",
            link: "https://docker.com/verify",
          },
        ],
      },
      {
        title: "PostgreSQL Certified Developer",
        org: "EnterpriseDB",
        from_date: "2024-01-12",
        to_date: "2027-01-12",
        description:
          "Validates advanced SQL query tuning, indexing architectures, performance optimization, and PostgreSQL administration.",
        links: [
          {
            title: "Verify Credential",
            link: "https://enterprisedb.com",
          },
        ],
      },
    ],
  },

  // ── EXTRA-CURRICULAR (re_type: 'extra_curricular') ─────────────────────────
  extraCurricular: {
    items: [
      {
        role: "President & Lead Organizer",
        org: "Google Developer Student Club",
        from_date: "2023-08-01",
        to_date: null,
        description:
          "Spearhead university developer initiatives, organize tech bootcamps, and foster open-source contributions across 600+ student members. Hosted 12 developer workshops and 2 hackathons.",
        skills: ["Community Leadership", "Hackathon Host", "Workshops"],
        assets: [
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
            title: "Annual Developer Summit Keynote",
            description:
              "Delivering the opening keynote on Cloud Native Development to 450+ attendees.",
          },
          {
            asset_type: "youtube",
            link: "https://www.w3schools.com/html/mov_bbb.mp4",
            title: "Hackathon Highlight Reel",
            description:
              "36-hour flagship hackathon recap highlighting 48 submitted projects.",
          },
        ],
        links: [
          {
            title: "GDSC Chapter Page",
            link: "https://gdsc.community.dev",
          },
        ],
      },
      {
        role: "Volunteer Lead — Code for Good",
        org: "TechNGO Foundation",
        from_date: "2022-07-01",
        to_date: "2023-06-01",
        description:
          "Led a dedicated team of 8 student volunteers building open-source inventory tracking systems for regional food distribution charities, impacting 15,000+ families.",
        skills: ["Civic Tech", "Volunteer Leadership", "Social Impact"],
        assets: [
          {
            asset_type: "image",
            link: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
            title: "Community Distribution Drive",
            description:
              "Deploying our inventory tracking dashboard on-site at regional food distribution centers.",
          },
        ],
        links: [
          {
            title: "Community Outreach Report",
            link: "https://techngofoundation.org",
          },
        ],
      },
      {
        role: "Tech Writer & Community Speaker",
        org: "Dev.to & Local Meetups",
        from_date: "2023-03-01",
        to_date: null,
        description:
          "Author technical deep-dives on distributed caching and modern web architecture with over 45k+ reads. Regular lightning talk speaker at local tech meetups.",
        skills: ["Technical Writing", "Public Speaking", "Developer Advocacy"],
        links: [
          {
            title: "Dev.to Articles",
            link: "https://dev.to",
          },
        ],
      },
    ],
  },

  // ── CONTACT ───────────────────────────────────────────────────────────────
  contact: {
    email: "alex@sterling.dev",
  },
};

export default portfolioDocument;
