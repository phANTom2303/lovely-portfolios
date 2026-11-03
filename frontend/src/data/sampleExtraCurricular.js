const sampleExtraCurricular = [
  {
    id: "ec-1",
    re_type: "extra_curricular",
    role: "President & Lead Organizer",
    company: "Google Developer Student Club",
    startDate: "2023-08",
    endDate: "",
    isCurrent: true,
    description:
      "Spearhead university developer initiatives, organize tech bootcamps, and foster open-source contributions across 600+ student members.\n\n• Hosted 14 workshops on React, Cloud Computing, and System Design with 1,200+ attendees.\n• Mentored 20 student projects through the Google Solution Challenge.",
    skills: [
      { skill_id: 2, skill_name: "React" },
      { skill_id: 6, skill_name: "TypeScript" },
      { skill_id: 9, skill_name: "Docker" },
    ],
    links: [
      {
        id: "ec-link-1",
        title: "Club Chapter Page",
        url: "https://gdsc.community.dev",
        description: "Official GDSC university chapter",
      },
    ],
    images: [
      {
        id: "ec-img-1",
        title: "GDSC Annual Workshop",
        url: "/Images/image.png",
        description: "Campus community keynote session",
      },
    ],
  },
  {
    id: "ec-2",
    re_type: "extra_curricular",
    role: "Volunteer Lead — Code for Good",
    company: "TechNGO Foundation",
    startDate: "2022-06",
    endDate: "2023-08",
    isCurrent: false,
    description:
      "Led student volunteers building open-source inventory tracking systems for regional food distribution charities.\n\n• Deployed real-time inventory dashboards serving 8 community food banks.\n• Conducted weekly weekend coding sessions teaching web fundamentals to local youth.",
    skills: [
      { skill_id: 1, skill_name: "Node.js" },
      { skill_id: 4, skill_name: "PostgreSQL" },
    ],
    links: [],
    images: [],
  },
  {
    id: "ec-3",
    re_type: "extra_curricular",
    role: "National Collegiate Debate Finalist",
    company: "Parliamentary Debate Society",
    startDate: "2023-03",
    endDate: "2023-03",
    isCurrent: false,
    description:
      "Competed in British Parliamentary style debate on topics covering AI ethics, public policy, and antitrust regulation in digital markets.\n\n• Awarded 2nd Best Speaker across 64 participating university delegations.",
    skills: [],
    links: [],
    images: [],
  },
  {
    id: "ec-4",
    re_type: "extra_curricular",
    role: "Open Source Community Moderator",
    company: "DevCommunity Discord (45k+ members)",
    startDate: "2023-01",
    endDate: "",
    isCurrent: true,
    description:
      "Moderate technical discussion channels, review resource submissions, and facilitate bi-weekly project showcase live streams.\n\n• Authored community guidelines and automated spam moderation bots using WebHooks.",
    skills: [
      { skill_id: 8, skill_name: "Git" },
      { skill_id: 1, skill_name: "Node.js" },
    ],
    links: [],
    images: [],
  },
  {
    id: "ec-5",
    re_type: "extra_curricular",
    role: "Technical Mentor & Workshop Speaker",
    company: "Women in Technology Forum",
    startDate: "2023-09",
    endDate: "2024-02",
    isCurrent: false,
    description:
      "Provided 1-on-1 resume reviews and technical interview preparation for career changers entering full-stack web development.\n\n• Guided 12 mentees into their first junior developer and internship placements.",
    skills: [
      { skill_id: 2, skill_name: "React" },
      { skill_id: 7, skill_name: "CSS Modules" },
    ],
    links: [],
    images: [],
  },
];

export default sampleExtraCurricular;
