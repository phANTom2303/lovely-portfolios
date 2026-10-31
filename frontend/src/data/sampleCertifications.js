const sampleCertifications = [
  {
    id: "cert-1",
    re_type: "certification",
    role: "AWS Certified Solutions Architect – Associate",
    company: "Amazon Web Services",
    startDate: "2023-10",
    endDate: "2026-10",
    isCurrent: false,
    description:
      "Validates expertise in designing resilient, high-performing, and cost-optimized cloud architectures on AWS.\n\n• Validation of VPC peering, IAM security boundaries, S3 lifecycle rules, and ECS container orchestration.",
    skills: [
      { skill_id: 9, skill_name: "Docker" },
      { skill_id: 4, skill_name: "PostgreSQL" },
      { skill_id: 1, skill_name: "Node.js" },
    ],
    links: [
      {
        id: "cert-link-1",
        title: "Verify Credential",
        url: "https://aws.amazon.com/verification",
        description: "Credential ID: AWS-78492019",
      },
    ],
    images: [
      {
        id: "cert-img-1",
        title: "AWS Badge",
        url: "/Images/image.png",
        description: "Official digital badge certification",
      },
    ],
  },
  {
    id: "cert-2",
    re_type: "certification",
    role: "Professional Scrum Master I (PSM I)",
    company: "Scrum.org",
    startDate: "2023-03",
    endDate: "",
    isCurrent: false,
    description:
      "Demonstrates fundamental understanding of the Scrum framework, sprint planning, backlog refinement, and cross-functional facilitation.\n\n• Scored 96.5% on the certification examination.",
    skills: [
      { skill_id: 8, skill_name: "Git" },
    ],
    links: [
      {
        id: "cert-link-2",
        title: "Scrum.org Certificate",
        url: "https://scrum.org/certificates",
        description: "PSM-I Badge #99401",
      },
    ],
    images: [],
  },
  {
    id: "cert-3",
    re_type: "certification",
    role: "Meta Full-Stack Developer Professional",
    company: "Meta & Coursera",
    startDate: "2022-12",
    endDate: "",
    isCurrent: false,
    description:
      "Comprehensive multi-course credential spanning front-end React development, relational databases, backend APIs, and CI/CD deployment.\n\n• Completed 9 capstone projects evaluating UI accessibility and REST APIs.",
    skills: [
      { skill_id: 2, skill_name: "React" },
      { skill_id: 6, skill_name: "TypeScript" },
      { skill_id: 7, skill_name: "CSS Modules" },
      { skill_id: 1, skill_name: "Node.js" },
    ],
    links: [
      {
        id: "cert-link-3",
        title: "Coursera Verification",
        url: "https://coursera.org/verify/meta-fullstack",
        description: "Specialization Certificate",
      },
    ],
    images: [],
  },
  {
    id: "cert-4",
    re_type: "certification",
    role: "Docker Certified Associate (DCA)",
    company: "Docker Inc.",
    startDate: "2023-08",
    endDate: "2025-08",
    isCurrent: false,
    description:
      "Validates enterprise container orchestration, multi-stage Dockerfile optimization, storage volume persistence, and swarm networking.\n\n• Rigorous practical evaluation of container security and registry governance.",
    skills: [
      { skill_id: 9, skill_name: "Docker" },
      { skill_id: 8, skill_name: "Git" },
    ],
    links: [],
    images: [],
  },
  {
    id: "cert-5",
    re_type: "certification",
    role: "PostgreSQL Certified Developer",
    company: "EnterpriseDB",
    startDate: "2024-01",
    endDate: "2027-01",
    isCurrent: false,
    description:
      "Advanced mastery of complex SQL queries, window functions, indexing strategies, EXPLAIN ANALYZE query planning, and table partitioning.\n\n• Demonstrated query optimization yielding 10x throughput in high-concurrency workloads.",
    skills: [
      { skill_id: 4, skill_name: "PostgreSQL" },
      { skill_id: 1, skill_name: "Node.js" },
    ],
    links: [],
    images: [],
  },
];

export default sampleCertifications;
