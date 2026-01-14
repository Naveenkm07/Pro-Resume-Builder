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

export type ResumeData = {
  name: string;
  contact: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
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
};


