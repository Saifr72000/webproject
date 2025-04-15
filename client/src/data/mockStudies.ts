// Mock data for studies
export interface StudyMock {
  id: number;
  name: string;
  description: string;
  tags: string[]; // Skills/technologies
  entries: {
    name: string;
    category: string;
  };
  created: string;
  progress: number;
  status: "draft" | "active" | "completed" | "paused";
  leadResearcher: {
    name: string;
    avatar: string;
  };
}

export const mockStudies: StudyMock[] = [
  {
    id: 1,
    name: "User Experience in Mobile Banking",
    description:
      "Research on user experience factors affecting mobile banking adoption",
    tags: ["UX Research", "Mobile", "Financial"],
    entries: {
      name: "FinTech Solutions",
      category: "Banking & Finance",
    },
    created: "2023-11-15",
    progress: 50,
    status: "active",
    leadResearcher: {
      name: "Ana Simmons",
      avatar: "/media/avatars/300-14.jpg",
    },
  },
  {
    id: 2,
    name: "Accommodation Preferences of Millennials",
    description: "Analysis of accommodation preferences and booking behaviors",
    tags: ["Market Research", "Hospitality", "Demographics"],
    entries: {
      name: "Agoda",
      category: "Houses & Hotels",
    },
    created: "2023-10-08",
    progress: 70,
    status: "active",
    leadResearcher: {
      name: "Jessie Clarcson",
      avatar: "/media/avatars/300-2.jpg",
    },
  },
  {
    id: 3,
    name: "Urban Transportation Patterns",
    description:
      "Study on urban transportation patterns and ride-sharing impact",
    tags: ["Transportation", "Urban Planning", "Logistics"],
    entries: {
      name: "RoadGee",
      category: "Transportation",
    },
    created: "2023-09-22",
    progress: 60,
    status: "active",
    leadResearcher: {
      name: "Lebron Wayde",
      avatar: "/media/avatars/300-3.jpg",
    },
  },
  {
    id: 4,
    name: "Consumer Risk Perception in Insurance",
    description:
      "Analysis of how consumers perceive risk in insurance products",
    tags: ["Insurance", "Risk Analysis", "Consumer Behavior"],
    entries: {
      name: "The Hill",
      category: "Insurance",
    },
    created: "2023-08-30",
    progress: 50,
    status: "active",
    leadResearcher: {
      name: "Natali Goodwin",
      avatar: "/media/avatars/300-9.jpg",
    },
  },
  {
    id: 5,
    name: "AI in Healthcare Diagnostics",
    description: "Exploration of AI applications in early disease detection",
    tags: ["Healthcare", "AI", "Machine Learning"],
    entries: {
      name: "MediTech",
      category: "Healthcare",
    },
    created: "2023-12-01",
    progress: 30,
    status: "active",
    leadResearcher: {
      name: "Kevin Leonard",
      avatar: "/media/avatars/300-5.jpg",
    },
  },
  {
    id: 6,
    name: "Remote Work Productivity Factors",
    description:
      "Analysis of factors affecting productivity in remote work environments",
    tags: ["Remote Work", "Productivity", "HR"],
    entries: {
      name: "WorkFlex",
      category: "Human Resources",
    },
    created: "2023-11-05",
    progress: 80,
    status: "active",
    leadResearcher: {
      name: "Emma Bold",
      avatar: "/media/avatars/300-7.jpg",
    },
  },
  {
    id: 7,
    name: "Digital Marketing ROI Assessment",
    description:
      "Comparative analysis of ROI across digital marketing channels",
    tags: ["Digital Marketing", "ROI", "Analytics"],
    entries: {
      name: "MarketEdge",
      category: "Marketing",
    },
    created: "2023-10-12",
    progress: 65,
    status: "active",
    leadResearcher: {
      name: "Brian Cox",
      avatar: "/media/avatars/300-11.jpg",
    },
  },
  {
    id: 8,
    name: "Sustainable Packaging Preferences",
    description: "Consumer attitudes toward sustainable packaging options",
    tags: ["Sustainability", "Packaging", "Consumer Preferences"],
    entries: {
      name: "EcoPack",
      category: "Sustainability",
    },
    created: "2023-09-08",
    progress: 45,
    status: "active",
    leadResearcher: {
      name: "Melody Macy",
      avatar: "/media/avatars/300-1.jpg",
    },
  },
  {
    id: 9,
    name: "Virtual Reality in Education",
    description: "Effectiveness of VR technology in educational settings",
    tags: ["EdTech", "VR", "Education"],
    entries: {
      name: "EduVision",
      category: "Education",
    },
    created: "2023-12-10",
    progress: 20,
    status: "draft",
    leadResearcher: {
      name: "Francis Mitcham",
      avatar: "/media/avatars/300-12.jpg",
    },
  },
  {
    id: 10,
    name: "Telehealth Adoption Barriers",
    description:
      "Investigation of barriers to telehealth adoption among various demographics",
    tags: ["Telehealth", "Healthcare", "Technology Adoption"],
    entries: {
      name: "HealthConnect",
      category: "Healthcare",
    },
    created: "2023-08-15",
    progress: 90,
    status: "completed",
    leadResearcher: {
      name: "Dan Wilson",
      avatar: "/media/avatars/300-4.jpg",
    },
  },
];
