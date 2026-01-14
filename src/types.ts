export type Experience = {
  title: string;
  company: string;
  desc: string;
  from: string;
  to: string;
};

export type Education = {
  degree: string;
  college: string;
  year: string;
};

export type Project = {
  name: string;
  description: string;
  techStack?: string;
  link?: string;
};

export type ResumeData = {
  name: string;
  contact: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  versionName?: string;
  sectionOrder?: string[];
};

export type TargetRole = {
  title: string;
  jobDescription?: string;
  jobKeywords?: string[];
};

export type BrandAnalysisResult = {
  score: number;
  label: string;
  sectionCoverage: {
    summary: number;
    skills: number;
    projects: number;
  };
  missingKeywords: string[];
  underEmphasizedInSummary: string[];
  suggestions: string[];
};

export const SAMPLE_RESUME: ResumeData = {
  name: "Naveen Kumar",
  contact: "naveen@example.com | +91-98xxxxxxx",
  summary: "3rd-year CSE student at NHCE. Passion for full-stack web apps.",
  skills: ["React", "Node.js", "Python"],
  experience: [
    {
      title: "Intern",
      company: "ABC",
      desc: "Built features",
      from: "2024",
      to: "2024",
    },
  ],
  education: [
    {
      degree: "B.E CSE",
      college: "NHCE",
      year: "2025",
    },
  ],
  projects: [
    {
      name: "PersonalDataManager.ADV – Secure Personal Data Management Tool",
      description:
        "Built a desktop/web tool to manage personal records securely with role-based access, search, backup and restore.",
      techStack: "Python, SQLite/MySQL, AES encryption, Tkinter/Flask",
      link: "https://github.com/Naveenkm07/PersonalDataManager-ADV",
    },
  ],
  versionName: 'Base',
};
