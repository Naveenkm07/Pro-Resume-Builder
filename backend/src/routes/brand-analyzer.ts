import { Router } from "express";
import { z } from "zod";

const router = Router();

// Types for brand analysis
type TargetRole = {
  title: string;
  jobDescription?: string;
  jobKeywords?: string[];
};

type ResumeData = {
  summary: string;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    techStack?: string;
  }>;
};

type BrandAnalysisResult = {
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

// Input validation schema
const brandAnalyzerSchema = z.object({
  targetRole: z.object({
    title: z.string(),
    jobDescription: z.string().optional(),
    jobKeywords: z.array(z.string()).optional(),
  }),
  resume: z.object({
    summary: z.string(),
    skills: z.array(z.string()),
    projects: z.array(z.object({
      name: z.string(),
      description: z.string(),
      techStack: z.string().optional(),
    })),
  }),
});

// Helper function to extract keywords from job description
const extractKeywordsFromJD = (jobDescription: string): string[] => {
  // Common tech keywords to look for
  const techKeywords = [
    'react', 'vue', 'angular', 'javascript', 'typescript', 'node', 'python', 'java', 'c++',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'mongodb', 'postgresql', 'mysql',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'rest', 'graphql', 'api',
    'testing', 'jest', 'cypress', 'webpack', 'vite', 'nextjs', 'express', 'django',
    'flask', 'spring', 'laravel', 'rails', 'php', 'ruby', 'swift', 'kotlin', 'scala',
    'rust', 'go', 'sql', 'nosql', 'agile', 'scrum', 'devops', 'ci', 'cd', 'linux',
    'ui', 'ux', 'design', 'frontend', 'backend', 'fullstack', 'mobile', 'web',
    'machine learning', 'ai', 'data science', 'analytics', 'cloud', 'microservices',
    'security', 'performance', 'optimization', 'accessibility', 'seo'
  ];

  const words = jobDescription.toLowerCase().match(/\b[a-z]+\b/gi) || [];
  const foundKeywords = new Set<string>();

  words.forEach(word => {
    techKeywords.forEach(keyword => {
      if (word.includes(keyword) || keyword.includes(word)) {
        foundKeywords.add(keyword);
      }
    });
  });

  return Array.from(foundKeywords);
};

// Helper function to normalize text for matching
const normalizeText = (text: string): string => {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
};

// Helper function to check if keyword exists in text
const keywordExists = (keyword: string, text: string): boolean => {
  const normalizedKeyword = normalizeText(keyword);
  const normalizedText = normalizeText(text);
  return normalizedText.includes(normalizedKeyword);
};

// Main analysis function
const analyzeBrandAlignment = (targetRole: TargetRole, resume: ResumeData): BrandAnalysisResult => {
  // Extract keywords from job description if not provided
  const jobKeywords = targetRole.jobKeywords || 
    (targetRole.jobDescription ? extractKeywordsFromJD(targetRole.jobDescription) : []);

  if (jobKeywords.length === 0) {
    return {
      score: 0,
      label: "No keywords to analyze",
      sectionCoverage: { summary: 0, skills: 0, projects: 0 },
      missingKeywords: [],
      underEmphasizedInSummary: [],
      suggestions: ["Please provide job keywords or a job description to analyze brand alignment."]
    };
  }

  // Section weights
  const weights = {
    summary: 0.4,
    skills: 0.35,
    projects: 0.25
  };

  // Prepare text sections
  const summaryText = resume.summary;
  const skillsText = resume.skills.join(' ');
  const projectsText = resume.projects
    .map(p => `${p.name} ${p.description} ${p.techStack || ''}`)
    .join(' ');

  // Analyze each keyword
  let totalScore = 0;
  const keywordAnalysis: Array<{
    keyword: string;
    inSummary: boolean;
    inSkills: boolean;
    inProjects: boolean;
  }> = [];

  jobKeywords.forEach(keyword => {
    const inSummary = keywordExists(keyword, summaryText);
    const inSkills = keywordExists(keyword, skillsText);
    const inProjects = keywordExists(keyword, projectsText);

    keywordAnalysis.push({
      keyword,
      inSummary,
      inSkills,
      inProjects
    });

    totalScore += (inSummary ? weights.summary : 0) +
                  (inSkills ? weights.skills : 0) +
                  (inProjects ? weights.projects : 0);
  });

  // Calculate scores
  const maxPossibleScore = jobKeywords.length * (weights.summary + weights.skills + weights.projects);
  const overallScore = Math.round((totalScore / maxPossibleScore) * 100);

  // Section coverage
  const sectionCoverage = {
    summary: Math.round((keywordAnalysis.filter(k => k.inSummary).length / jobKeywords.length) * 100),
    skills: Math.round((keywordAnalysis.filter(k => k.inSkills).length / jobKeywords.length) * 100),
    projects: Math.round((keywordAnalysis.filter(k => k.inProjects).length / jobKeywords.length) * 100)
  };

  // Generate insights
  const missingKeywords = keywordAnalysis
    .filter(k => !k.inSummary && !k.inSkills && !k.inProjects)
    .map(k => k.keyword);

  const underEmphasizedInSummary = keywordAnalysis
    .filter(k => (k.inSkills || k.inProjects) && !k.inSummary)
    .map(k => k.keyword);

  // Generate suggestions
  const suggestions: string[] = [];

  if (missingKeywords.length > 0) {
    suggestions.push(`Add missing key skills: ${missingKeywords.join(', ')}`);
  }

  if (underEmphasizedInSummary.length > 0) {
    suggestions.push(`Highlight these in your summary: ${underEmphasizedInSummary.join(', ')}`);
  }

  // Check for skills present in projects but not in skills list
  const skillsInProjectsNotInSkills = keywordAnalysis
    .filter(k => k.inProjects && !k.inSkills)
    .map(k => k.keyword);

  if (skillsInProjectsNotInSkills.length > 0) {
    suggestions.push(`Add these to your skills section: ${skillsInProjectsNotInSkills.join(', ')}`);
  }

  // Add general suggestions based on score
  if (overallScore < 50) {
    suggestions.push("Consider tailoring your resume more specifically to this role");
  } else if (overallScore < 80) {
    suggestions.push("Good alignment! Add a few more keywords to strengthen your brand");
  } else {
    suggestions.push("Excellent brand alignment for this role!");
  }

  // Determine label
  let label = "Low alignment";
  if (overallScore >= 80) label = "Strong alignment";
  else if (overallScore >= 50) label = "Moderate alignment";

  return {
    score: overallScore,
    label,
    sectionCoverage,
    missingKeywords,
    underEmphasizedInSummary,
    suggestions
  };
};

// API endpoint
router.post("/", async (req, res) => {
  try {
    const validation = brandAnalyzerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid input data",
        details: validation.error.errors
      });
    }

    const { targetRole, resume } = validation.data;
    const result = analyzeBrandAlignment(targetRole, resume);

    return res.json(result);
  } catch (error) {
    console.error("Brand analysis error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
