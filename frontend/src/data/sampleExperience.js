const sampleExperience = [
  {
    id: "exp-1",
    re_type: "work_exp",
    role: "Senior Backend Developer",
    company: "Google",
    startDate: "2023-08",
    endDate: "",
    isCurrent: true,
    description:
      "• Solved high-throughput data processing bottlenecks using Node.js and PostgreSQL.\n• Led architecture migration to microservices, improving system reliability by 35%.\n• Built and deployed scalable REST and gRPC services across Kubernetes clusters.",
    skills: [
      { skill_id: 1, skill_name: "Node.js" },
      { skill_id: 4, skill_name: "PostgreSQL" },
      { skill_id: 8, skill_name: "Git" },
      { skill_id: 9, skill_name: "Docker" },
    ],
    links: [
      {
        id: "link-1",
        title: "Company",
        url: "https://google.com",
        description: "Google Official",
      },
      {
        id: "link-2",
        title: "Project Repo",
        url: "https://github.com",
        description: "Open source contributions",
      },
    ],
    images: [
      {
        id: "img-1",
        title: "Architecture Diagram",
        url: "/Images/image.png",
        description: "High-level microservice topology",
      },
    ],
  },
  {
    id: "exp-2",
    re_type: "work_exp",
    role: "Full Stack Engineer",
    company: "Microsoft",
    startDate: "2021-06",
    endDate: "2023-07",
    isCurrent: false,
    description:
      "• Developed responsive web applications using React and TypeScript for cloud management consoles.\n• Implemented real-time dashboard analytics reducing page load time by 40%.\n• Collaborated with design and product teams in an agile environment delivering bi-weekly releases.",
    skills: [
      { skill_id: 2, skill_name: "React" },
      { skill_id: 6, skill_name: "TypeScript" },
      { skill_id: 1, skill_name: "JavaScript" },
      { skill_id: 7, skill_name: "CSS Modules" },
    ],
    links: [
      {
        id: "link-3",
        title: "Company",
        url: "https://microsoft.com",
        description: "Microsoft Portal",
      },
    ],
    images: [],
  },
  {
    id: "exp-3",
    re_type: "work_exp",
    role: "Junior Software Developer",
    company: "Amazon",
    startDate: "2019-09",
    endDate: "2021-05",
    isCurrent: false,
    description:
      "• Built and maintained internal automation scripts and REST APIs using Python and Express.js.\n• Wrote unit and integration test suites increasing automated test coverage from 60% to 88%.\n• Optimized SQL database queries to handle large dataset imports with minimal latency.",
    skills: [
      { skill_id: 5, skill_name: "Python" },
      { skill_id: 13, skill_name: "Express.js" },
      { skill_id: 4, skill_name: "PostgreSQL" },
      { skill_id: 8, skill_name: "Git" },
    ],
    links: [
      {
        id: "link-4",
        title: "Platform",
        url: "https://amazon.com",
        description: "E-commerce platform",
      },
    ],
    images: [],
  },
];

export default sampleExperience;
