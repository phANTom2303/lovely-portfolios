const sampleAchievements = [
  {
    id: "ach-1",
    re_type: "achievements",
    role: "1st Place Winner — Global Cloud Hackathon",
    company: "AWS & Devpost",
    startDate: "2023-11",
    endDate: "",
    isCurrent: false,
    description:
      "Built an AI-assisted disaster response triage platform using real-time geospatial data, outperforming 450+ international developer teams.",
    keyPoints:
      "• Won Grand Prize of $15,000 and featured on the official AWS developer showcase.\n• Architected real-time WebSocket communication layer handling simulated 100k emergency pings.",
    skills: [
      { skill_id: 1, skill_name: "Node.js" },
      { skill_id: 9, skill_name: "Docker" },
      { skill_id: 2, skill_name: "React" },
    ],
    links: [
      {
        id: "ach-link-1",
        title: "Devpost Submission",
        url: "https://devpost.com/software/cloud-triage",
        description: "Hackathon project page and live demo",
      },
    ],
    images: [
      {
        id: "ach-img-1",
        title: "Hackathon Award Ceremony",
        url: "/Images/image.png",
        description: "First place stage announcement",
      },
      {
        id: "ach-img-2",
        title: "Team Demo Presentation",
        url: "/Images/image.png",
        description: "Live keynote stage presentation",
      },
    ],
  },
  {
    id: "ach-2",
    re_type: "achievements",
    role: "National Ideathon Winner — GreenTech",
    company: "Ministry of Innovation & Ecology",
    startDate: "2023-04",
    endDate: "",
    isCurrent: false,
    description:
      "Awarded top honors for an IoT sensor firmware tracking municipal water purification levels and predicting pipe maintenance needs.",
    keyPoints:
      "• Presented technical architecture to a panel of 8 industry judges and energy ministers.\n• Fast-tracked into the National CleanTech incubation accelerator.",
    skills: [
      { skill_id: 4, skill_name: "PostgreSQL" },
      { skill_id: 6, skill_name: "TypeScript" },
    ],
    links: [],
    images: [
      {
        id: "ach-img-3",
        title: "Ideathon Trophy",
        url: "/Images/image.png",
        description: "Ministry of Innovation medal presentation",
      },
    ],
  },
  {
    id: "ach-3",
    re_type: "achievements",
    role: "Published Research Paper in IEEE",
    company: "IEEE Xplore Digital Library",
    startDate: "2022-09",
    endDate: "",
    isCurrent: false,
    description:
      "Co-authored 'Low-Latency Distributed Consensus in Constrained IoT Topologies' published in IEEE International Conference Proceedings.",
    keyPoints:
      "• Formulated benchmark algorithms showing 28% reduction in network overhead.\n• Cited by 14 subsequent academic papers in distributed systems.",
    skills: [
      { skill_id: 8, skill_name: "Git" },
      { skill_id: 1, skill_name: "Node.js" },
    ],
    links: [
      {
        id: "ach-link-3",
        title: "IEEE Publication",
        url: "https://ieeexplore.ieee.org",
        description: "Official peer-reviewed paper",
      },
    ],
    images: [
      {
        id: "ach-img-4",
        title: "Conference Proceedings Cover",
        url: "/Images/image.png",
        description: "Official IEEE publication entry",
      },
    ],
  },
  {
    id: "ach-4",
    re_type: "achievements",
    role: "Dean's Academic Excellence Honor",
    company: "Faculty of Engineering & Computer Science",
    startDate: "2023-06",
    endDate: "",
    isCurrent: false,
    description:
      "Recognized in the top 1% academic percentile for distinction in Data Structures, Distributed Algorithms, and Operating Systems.",
    keyPoints:
      "• Maintained 3.96 GPA across all core computer science coursework.",
    skills: [],
    links: [],
    images: [
      {
        id: "ach-img-5",
        title: "Honor Certificate",
        url: "/Images/image.png",
        description: "Dean's list convocation certificate",
      },
    ],
  },
  {
    id: "ach-5",
    re_type: "achievements",
    role: "Open Source Contributor of the Month",
    company: "Apache Software Foundation",
    startDate: "2024-02",
    endDate: "",
    isCurrent: false,
    description:
      "Honored for core contributions to high-throughput message streaming exporters, resolving 8 long-standing memory leak issues.",
    keyPoints:
      "• Authored 12 merged pull requests with comprehensive unit test coverage.\n• Actively reviewed community PRs and mentored first-time contributors.",
    skills: [
      { skill_id: 9, skill_name: "Docker" },
      { skill_id: 8, skill_name: "Git" },
      { skill_id: 1, skill_name: "Node.js" },
    ],
    links: [
      {
        id: "ach-link-5",
        title: "Apache Contributor Spotlight",
        url: "https://apache.org",
        description: "Community recognition newsletter",
      },
    ],
    images: [
      {
        id: "ach-img-6",
        title: "Apache Spotlight Banner",
        url: "/Images/image.png",
        description: "Contributor of the month feature banner",
      },
    ],
  },
];

export default sampleAchievements;
