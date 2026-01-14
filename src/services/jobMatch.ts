import type { ResumeData } from "../types";

export type JobMatchResult = {
  score: number;
  matched: string[];
  missing: string[];
  roleHint?: string | null;
  keywords: string[];
};

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "for",
  "with",
  "on",
  "at",
  "by",
  "from",
  "as",
  "is",
  "are",
  "be",
  "will",
  "you",
  "we",
  "our",
  "your",
  "this",
  "that",
  "these",
  "those",
  "must",
  "should",
  "can",
  "able",
  "experience",
  "years",
  "year",
  "work",
  "working",
  "team",
  "teams",
  "role",
  "skills",
  "responsibilities",
  "some",
  "jobs",
]);

const KNOWN_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "vite",
  "nextjs",
  "node",
  "nodejs",
  "express",
  "mongodb",
  "mongoose",
  "sql",
  "postgres",
  "mysql",
  "redis",
  "rest",
  "api",
  "graphql",
  "jwt",
  "oauth",
  "docker",
  "kubernetes",
  "aws",
  "gcp",
  "azure",
  "git",
  "ci",
  "cd",
  "testing",
  "jest",
  "cypress",
  "tailwind",
  "python",
  "pandas",
  "numpy",
  "scikit-learn",
  "sklearn",
  "tensorflow",
  "pytorch",
  "keras",
  "machine learning",
  "deep learning",
  "data science",
  "data scientist",
  "ml engineer",
  "ai engineer",
  "computer vision",
  "nlp",
  "natural language processing",
  "llm",
  "large language model",
  "gpt",
  "transformer",
  "xgboost",
  "lightgbm",
  "spark",
  "pyspark",
  "hadoop",
  "airflow",
  "etl",
  "feature engineering",
  "statistics",
  "regression",
  "classification",
  "clustering",
  "recommendation",
  "reinforcement learning",
  "mle",
  "mlops",
  "ai",
  "ml",
  "ui",
  "ux",
  "qa",
  "go",
  "c#",
  "c++",
  "r",
];

const SHORT_IMPORTANT = ["ai", "ml", "ui", "ux", "qa", "go", "c#", "c++", "r"];

const ROLE_HINTS = {
  mlEngineer: ["ml engineer", "machine learning engineer"],
  dataScientist: ["data scientist", "data science"],
  mlOps: ["mlops", "ml ops"],
  genAI: ["generative ai", "genai", "llm", "large language model", "gpt", "transformer"],
} as const;

const ROLE_CORE_KEYWORDS: Record<string, string[]> = {
  mlEngineer: [
    "python",
    "pytorch",
    "tensorflow",
    "keras",
    "ml",
    "machine learning",
    "deep learning",
    "nlp",
    "llm",
    "gpt",
    "computer vision",
    "feature engineering",
    "mlops",
  ],
  dataScientist: [
    "python",
    "pandas",
    "numpy",
    "sql",
    "statistics",
    "regression",
    "classification",
    "clustering",
    "data science",
    "ml",
    "machine learning",
  ],
  mlOps: [
    "mlops",
    "airflow",
    "docker",
    "kubernetes",
    "aws",
    "gcp",
    "azure",
    "ci",
    "cd",
    "spark",
    "pyspark",
    "etl",
  ],
  genAI: [
    "llm",
    "large language model",
    "gpt",
    "transformer",
    "nlp",
    "natural language processing",
  ],
};

export const extractJobKeywords = (jobDescription: string): string[] => {
  const text = jobDescription.trim();
  if (!text) return [];

  const jdLower = text.toLowerCase();
  const tokens = jdLower
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const tokenSet = new Set(tokens);

  const freq = new Map<string, number>();
  for (const t of tokens) {
    if (t.length < 3) continue;
    if (STOP_WORDS.has(t)) continue;
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }

  const topFromFreq = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([k]) => k);

  const fromKnown = KNOWN_KEYWORDS.filter((k) => jdLower.includes(k));
  const fromShort = SHORT_IMPORTANT.filter((k) => tokenSet.has(k));

  return Array.from(new Set([...fromKnown, ...fromShort, ...topFromFreq])).slice(0, 30);
};

export const scoreResumeAgainstJobDescription = (
  resume: ResumeData,
  jobDescription: string
): JobMatchResult => {
  const text = jobDescription.trim();
  if (!text) {
    return {
      score: 0,
      matched: [],
      missing: [],
      roleHint: null,
      keywords: [],
    };
  }

  const jdLower = text.toLowerCase();
  const keywords = extractJobKeywords(text);

  const resumeText = JSON.stringify(resume).toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const k of keywords) {
    if (resumeText.includes(k)) matched.push(k);
    else missing.push(k);
  }

  const activeRoles: (keyof typeof ROLE_HINTS)[] = [];
  if (ROLE_HINTS.mlEngineer.some((p) => jdLower.includes(p))) activeRoles.push("mlEngineer");
  if (ROLE_HINTS.dataScientist.some((p) => jdLower.includes(p))) activeRoles.push("dataScientist");
  if (ROLE_HINTS.mlOps.some((p) => jdLower.includes(p))) activeRoles.push("mlOps");
  if (ROLE_HINTS.genAI.some((p) => jdLower.includes(p))) activeRoles.push("genAI");

  const weightFor = (kw: string): number => {
    let w = 1;
    for (const role of activeRoles) {
      const core = ROLE_CORE_KEYWORDS[role];
      if (core && core.includes(kw)) {
        w = Math.max(w, 2);
      }
    }
    return w;
  };

  let totalWeight = 0;
  let matchedWeight = 0;
  for (const k of keywords) {
    const w = weightFor(k);
    totalWeight += w;
    if (matched.includes(k)) matchedWeight += w;
  }

  const score = totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100);

  let roleHint: string | null = null;
  if (activeRoles.length > 0) {
    const labels: Record<keyof typeof ROLE_HINTS, string> = {
      mlEngineer: "ML Engineer",
      dataScientist: "Data Scientist",
      mlOps: "MLOps Engineer",
      genAI: "Generative AI / LLM",
    };
    const human = activeRoles.map((r) => labels[r]).join(", ");
    roleHint = `Detected role: ${human} (AI/ML weighting applied)`;
  }

  return {
    score,
    matched: matched.slice(0, 30),
    missing: missing.slice(0, 30),
    roleHint,
    keywords,
  };
};
