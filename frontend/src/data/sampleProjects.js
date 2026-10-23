const sampleProjects = [
  {
    id: "proj-1",
    re_type: "project",
    role: "Lovely Portfolio",
    company: "AI Portfolio Maker",
    startDate: "2023-02",
    endDate: "2023-10",
    isCurrent: false,
    description:
      "An intelligent portfolio builder designed for creators, developers, and designers to showcase their career journey with clean modular layouts.",
    keyPoints:
      "• Engineered modular resume entity components mapping directly to PostgreSQL schemas.\n• Built responsive mobile-first navigation with sticky blur headers and touch drawer.\n• Integrated client-side preview for media attachments and drag-and-drop uploads.",
    skills: [
      { skill_id: 2, skill_name: "React" },
      { skill_id: 6, skill_name: "TypeScript" },
      { skill_id: 1, skill_name: "Node.js" },
      { skill_id: 4, skill_name: "PostgreSQL" },
      { skill_id: 7, skill_name: "CSS Modules" },
    ],
    links: [
      {
        id: "link-p1-1",
        title: "Live Demo",
        url: "https://lovelyportfolio.com",
        description: "Production web application",
      },
      {
        id: "link-p1-2",
        title: "GitHub Repository",
        url: "https://github.com/lovely-portfolios",
        description: "Source code and architecture documentation",
      },
    ],
    images: [
      {
        id: "img-p1-1",
        title: "Dashboard Overview",
        url: "/Images/image.png",
        description: "Interactive profile editor interface",
      },
      {
        id: "img-p1-2",
        title: "Analytics & Traffic View",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        description: "Real-time viewer engagement charts",
      },
      {
        id: "img-p1-3",
        title: "Theme Studio",
        url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        description: "Custom CSS theme generator and previewer",
      },
    ],
  },
  {
    id: "proj-2",
    re_type: "project",
    role: "CloudPulse",
    company: "Real-Time Infrastructure Monitor",
    startDate: "2023-11",
    endDate: "2024-03",
    isCurrent: false,
    description:
      "High-performance telemetry dashboard monitoring container metrics, latency spikes, and server vitals across distributed cloud clusters.",
    keyPoints:
      "• Streaming real-time telemetry over WebSockets with sub-50ms render latency.\n• Automated anomaly detection pipeline triggering Slack alerts for critical thresholds.\n• Reduced telemetry bundle size by 45% using Protobuf binary encoding.",
    skills: [
      { skill_id: 9, skill_name: "Docker" },
      { skill_id: 8, skill_name: "Git" },
      { skill_id: 4, skill_name: "PostgreSQL" },
      { skill_id: 1, skill_name: "Node.js" },
    ],
    links: [
      {
        id: "link-p2-1",
        title: "Project Repository",
        url: "https://github.com/cloudpulse",
        description: "Open source monitor service",
      },
      {
        id: "link-p2-2",
        title: "Grafana Integration",
        url: "https://grafana.com",
        description: "Custom plugin dashboard config",
      },
    ],
    images: [
      {
        id: "img-p2-1",
        title: "Server Clusters Vitals",
        url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
        description: "Multi-region cluster uptime and memory pressure",
      },
      {
        id: "img-p2-2",
        title: "Real-Time Packet Flow",
        url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80",
        description: "Inbound throughput and connection spikes",
      },
    ],
  },
  {
    id: "proj-3",
    re_type: "project",
    role: "DevScribe AI",
    company: "Code Documentation Assistant",
    startDate: "2024-01",
    endDate: "2024-06",
    isCurrent: false,
    description:
      "Autonomous CLI and editor extension that parses ASTs to generate developer documentation, OpenAPI contracts, and interactive endpoint mocks.",
    keyPoints:
      "• Built AST visitor pipeline analyzing TypeScript, Python, and Go source files.\n• Generated complete TypeDoc and Markdown documentation matching repository style.\n• Adopted by 2,500+ developers on VSCode marketplace with 4.9 rating.",
    skills: [
      { skill_id: 6, skill_name: "TypeScript" },
      { skill_id: 2, skill_name: "React" },
      { skill_id: 1, skill_name: "Node.js" },
      { skill_id: 8, skill_name: "Git" },
    ],
    links: [
      {
        id: "link-p3-1",
        title: "VSCode Extension",
        url: "https://marketplace.visualstudio.com",
        description: "Install DevScribe AI for Visual Studio Code",
      },
      {
        id: "link-p3-2",
        title: "Documentation Hub",
        url: "https://devscribe.ai/docs",
        description: "Getting started guide and CLI flags",
      },
    ],
    images: [
      {
        id: "img-p3-1",
        title: "Inline Doc Generator",
        url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
        description: "One-click JSDoc and Swagger block generation",
      },
      {
        id: "img-p3-2",
        title: "Editor Sidebar UI",
        url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
        description: "Tree view of documented symbols and methods",
      },
    ],
  },
  {
    id: "proj-4",
    re_type: "project",
    role: "Nexus Pay",
    company: "Decentralized Payments Gateway",
    startDate: "2023-06",
    endDate: "2023-12",
    isCurrent: false,
    description:
      "Low-friction developer SDK and checkout portal facilitating global micro-transactions with instant settlement and multi-currency exchange.",
    keyPoints:
      "• Processed $1.2M+ in cross-border volume with 99.98% gateway availability.\n• Implemented double-entry transaction ledger with cryptographic proof audits.\n• Designed zero-dependency embeddable checkout script under 18kB gzip.",
    skills: [
      { skill_id: 4, skill_name: "PostgreSQL" },
      { skill_id: 9, skill_name: "Docker" },
      { skill_id: 1, skill_name: "Node.js" },
      { skill_id: 6, skill_name: "TypeScript" },
    ],
    links: [
      {
        id: "link-p4-1",
        title: "Developer Portal",
        url: "https://nexuspay.dev",
        description: "Sandbox keys and API documentation",
      },
      {
        id: "link-p4-2",
        title: "SDK Repository",
        url: "https://github.com/nexus-sdk",
        description: "Client library for web and mobile",
      },
    ],
    images: [
      {
        id: "img-p4-1",
        title: "Checkout Widget",
        url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
        description: "Embeddable payment drawer with currency selector",
      },
      {
        id: "img-p4-2",
        title: "Merchant Dashboard",
        url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
        description: "Settlement schedules, dispute alerts, and analytics",
      },
      {
        id: "img-p4-3",
        title: "Security Ledger",
        url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
        description: "Cryptographic hash verification table",
      },
    ],
  },
  {
    id: "proj-5",
    re_type: "project",
    role: "Aura Studio",
    company: "Design System & Component Library",
    startDate: "2022-09",
    endDate: "2023-04",
    isCurrent: false,
    description:
      "Comprehensive design token pipeline and accessible React component library built with strict WCAG AA contrast compliance and dark mode.",
    keyPoints:
      "• 40+ accessible UI primitives built on headless accessible patterns.\n• Automated visual regression test suite across 4 responsive breakpoints.\n• Published to NPM with zero runtime CSS-in-JS overhead via vanilla CSS modules.",
    skills: [
      { skill_id: 2, skill_name: "React" },
      { skill_id: 7, skill_name: "CSS Modules" },
      { skill_id: 6, skill_name: "TypeScript" },
      { skill_id: 8, skill_name: "Git" },
    ],
    links: [
      {
        id: "link-p5-1",
        title: "Storybook Showcase",
        url: "https://aura-studio.storybook.io",
        description: "Interactive component documentation and playground",
      },
      {
        id: "link-p5-2",
        title: "NPM Package",
        url: "https://npmjs.com/package/@aura/ui",
        description: "Public package distribution",
      },
    ],
    images: [
      {
        id: "img-p5-1",
        title: "Design Tokens Palette",
        url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80",
        description: "Color tokens, typography scale, and elevation levels",
      },
      {
        id: "img-p5-2",
        title: "Interactive Components",
        url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        description: "Button variants, modals, and responsive drawers",
      },
    ],
  },
];

export default sampleProjects;
