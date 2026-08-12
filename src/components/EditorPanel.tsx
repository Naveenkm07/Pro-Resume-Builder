import React, { useEffect, useRef, useState } from "react";
import { SAMPLE_RESUME, type ResumeData } from "../types";
import TemplateSwitcher, { TemplateType } from "./TemplateSwitcher";
import Upload from "./Upload";
import Card from "./ui/Card";
import Button from "./ui/Button";
import AutocompleteInput from "./ui/AutocompleteInput";
import ThemePicker from "./ThemePicker";
import ThemeSwitcher from "./ThemeSwitcher";
import A4Preview from "./A4Preview";
import PersonalBrandingAnalyzer from "./PersonalBrandingAnalyzer";
import MultiJobMatchDashboard from "./MultiJobMatchDashboard";
import { useAuth } from "../contexts/AuthContext";
import { ApiService } from "../services/api";
import AuthService from "../services/auth";
import { normalizeSkills, type SkillNormalizationResult } from "../services/skills";
import {
  analyzeBulletImpact,
  applyBulletSuggestion,
  parseBulletLines,
} from "../services/bulletImpact";
import { enhanceProjectFromReadme, type ReadmeEnhancementResult } from "../services/readmeEnhancer";
import { checkGrammar, applyGrammarFix, type GrammarIssue, type GrammarCheckResult } from "../services/grammarChecker";
import { generateOutreachVariants, type OutreachChannel, type OutreachVariants } from "../services/outreachGenerator";
import { getOptimizedSectionOrder } from "../services/sectionOrderOptimizer";
import { scoreStarAnswer } from "../services/starScorer";
import { scoreResumeAgainstJobDescription, type JobMatchResult } from "../services/jobMatch";
import { scanResumeSimilarity, type SimilarityScanResult } from "../services/similarityDetector";
import ExportWizard from "./ExportWizard";

type EditorPanelProps = {
  resume: ResumeData;
  onResumeChange: (resume: ResumeData) => void;
  onUploadParsed: (data: ResumeData) => void;
  activeSection: string;
  template: TemplateType;
  onTemplateChange: (tpl: TemplateType) => void;
  optimizeLayoutOrder: boolean;
  onOptimizeLayoutOrderChange: (enabled: boolean) => void;
};

const EditorPanel: React.FC<EditorPanelProps> = ({
  resume,
  onResumeChange,
  onUploadParsed,
  activeSection,
  template,
  onTemplateChange,
  optimizeLayoutOrder,
  onOptimizeLayoutOrderChange,
}) => {
  const { user, signOut } = useAuth();
  const effectiveSectionOrder = optimizeLayoutOrder
    ? getOptimizedSectionOrder(resume)
    : resume.sectionOrder;
  const allTemplateNames: TemplateType[] = [
    "simple", "professional", "creative", "modern", "minimal", "executive", "academic", "technical",
    "portfolio", "bold", "clean", "compact", "elegant", "classic", "stylish", "fresh", "sharp",
    "zen", "focus", "vivid", "sleek", "smart", "dynamic", "elite"
  ];
  const latestResumeRef = useRef(resume);
  const saveMutexRef = useRef(false);
  const saveOnEditTimeoutRef = useRef<number | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [pageSize, setPageSize] = useState<"A4" | "Letter">(() => {
    const raw = localStorage.getItem("pdfPageSize");
    return raw === "Letter" ? "Letter" : "A4";
  });
  const [marginMm, setMarginMm] = useState(() => {
    const raw = localStorage.getItem("pdfMarginMm");
    const parsed = raw ? Number(raw) : 15;
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 50 ? parsed : 15;
  });
  const [scalePercent, setScalePercent] = useState(() => {
    const raw = localStorage.getItem("pdfScalePercent");
    const parsed = raw ? Number(raw) : 100;
    return Number.isFinite(parsed) && parsed >= 50 && parsed <= 150 ? parsed : 100;
  });
  const [defaultTemplate, setDefaultTemplate] = useState<TemplateType>(() => {
    const raw = localStorage.getItem("defaultTemplate");
    return (raw === "simple" || raw === "professional" || raw === "creative") ? raw : "simple";
  });
  const [rememberLastTemplate, setRememberLastTemplate] = useState(() => {
    const raw = localStorage.getItem("rememberLastTemplate");
    return raw === "true";
  });
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(() => {
    const raw = localStorage.getItem("editorSpellcheck");
    return raw ? raw === "true" : true;
  });
  const [compactMode, setCompactMode] = useState(() => {
    const raw = localStorage.getItem("editorCompactMode");
    return raw === "true";
  });
  const [autoSaveOnEdit, setAutoSaveOnEdit] = useState(() => {
    const raw = localStorage.getItem("autoSaveOnEdit");
    return raw === "true";
  });
  const [autoSaveOnEditDelayMs, setAutoSaveOnEditDelayMs] = useState(() => {
    const raw = localStorage.getItem("autoSaveOnEditDelayMs");
    const parsed = raw ? Number(raw) : 1500;
    return Number.isFinite(parsed) && parsed >= 300 && parsed <= 10000 ? parsed : 1500;
  });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    const raw = localStorage.getItem("autoSaveEnabled");
    return raw ? raw === "true" : false;
  });
  const [autoSaveIntervalSec, setAutoSaveIntervalSec] = useState(() => {
    const raw = localStorage.getItem("autoSaveIntervalSec");
    const parsed = raw ? Number(raw) : 30;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["profile", "summary", "experience", "education", "projects"])
  );
  const [skillsCleanerOpen, setSkillsCleanerOpen] = useState(false);
  const [skillsCleanerResult, setSkillsCleanerResult] = useState<SkillNormalizationResult | null>(null);
  const [developerMode, setDeveloperMode] = useState(false);
  const [bulletCoachOpen, setBulletCoachOpen] = useState<{
    section: "experience" | "projects";
    parentIndex: number;
    lineIndex: number;
  } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [accountActionStatus, setAccountActionStatus] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobMatchLoading, setJobMatchLoading] = useState(false);
  const [jobMatchError, setJobMatchError] = useState<string>('');
  const [jobMatchResult, setJobMatchResult] = useState<JobMatchResult | null>(null);
  const [aiAssistantLoading, setAiAssistantLoading] = useState(false);
  const [aiAssistantOutput, setAiAssistantOutput] = useState<string>('');
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [optimizerResult, setOptimizerResult] = useState<{
    atsWarnings: string[];
    readabilityScore: number;
    readabilityGrade: string;
    sectionRecommendations: string[];
  } | null>(null);
  const [interviewPrepLoading, setInterviewPrepLoading] = useState(false);
  const [interviewPrepResult, setInterviewPrepResult] = useState<{
    questions: string[];
    starAnswers: string[];
    recruiterQuestions: string[];
  } | null>(null);
  const [starAnswerDraft, setStarAnswerDraft] = useState(() => {
    const raw = localStorage.getItem("starAnswerDraft");
    return raw || "";
  });
  const [coverLetterTone, setCoverLetterTone] = useState<'formal' | 'casual' | 'enthusiastic'>('formal');
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);
  const [coverLetterOutput, setCoverLetterOutput] = useState<string>('');
  const [profileEnhancerLoading, setProfileEnhancerLoading] = useState(false);
  const [profileEnhancerOutput, setProfileEnhancerOutput] = useState<{
    linkedinHeadline: string;
    shortBio: string;
    prioritizedSkills: string[];
  } | null>(null);
  const [readmeEnhancerOpen, setReadmeEnhancerOpen] = useState<{
    projectIndex: number;
  } | null>(null);
  const [readmeEnhancerResult, setReadmeEnhancerResult] = useState<ReadmeEnhancementResult | null>(null);
  const [readmeText, setReadmeText] = useState<string>('');
  const [grammarResults, setGrammarResults] = useState<Map<string, GrammarCheckResult>>(new Map());
  const [grammarOpen, setGrammarOpen] = useState<string | null>(null);
  const [outreachChannel, setOutreachChannel] = useState<OutreachChannel>('linkedin');
  const [outreachRecruiterName, setOutreachRecruiterName] = useState<string>('');
  const [outreachCompany, setOutreachCompany] = useState<string>('');
  const [outreachRole, setOutreachRole] = useState<string>('');
  const [outreachJobLink, setOutreachJobLink] = useState<string>('');
  const [outreachVariants, setOutreachVariants] = useState<OutreachVariants | null>(null);
  const [similarityThreshold, setSimilarityThreshold] = useState(() => {
    const raw = localStorage.getItem("similarityThreshold");
    const parsed = raw ? Number(raw) : 0.82;
    return Number.isFinite(parsed) && parsed >= 0.5 && parsed <= 0.99 ? parsed : 0.82;
  });
  const [similarityCompareWithin, setSimilarityCompareWithin] = useState(() => {
    const raw = localStorage.getItem("similarityCompareWithin");
    return raw === "true";
  });
  const [similarityResult, setSimilarityResult] = useState<SimilarityScanResult | null>(null);
  const [showExportWizard, setShowExportWizard] = useState(false);

  useEffect(() => {
    latestResumeRef.current = resume;
  }, [resume]);

  useEffect(() => {
    localStorage.setItem("pdfPageSize", pageSize);
  }, [pageSize]);

  useEffect(() => {
    localStorage.setItem("pdfMarginMm", String(marginMm));
  }, [marginMm]);

  useEffect(() => {
    localStorage.setItem("pdfScalePercent", String(scalePercent));
  }, [scalePercent]);

  useEffect(() => {
    localStorage.setItem("defaultTemplate", defaultTemplate);
  }, [defaultTemplate]);

  useEffect(() => {
    localStorage.setItem("rememberLastTemplate", String(rememberLastTemplate));
  }, [rememberLastTemplate]);

  useEffect(() => {
    localStorage.setItem("editorSpellcheck", String(spellCheckEnabled));
  }, [spellCheckEnabled]);

  useEffect(() => {
    localStorage.setItem("editorCompactMode", String(compactMode));
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem("autoSaveOnEdit", String(autoSaveOnEdit));
  }, [autoSaveOnEdit]);

  useEffect(() => {
    localStorage.setItem("autoSaveOnEditDelayMs", String(autoSaveOnEditDelayMs));
  }, [autoSaveOnEditDelayMs]);

  useEffect(() => {
    localStorage.setItem("autoSaveEnabled", String(autoSaveEnabled));
  }, [autoSaveEnabled]);

  useEffect(() => {
    localStorage.setItem("autoSaveIntervalSec", String(autoSaveIntervalSec));
  }, [autoSaveIntervalSec]);

  useEffect(() => {
    localStorage.setItem("starAnswerDraft", starAnswerDraft);
  }, [starAnswerDraft]);

  useEffect(() => {
    localStorage.setItem("similarityThreshold", String(similarityThreshold));
  }, [similarityThreshold]);

  useEffect(() => {
    localStorage.setItem("similarityCompareWithin", String(similarityCompareWithin));
  }, [similarityCompareWithin]);

  useEffect(() => {
    if (!autoSaveEnabled || !user) {
      return;
    }

    const id = window.setInterval(async () => {
      if (saveMutexRef.current) return;
      saveMutexRef.current = true;
      try {
        setAutoSaveStatus("Saving...");
        await ApiService.saveResume(latestResumeRef.current);
        const t = new Date();
        const hh = String(t.getHours()).padStart(2, "0");
        const mm = String(t.getMinutes()).padStart(2, "0");
        const ss = String(t.getSeconds()).padStart(2, "0");
        setAutoSaveStatus(`Saved at ${hh}:${mm}:${ss}`);
      } catch {
        setAutoSaveStatus("Auto-save failed");
      } finally {
        saveMutexRef.current = false;
      }
    }, Math.max(5, autoSaveIntervalSec) * 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [autoSaveEnabled, autoSaveIntervalSec, user]);

  useEffect(() => {
    if (!autoSaveOnEdit || !user) {
      return;
    }

    if (saveOnEditTimeoutRef.current) {
      window.clearTimeout(saveOnEditTimeoutRef.current);
    }

    const id = window.setTimeout(async () => {
      if (saveMutexRef.current) return;
      saveMutexRef.current = true;
      try {
        setAutoSaveStatus("Saving...");
        await ApiService.saveResume(latestResumeRef.current);
        const t = new Date();
        const hh = String(t.getHours()).padStart(2, "0");
        const mm = String(t.getMinutes()).padStart(2, "0");
        const ss = String(t.getSeconds()).padStart(2, "0");
        setAutoSaveStatus(`Saved at ${hh}:${mm}:${ss}`);
      } catch {
        setAutoSaveStatus("Auto-save failed");
      } finally {
        saveMutexRef.current = false;
      }
    }, autoSaveOnEditDelayMs);

    saveOnEditTimeoutRef.current = id;

    return () => {
      window.clearTimeout(id);
    };
  }, [autoSaveOnEdit, autoSaveOnEditDelayMs, resume, user]);

  useEffect(() => {
    const styleId = "pdf-export-styles";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    const mmToInch = 0.0393701;
    const marginInch = marginMm * mmToInch;
    const sizeInch = pageSize === "A4" ? "210mm 297mm" : "8.5in 11in";
    styleEl.textContent = `
      @media print {
        @page {
          size: ${sizeInch};
          margin: ${marginInch}in;
        }
        body {
          transform: scale(${scalePercent / 100});
          transform-origin: top left;
        }
      }
    `;
    return () => {
      styleEl.remove();
    };
  }, [pageSize, marginMm, scalePercent]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const analyzeJobMatch = async () => {
    setJobMatchError('');
    setJobMatchResult(null);

    const text = jobDescription.trim();
    if (!text) {
      setJobMatchError('Paste a job description first');
      return;
    }

    setJobMatchLoading(true);
    try {
      const result = scoreResumeAgainstJobDescription(resume, text);
      setJobMatchResult(result);
    } finally {
      setJobMatchLoading(false);
    }
  };

  const rewriteBullet = (bullet: string): string => {
    const weakStarts = [
      'i was responsible for',
      'i helped',
      'i worked on',
      'i participated in',
      'i was involved in',
      'responsible for',
      'helped',
      'worked on',
      'participated in',
      'involved in',
    ];
    const lower = bullet.toLowerCase();
    for (const weak of weakStarts) {
      if (lower.startsWith(weak)) {
        const rest = bullet.slice(weak.length).trim();
        const action = ['Led', 'Built', 'Designed', 'Improved', 'Managed', 'Delivered', 'Optimized', 'Launched', 'Grew', 'Reduced'][Math.floor(Math.random() * 10)];
        return `${action} ${rest.charAt(0).toLowerCase() + rest.slice(1)}`;
      }
    }
    if (!/\d/.test(bullet)) {
      const impact = ['resulting in', 'improving', 'leading to'][Math.floor(Math.random() * 3)];
      const metric = ['10%', '25%', '30%', '40%', '50%'][Math.floor(Math.random() * 5)];
      const area = ['efficiency', 'performance', 'user satisfaction', 'revenue', 'cost savings'][Math.floor(Math.random() * 5)];
      return `${bullet.trim()}, ${impact} a ${metric} increase in ${area}.`;
    }
    return bullet;
  };

  const generateSummary = (): string => {
    const skills = resume.skills.slice(0, 6).join(', ');
    const expCount = resume.experience.length;
    const eduCount = resume.education.length;
    const role = resume.experience[0]?.title || 'professional';
    const summary = `Detail-oriented ${role} with ${expCount}+ years of experience and expertise in ${skills}. Proven ability to deliver results in fast-paced environments. Holds ${eduCount} relevant degrees. Seeking to leverage skills to drive impact.`;
    return summary;
  };

  const analyzeSkillGap = (): string => {
    const targetRoles = [
      { role: 'Software Engineer', skills: ['javascript', 'typescript', 'react', 'node', 'git', 'testing', 'ci/cd'] },
      { role: 'Data Analyst', skills: ['sql', 'python', 'excel', 'tableau', 'statistics', 'data visualization'] },
      { role: 'Product Manager', skills: ['strategy', 'roadmap', 'agile', 'analytics', 'communication', 'stakeholder management'] },
      { role: 'DevOps Engineer', skills: ['docker', 'kubernetes', 'ci/cd', 'aws', 'linux', 'monitoring'] },
    ];
    const mySkills = new Set(resume.skills.map(s => s.toLowerCase()));
    const gaps = targetRoles.map(({ role, skills }) => {
      const missing = skills.filter(s => !mySkills.has(s));
      return { role, missing };
    });
    const topGap = gaps.sort((a, b) => b.missing.length - a.missing.length)[0];
    if (!topGap || topGap.missing.length === 0) return 'Your skill set looks well-rounded for common roles!';
    return `To strengthen your profile for ${topGap.role}, consider learning: ${topGap.missing.slice(0, 5).join(', ')}.`;
  };

  const runAiAssistant = (tool: 'rewrite' | 'summary' | 'skillgap') => {
    setAiAssistantLoading(true);
    setAiAssistantOutput('');
    setTimeout(() => {
      let out = '';
      if (tool === 'rewrite') {
        const bullets = resume.experience.flatMap(exp => [exp.desc]);
        out = bullets.map(b => `• ${rewriteBullet(b)}`).join('\n');
      } else if (tool === 'summary') {
        out = generateSummary();
      } else if (tool === 'skillgap') {
        out = analyzeSkillGap();
      }
      setAiAssistantOutput(out);
      setAiAssistantLoading(false);
    }, 800);
  };

  const runOptimizer = () => {
    setOptimizerLoading(true);
    setOptimizerResult(null);
    setTimeout(() => {
      const atsWarnings: string[] = [];
      if (resume.experience.some(exp => exp.desc.includes('table') || exp.desc.includes('column'))) {
        atsWarnings.push('Experience descriptions mention tables/columns which may confuse ATS parsers.');
      }
      if (resume.summary.length > 600) {
        atsWarnings.push('Summary is very long (>600 chars); consider shortening for ATS readability.');
      }
      if (resume.skills.length > 30) {
        atsWarnings.push('Skills list is long (>30); ATS may truncate or penalize for keyword stuffing.');
      }

      const totalChars = JSON.stringify(resume).length;
      const readabilityScore = Math.min(100, Math.round((1000 / totalChars) * 100));
      let readabilityGrade = 'A';
      if (readabilityScore < 80) readabilityGrade = 'B';
      if (readabilityScore < 60) readabilityGrade = 'C';
      if (readabilityScore < 40) readabilityGrade = 'D';

      const sectionRecommendations: string[] = [];
      const hasProjects = resume.experience.some(exp => exp.desc.toLowerCase().includes('project'));
      if (!hasProjects && resume.skills.some(s => ['javascript', 'react', 'python', 'data', 'design'].some(t => s.toLowerCase().includes(t)))) {
        sectionRecommendations.push('Consider adding a Projects section to showcase hands-on work.');
      }
      if (resume.education.length === 0) {
        sectionRecommendations.push('Add an Education section even if self-taught; include certifications.');
      }
      if (resume.experience.length === 0) {
        sectionRecommendations.push('Add at least one Experience entry (internships, freelance, or personal projects count).');
      }
      if (resume.skills.length < 6) {
        sectionRecommendations.push('Expand your Skills section to at least 6 relevant keywords for ATS matching.');
      }

      setOptimizerResult({
        atsWarnings,
        readabilityScore,
        readabilityGrade,
        sectionRecommendations,
      });
      setOptimizerLoading(false);
    }, 700);
  };

  const runInterviewPrep = () => {
    setInterviewPrepLoading(true);
    setInterviewPrepResult(null);
    setTimeout(() => {
      const questions: string[] = [];
      const starAnswers: string[] = [];
      const recruiterQuestions: string[] = [];

      // Generate questions from experience
      resume.experience.forEach(exp => {
        questions.push(`Tell me about your role as ${exp.title} at ${exp.company}.`);
        questions.push(`What was the most challenging project you worked on at ${exp.company}?`);
      });

      // Generate questions from skills
      const techSkills = resume.skills.filter(s => ['javascript', 'react', 'python', 'node', 'sql', 'aws', 'docker'].some(t => s.toLowerCase().includes(t)));
      techSkills.slice(0, 3).forEach(skill => {
        questions.push(`How have you used ${skill} in a real project?`);
      });

      // STAR answers for each experience bullet
      resume.experience.forEach(exp => {
        const action = ['Led', 'Built', 'Designed', 'Improved', 'Managed'][Math.floor(Math.random() * 5)];
        const result = ['increased efficiency by 20%', 'reduced costs by 15%', 'improved user satisfaction', 'delivered on time'][Math.floor(Math.random() * 4)];
        starAnswers.push(`Situation: While working as ${exp.title} at ${exp.company}, we faced a challenge. Task: My goal was to ${exp.desc.toLowerCase()}. Action: I ${action.toLowerCase()} the initiative. Result: This ${result}.`);
      });

      // Likely recruiter questions based on gaps/keywords
      if (resume.skills.length < 8) {
        recruiterQuestions.push('Can you describe additional technical skills you have that aren’t listed?');
      }
      if (resume.experience.length === 1) {
        recruiterQuestions.push('Why are you looking to leave your current role so soon?');
      }
      if (!resume.summary.toLowerCase().includes('team')) {
        recruiterQuestions.push('Can you give an example of how you work in a team setting?');
      }
      recruiterQuestions.push('What kind of role or environment are you looking for next?');
      recruiterQuestions.push('How do you stay updated with industry trends?');

      setInterviewPrepResult({
        questions: questions.slice(0, 6),
        starAnswers: starAnswers.slice(0, 3),
        recruiterQuestions: recruiterQuestions.slice(0, 4),
      });
      setInterviewPrepLoading(false);
    }, 800);
  };

  const generateCoverLetter = () => {
    setCoverLetterLoading(true);
    setCoverLetterOutput('');
    setTimeout(() => {
      const name = resume.name || 'Your Name';
      const contact = resume.contact || 'your.email@example.com';
      const summary = resume.summary || 'A dedicated professional with relevant experience.';
      const skills = resume.skills.slice(0, 5).join(', ');
      const expTitle = resume.experience[0]?.title || 'Professional';
      const expCompany = resume.experience[0]?.company || 'Company';

      const jd = jobDescription.trim();
      const jdKeywords = jd
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4)
        .slice(0, 10);

      const toneMap = {
        formal: { greeting: 'Dear Hiring Manager,', closing: 'Sincerely,' },
        casual: { greeting: 'Hi there,', closing: 'Best,' },
        enthusiastic: { greeting: 'Hello!', closing: 'Cheers,' },
      };
      const { greeting, closing } = toneMap[coverLetterTone];

      let body = `${greeting}\n\n`;
      body += `I am excited to apply for the position at your company. As a ${expTitle} with experience at ${expCompany}, I have developed strong skills in ${skills}. `;
      body += `${summary}\n\n`;
      body += `In my recent role, I contributed to impactful projects and honed my abilities. `;
      if (jdKeywords.length > 0) {
        body += `I noticed your emphasis on ${jdKeywords.slice(0, 3).join(', ')}, which aligns with my background. `;
      }
      body += `I am confident that my skills and experience make me a strong fit for this opportunity.\n\n`;
      body += `Thank you for considering my application. I look forward to discussing how I can contribute to your team.\n\n`;
      body += `${closing}\n${name}\n${contact}`;

      setCoverLetterOutput(body);
      setCoverLetterLoading(false);
    }, 900);
  };

  const runProfileEnhancer = () => {
    setProfileEnhancerLoading(true);
    setProfileEnhancerOutput(null);
    setTimeout(() => {
      const role = resume.experience[0]?.title || 'Professional';
      const topSkills = resume.skills.slice(0, 6);
      const years = resume.experience.length > 0 ? `${resume.experience.length}+ years` : 'experienced';

      const linkedinHeadline = `${role} | ${topSkills.slice(0, 3).join(' • ')} | ${years}`;
      const shortBio = `${resume.summary.slice(0, 260)}${resume.summary.length > 260 ? '…' : ''}`;

      const demandMap: Record<string, number> = {
        javascript: 95,
        python: 92,
        react: 90,
        aws: 88,
        docker: 85,
        sql: 82,
        node: 80,
        typescript: 79,
        mongodb: 70,
        git: 68,
        'ci/cd': 65,
        kubernetes: 62,
        rest: 60,
        graphql: 58,
        excel: 55,
        tableau: 52,
        agile: 50,
        communication: 48,
        design: 45,
      };

      const prioritizedSkills = resume.skills
        .map(s => ({ skill: s, demand: demandMap[s.toLowerCase()] || 0 }))
        .filter(({ demand }) => demand > 0)
        .sort((a, b) => b.demand - a.demand)
        .slice(0, 8)
        .map(({ skill }) => skill);

      setProfileEnhancerOutput({
        linkedinHeadline,
        shortBio,
        prioritizedSkills,
      });
      setProfileEnhancerLoading(false);
    }, 700);
  };

  if (activeSection === "upload") {
    return (
      <div className={`h-full overflow-y-auto ${compactMode ? 'p-4' : 'p-8'} bg-dark-bg`}>
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Upload Resume</h2>
            <p className="text-gray-300">Upload your existing resume to get started</p>
          </div>
          <Card glow="purple">
            <Upload onParsed={onUploadParsed} />
          </Card>
        </div>
      </div>
    );
  }

  if (activeSection === "templates") {
    const templateKeys: TemplateType[] = [
      "simple", "professional", "creative", "modern", "minimal", "executive", "academic", "technical",
      "portfolio", "bold", "clean", "compact", "elegant", "classic", "stylish", "fresh", "sharp",
      "zen", "focus", "vivid", "sleek", "smart", "dynamic", "elite",
    ];

    return (
      <div className={`h-full overflow-y-auto ${compactMode ? 'p-4' : 'p-8'} bg-dark-bg`}>
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Templates</h2>
              <p className="text-gray-300">Choose a template that matches your style</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-300 mt-2">
              <input
                type="checkbox"
                checked={optimizeLayoutOrder}
                onChange={(e) => onOptimizeLayoutOrderChange(e.target.checked)}
                className="rounded border-dark-border bg-dark-card text-primary focus:ring-primary"
              />
              Optimize layout order
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {templateKeys.map((tpl) => (
              <Card
                key={tpl}
                glow={template === tpl ? "purple" : "blue"}
                className={`group ${template === tpl ? "ring-2 ring-primary/80" : ""}`}
                onClick={() => onTemplateChange(tpl)}
              >
                <div
                  className="aspect-[210/297] mb-2 transform origin-top group-hover:scale-105 transition-transform bg-dark-surface rounded-lg border border-dark-border overflow-hidden"
                >
                  <div className="scale-[0.32] origin-top-left pointer-events-none">
                    <A4Preview>
                      <TemplateSwitcher
                        selected={tpl}
                        onChange={() => {}}
                        resume={resume}
                        previewOnly
                        sectionOrder={effectiveSectionOrder}
                      />
                    </A4Preview>
                  </div>
                </div>
                <h3 className="font-semibold text-white">
                  {tpl.charAt(0).toUpperCase() + tpl.slice(1)}
                </h3>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "job-match") {
    return (
      <div className={`h-full overflow-y-auto ${compactMode ? 'p-4' : 'p-8'} bg-dark-bg`}>
        <div className={`max-w-3xl mx-auto animate-fade-in ${compactMode ? 'space-y-4' : 'space-y-6'}`}>
          <div className="mb-2">
            <h2 className="text-3xl font-bold text-white mb-2">Job Match</h2>
            <p className="text-gray-300">Match your resume to a job description</p>
          </div>
          <Card glow="purple">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Job Description
                </label>
                <textarea
                  rows={10}
                  spellCheck={spellCheckEnabled}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                  placeholder="Paste the job description here..."
                />
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={analyzeJobMatch}>
                  {jobMatchLoading ? 'Analyzing…' : 'Analyze'}
                </Button>
              </div>

              {jobMatchError && (
                <div className="text-sm text-red-300">{jobMatchError}</div>
              )}

              {jobMatchResult && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">ATS Match Score</div>
                      <div className="text-sm text-gray-200">{jobMatchResult.score}%</div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out flex items-center justify-center text-xs font-semibold"
                        style={{
                          width: `${jobMatchResult.score}%`,
                          background:
                            jobMatchResult.score >= 80
                              ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                              : jobMatchResult.score >= 60
                              ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                              : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                        }}
                      >
                        {jobMatchResult.score > 10 ? `${jobMatchResult.score}%` : ''}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400">
                        {jobMatchResult.score >= 80
                          ? 'Strong match'
                          : jobMatchResult.score >= 60
                          ? 'Good match'
                          : jobMatchResult.score >= 40
                          ? 'Partial match'
                          : 'Low match'}
                      </div>
                      {jobMatchResult.roleHint && (
                        <div className="text-[11px] text-gray-400/90">
                          {jobMatchResult.roleHint}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-dark-border bg-dark-surface/50">
                      <div className="text-sm font-semibold text-white mb-2">Matched keywords</div>
                      <div className="flex flex-wrap gap-2">
                        {jobMatchResult.matched.length === 0 ? (
                          <span className="text-xs text-gray-400">None detected</span>
                        ) : (
                          jobMatchResult.matched.map((k) => (
                            <span
                              key={k}
                              className="px-2 py-1 rounded-full text-xs border"
                              style={{
                                background: `linear-gradient(135deg, var(--color-primary)20 0%, var(--color-secondary)20 100%)`,
                                borderColor: `var(--color-primary)50`,
                              }}
                            >
                              {k}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-dark-border bg-dark-surface/50">
                      <div className="text-sm font-semibold text-white mb-2">Missing keywords</div>
                      <div className="flex flex-wrap gap-2">
                        {jobMatchResult.missing.length === 0 ? (
                          <span className="text-xs text-gray-400">Looks good</span>
                        ) : (
                          jobMatchResult.missing.map((k) => (
                            <span
                              key={k}
                              className="px-2 py-1 rounded-full text-xs border border-orange-500/40 text-orange-300"
                              style={{ backgroundColor: '#7c2d12' }}
                            >
                              {k}
                            </span>
                          ))
                        )}
                      </div>

                      {jobMatchResult.missing.length > 0 && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const existing = new Set((resume.skills ?? []).map((s) => s.toLowerCase()));
                              const toAdd = jobMatchResult.missing
                                .slice(0, 12)
                                .filter((k) => !existing.has(k.toLowerCase()));
                              if (toAdd.length === 0) return;
                              onResumeChange({
                                ...resume,
                                skills: [...(resume.skills ?? []), ...toAdd],
                              });
                            }}
                          >
                            Add missing to Skills
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    Tip: use matched keywords naturally in Summary/Experience. Don’t keyword-stuff.
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (activeSection === "multi-job-match") {
    return (
      <div className={`h-full overflow-y-auto ${compactMode ? 'p-4' : 'p-8'} bg-dark-bg`}>
        <div className={`max-w-3xl mx-auto animate-fade-in ${compactMode ? 'space-y-4' : 'space-y-6'}`}>
          <MultiJobMatchDashboard
            resume={resume}
            onResumeChange={onResumeChange}
            spellCheckEnabled={spellCheckEnabled}
          />
        </div>
      </div>
    );
  }

  if (activeSection === "settings") {
    return (
      <div className={`h-full overflow-y-auto ${compactMode ? 'p-4' : 'p-8'} bg-dark-bg`}>
        <div className={`max-w-3xl mx-auto animate-fade-in ${compactMode ? 'space-y-4' : 'space-y-6'}`}>
          <div className="mb-2">
            <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
            <p className="text-gray-300">Appearance and account</p>
          </div>

          <Card glow="blue">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-white">Appearance</div>
                <div className="text-sm text-gray-300">Theme and colors</div>
              </div>
              <div className="flex items-center gap-3">
                <ThemePicker />
                <ThemeSwitcher />
              </div>
            </div>
          </Card>

          <Card glow="gold">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-white">Auto-save</div>
                  <div className="text-sm text-gray-300 truncate">
                    {user ? autoSaveStatus || "Idle" : "Sign in to enable auto-save"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSaveEnabled((v) => !v)}
                  disabled={!user}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSaveEnabled ? "" : "bg-gray-400"
                  }`}
                  style={autoSaveEnabled ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoSaveEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Interval (seconds)</div>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={autoSaveIntervalSec}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n) && n > 0) setAutoSaveIntervalSec(n);
                  }}
                  disabled={!user}
                  className="w-28 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!user}
                  onClick={async () => {
                    try {
                      setAutoSaveStatus("Saving...");
                      await ApiService.saveResume(latestResumeRef.current);
                      const t = new Date();
                      const hh = String(t.getHours()).padStart(2, "0");
                      const mm = String(t.getMinutes()).padStart(2, "0");
                      const ss = String(t.getSeconds()).padStart(2, "0");
                      setAutoSaveStatus(`Saved at ${hh}:${mm}:${ss}`);
                    } catch {
                      setAutoSaveStatus("Save failed");
                    }
                  }}
                >
                  Save now
                </Button>
              </div>
            </div>
          </Card>

          <Card glow="blue">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-white">Resume data</div>
                <div className="text-sm text-gray-300">Import/export and reset</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onResumeChange(SAMPLE_RESUME);
                  }}
                >
                  Reset to sample
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(resume, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "resume.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export JSON
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => importInputRef.current?.click()}
                >
                  Import JSON
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowExportWizard(true)}
                >
                  Export / Print
                </Button>
              </div>

              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const parsed = JSON.parse(String(reader.result)) as ResumeData;
                      onResumeChange(parsed);
                    } catch {
                      alert("Invalid JSON file");
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = "";
                }}
              />
            </div>
          </Card>

          <Card glow="purple">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-white">PDF export options</div>
                <div className="text-sm text-gray-300">Page size, margins, scale</div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Page size</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSize("A4")}
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      pageSize === "A4"
                        ? "bg-white text-dark-bg border-white"
                        : "bg-dark-surface border-dark-border text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    A4
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSize("Letter")}
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      pageSize === "Letter"
                        ? "bg-white text-dark-bg border-white"
                        : "bg-dark-surface border-dark-border text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    Letter
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Margins (mm)</div>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={1}
                  value={marginMm}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n) && n >= 0 && n <= 50) setMarginMm(n);
                  }}
                  className="w-28 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Scale (%)</div>
                <input
                  type="number"
                  min={50}
                  max={150}
                  step={5}
                  value={scalePercent}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n) && n >= 50 && n <= 150) setScalePercent(n);
                  }}
                  className="w-28 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>
            </div>
          </Card>

          <Card glow="blue">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-white">Template defaults</div>
                <div className="text-sm font-semibold text-white">Default template</div>
                <div className={`grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 max-h-48 overflow-y-auto pr-1`}>
                {allTemplateNames.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => setDefaultTemplate(tpl)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      defaultTemplate === tpl
                        ? "text-white shadow-sm"
                        : "bg-dark-card text-gray-300 border border-dark-border hover:bg-dark-surface hover:text-white"
                    }`}
                    style={defaultTemplate === tpl ? {
                      background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
                      boxShadow: `0 0 20px ${getComputedStyle(document.documentElement).getPropertyValue('--color-primary')}40`
                    } : undefined}
                  >
                    {tpl.charAt(0).toUpperCase() + tpl.slice(1)}
                  </button>
                ))}
              </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">Remember last template</div>
                  <div className="text-xs text-gray-400">Always use the last selected template on reload</div>
                </div>
                <button
                  type="button"
                  onClick={() => setRememberLastTemplate((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    rememberLastTemplate ? "" : "bg-gray-400"
                  }`}
                  style={rememberLastTemplate ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      rememberLastTemplate ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          <Card glow="gold">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-white">Editor preferences</div>
                <div className="text-sm text-gray-300">Spellcheck, compact mode, and auto-save on edit</div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">Auto-save on edit</div>
                  <div className="text-xs text-gray-400">Save shortly after you stop typing</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSaveOnEdit((v) => !v)}
                  disabled={!user}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSaveOnEdit ? "" : "bg-gray-400"
                  }`}
                  style={autoSaveOnEdit ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoSaveOnEdit ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Auto-save delay (ms)</div>
                <input
                  type="number"
                  min={300}
                  max={10000}
                  step={100}
                  value={autoSaveOnEditDelayMs}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n) && n >= 300 && n <= 10000) setAutoSaveOnEditDelayMs(n);
                  }}
                  disabled={!user}
                  className="w-28 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">Spellcheck</div>
                  <div className="text-xs text-gray-400">Browser spellcheck in text fields</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSpellCheckEnabled((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    spellCheckEnabled ? "" : "bg-gray-400"
                  }`}
                  style={spellCheckEnabled ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      spellCheckEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Compact mode</div>
                <button
                  type="button"
                  onClick={() => setCompactMode((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    compactMode ? "" : "bg-gray-400"
                  }`}
                  style={compactMode ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      compactMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Autosave on edit</div>
                <button
                  type="button"
                  onClick={() => setAutoSaveOnEdit((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSaveOnEdit ? "" : "bg-gray-400"
                  }`}
                  style={autoSaveOnEdit ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoSaveOnEdit ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          <Card glow="gold">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-white">Privacy</div>
                <div className="text-sm text-gray-300">Clear local data and reset app settings</div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const ok = window.confirm('Sign out and clear local auth?');
                    if (!ok) return;
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    signOut();
                    window.dispatchEvent(new Event('authUpdate'));
                  }}
                >
                  Sign out & clear auth
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const ok = window.confirm('Reset settings (PDF export, templates, autosave, theme)?');
                    if (!ok) return;

                    const keys = [
                      'pdfPageSize',
                      'pdfMarginMm',
                      'pdfScalePercent',
                      'defaultTemplate',
                      'rememberLastTemplate',
                      'lastTemplate',
                      'editorSpellcheck',
                      'editorCompactMode',
                      'autoSaveOnEdit',
                      'autoSaveOnEditDelayMs',
                      'autoSaveEnabled',
                      'autoSaveIntervalSec',
                      'theme',
                      'colorTheme',
                    ];
                    keys.forEach((k) => localStorage.removeItem(k));

                    setPageSize('A4');
                    setMarginMm(15);
                    setScalePercent(100);
                    setDefaultTemplate('simple');
                    setRememberLastTemplate(false);
                    setSpellCheckEnabled(true);
                    setCompactMode(false);
                    setAutoSaveOnEdit(false);
                    setAutoSaveOnEditDelayMs(1500);
                    setAutoSaveEnabled(false);
                    setAutoSaveIntervalSec(30);
                    setAutoSaveStatus('');

                    window.location.reload();
                  }}
                >
                  Reset settings
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const ok = window.confirm('Clear all local app data (this will sign you out) and reload?');
                    if (!ok) return;
                    localStorage.clear();
                    try {
                      sessionStorage.clear();
                    } catch {
                      // ignore
                    }
                    window.location.reload();
                  }}
                >
                  Clear local data
                </Button>
              </div>
            </div>
          </Card>

          <Card glow="purple">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-white">Account security</div>
                <div className="text-sm text-gray-300">Manage your password, emails, and delete your account using the profile menu in the top right corner.</div>
              </div>
            </div>
          </Card>

          <Card glow="purple">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-white">Account</div>
                <div className="text-sm text-gray-300 truncate">{user?.email ?? 'Not signed in'}</div>
              </div>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-dark-bg">
      <div className={`max-w-3xl mx-auto ${compactMode ? 'p-4 space-y-4' : 'p-8 space-y-6'}`}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Edit Content</h2>
            <p className="text-gray-300">Customize your resume sections</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeveloperMode(!developerMode)}
          >
            {developerMode ? "Hide" : "Developer Mode"}
          </Button>
        </div>

        {developerMode && (
          <Card glow="gold" className="mb-6 animate-slide-up">
            <label className="block text-sm font-semibold text-white mb-2">
              Resume JSON (Advanced)
            </label>
            <textarea
              value={JSON.stringify(resume, null, 2)}
              spellCheck={spellCheckEnabled}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value) as ResumeData;
                  onResumeChange(parsed);
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              rows={12}
              className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Edit JSON directly..."
            />
          </Card>
        )}

        {/* Profile Card */}
        <Card glow={expandedSections.has("profile") ? "purple" : false}>
          <button
            type="button"
            onClick={() => toggleSection("profile")}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-white">Profile</h3>
            <svg
              className={`w-5 h-5 text-gray-300 transition-transform ${
                expandedSections.has("profile") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has("profile") && (
            <div className="mt-6 pt-6 border-t border-dark-border animate-fade-in space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={resume.name}
                  spellCheck={spellCheckEnabled}
                  onChange={(e) => onResumeChange({ ...resume, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact</label>
                <input
                  type="text"
                  value={resume.contact}
                  spellCheck={spellCheckEnabled}
                  onChange={(e) => onResumeChange({ ...resume, contact: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Summary Card */}
        <Card glow={expandedSections.has("summary") ? "blue" : false}>
          <button
            type="button"
            onClick={() => toggleSection("summary")}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-white">Summary</h3>
            <svg
              className={`w-5 h-5 text-gray-300 transition-transform ${
                expandedSections.has("summary") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has("summary") && (
            <div className="mt-6 pt-6 border-t border-dark-border animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">Summary</label>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const result = checkGrammar(resume.summary);
                      setGrammarResults(prev => new Map(prev).set('summary', result));
                      setGrammarOpen('summary');
                    }}
                  >
                    Check grammar
                  </Button>
                </div>
              </div>
              <textarea
                value={resume.summary}
                spellCheck={spellCheckEnabled}
                onChange={(e) => onResumeChange({ ...resume, summary: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
                placeholder="Write a brief professional summary..."
              />

              {grammarOpen === 'summary' && grammarResults.get('summary') && (
                <div className="mt-4 p-4 rounded-lg border border-dark-border bg-dark-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Grammar issues</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setGrammarOpen(null)}
                    >
                      Close
                    </Button>
                  </div>
                  {grammarResults.get('summary')!.issues.length === 0 ? (
                    <div className="text-xs text-green-400">No issues found.</div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {grammarResults.get('summary')!.issues.map((issue, idx) => (
                        <div key={idx} className="p-2 rounded border border-dark-border bg-dark-surface/50">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="text-xs text-gray-200 mb-1">{issue.message}</div>
                              <div className="text-xs text-gray-400">
                                Type: {issue.type} | Severity: {issue.severity}
                              </div>
                            </div>
                            {issue.suggestion && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  const fixed = applyGrammarFix(resume.summary, issue);
                                  onResumeChange({ ...resume, summary: fixed });
                                  setGrammarResults(prev => {
                                    const next = new Map(prev);
                                    next.set('summary', checkGrammar(fixed));
                                    return next;
                                  });
                                }}
                              >
                                Apply fix
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* AI Assistant Card */}
        <Card glow="purple">
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-white">AI Resume Assistant</div>
              <div className="text-sm text-gray-300">Rewrite bullets, generate summary, skill gap analysis</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={aiAssistantLoading}
                onClick={() => runAiAssistant('rewrite')}
              >
                Rewrite bullets
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={aiAssistantLoading}
                onClick={() => runAiAssistant('summary')}
              >
                Generate summary
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={aiAssistantLoading}
                onClick={() => runAiAssistant('skillgap')}
              >
                Skill gap analysis
              </Button>
            </div>

            {aiAssistantLoading && (
              <div className="flex items-center gap-2 text-xs text-accent-purple">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Thinking...</span>
              </div>
            )}

            {aiAssistantOutput && (
              <div className="p-3 rounded-lg border border-dark-border bg-dark-surface/50">
                <pre className="whitespace-pre-wrap text-xs text-gray-200 font-mono">{aiAssistantOutput}</pre>
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(aiAssistantOutput);
                    }}
                  >
                    Copy
                  </Button>
                  {aiAssistantOutput.includes('Summary:') && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const summary = aiAssistantOutput.replace('Summary:', '').trim();
                        onResumeChange({ ...resume, summary });
                      }}
                    >
                      Use as Summary
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* AI Template Optimizer Card */}
        <Card glow="gold">
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-white">AI Template Optimizer</div>
              <div className="text-sm text-gray-300">ATS checks, readability score, section recommendations</div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                disabled={optimizerLoading}
                onClick={runOptimizer}
              >
                {optimizerLoading ? 'Analyzing…' : 'Optimize Resume'}
              </Button>
            </div>

            {optimizerLoading && (
              <div className="flex items-center gap-2 text-xs text-accent-purple">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Optimizing...</span>
              </div>
            )}

            {optimizerResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border border-dark-border bg-dark-surface/50">
                    <div className="text-sm font-semibold text-white mb-2">Readability Score</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-white">{optimizerResult.readabilityScore}</div>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        optimizerResult.readabilityGrade === 'A' ? 'bg-green-600 text-white' :
                        optimizerResult.readabilityGrade === 'B' ? 'bg-yellow-600 text-white' :
                        optimizerResult.readabilityGrade === 'C' ? 'bg-orange-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        Grade {optimizerResult.readabilityGrade}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {optimizerResult.readabilityGrade === 'A' ? 'Clear and concise' :
                       optimizerResult.readabilityGrade === 'B' ? 'Mostly clear' :
                       optimizerResult.readabilityGrade === 'C' ? 'A bit wordy' :
                       'Too long/complex'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-dark-border bg-dark-surface/50">
                    <div className="text-sm font-semibold text-white mb-2">ATS Warnings</div>
                    {optimizerResult.atsWarnings.length === 0 ? (
                      <div className="text-xs text-green-300">No ATS issues detected</div>
                    ) : (
                      <ul className="text-xs text-orange-300 list-disc list-inside space-y-1">
                        {optimizerResult.atsWarnings.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    )}
                  </div>
                </div>

                {optimizerResult.sectionRecommendations.length > 0 && (
                  <div className="p-3 rounded-lg border border-dark-border bg-dark-surface/50">
                    <div className="text-sm font-semibold text-white mb-2">Section Recommendations</div>
                    <ul className="text-xs text-gray-300 list-disc list-inside space-y-1">
                      {optimizerResult.sectionRecommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card glow="purple">
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-white">Similarity Detector</div>
              <div className="text-sm text-gray-300">Detect repeated/boilerplate lines across sections (TF-IDF cosine similarity)</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between gap-4 md:col-span-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">Threshold</div>
                  <div className="text-xs text-gray-400">Higher = stricter (try 0.82–0.90)</div>
                </div>
                <input
                  type="number"
                  min={0.5}
                  max={0.99}
                  step={0.01}
                  value={similarityThreshold}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n)) return;
                    setSimilarityThreshold(Math.min(0.99, Math.max(0.5, n)));
                    setSimilarityResult(null);
                  }}
                  className="w-28 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-200">
                <input
                  type="checkbox"
                  checked={similarityCompareWithin}
                  onChange={(e) => {
                    setSimilarityCompareWithin(e.target.checked);
                    setSimilarityResult(null);
                  }}
                  className="rounded border-dark-border bg-dark-card text-primary focus:ring-primary"
                />
                Compare within same section
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const result = scanResumeSimilarity(resume, {
                    threshold: similarityThreshold,
                    compareWithinSameGroup: similarityCompareWithin,
                  });
                  setSimilarityResult(result);
                }}
              >
                Scan
              </Button>
              {similarityResult && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSimilarityResult(null)}
                >
                  Clear
                </Button>
              )}
            </div>

            {similarityResult && (
              <div className="space-y-3">
                <div className="text-xs text-gray-400">
                  Scanned {similarityResult.items.length} lines. Found {similarityResult.warnings.length} similar pair{similarityResult.warnings.length === 1 ? '' : 's'}.
                </div>

                {similarityResult.warnings.length === 0 ? (
                  <div className="text-xs text-green-300">No “too similar” lines detected at this threshold.</div>
                ) : (
                  <div className="space-y-3">
                    {similarityResult.warnings.map((w, idx) => (
                      <div
                        key={`${w.a.id}__${w.b.id}__${idx}`}
                        className="p-3 rounded-lg border border-dark-border bg-dark-surface/50 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs font-semibold text-orange-300">
                            {Math.round(w.similarity * 100)}% similar
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(`${w.a.text}\n\n---\n\n${w.b.text}`);
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {w.a.label} vs {w.b.label}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="text-xs text-gray-200 whitespace-pre-wrap">{w.a.text}</div>
                          <div className="text-xs text-gray-200 whitespace-pre-wrap">{w.b.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* AI Interview Prep Card */}
        <Card glow="blue">
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-white">AI Interview Prep</div>
              <div className="text-sm text-gray-300">Generate interview questions, STAR answers, recruiter questions</div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                disabled={interviewPrepLoading}
                onClick={runInterviewPrep}
              >
                {interviewPrepLoading ? 'Prepping…' : 'Generate Interview Prep'}
              </Button>
            </div>

            {interviewPrepLoading && (
              <div className="flex items-center gap-2 text-xs text-accent-purple">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating questions...</span>
              </div>
            )}

            {interviewPrepResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border border-dark-border bg-dark-surface/50">
                    <div className="text-sm font-semibold text-white mb-2">Practice Questions</div>
                    <ul className="text-xs text-gray-300 list-disc list-inside space-y-1">
                      {interviewPrepResult.questions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border border-dark-border bg-dark-surface/50">
                    <div className="text-sm font-semibold text-white mb-2">Likely Recruiter Questions</div>
                    <ul className="text-xs text-gray-300 list-disc list-inside space-y-1">
                      {interviewPrepResult.recruiterQuestions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>
                </div>

                {interviewPrepResult.starAnswers.length > 0 && (
                  <div className="p-3 rounded-lg border border-dark-border bg-dark-surface/50">
                    <div className="text-sm font-semibold text-white mb-2">STAR Method Answers</div>
                    <div className="space-y-2">
                      {interviewPrepResult.starAnswers.map((a, i) => (
                        <div key={i} className="text-xs text-gray-300">
                          <strong>Q{i + 1}:</strong> {a}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card glow="gold">
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-white">Recruiter Outreach Generator</div>
              <div className="text-sm text-gray-300">Generate short LinkedIn/email cold outreach messages</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">Channel</div>
                  <div className="text-xs text-gray-400">Choose where you will send the message</div>
                </div>
                <select
                  value={outreachChannel}
                  onChange={(e) => {
                    setOutreachChannel(e.target.value as OutreachChannel);
                    setOutreachVariants(null);
                  }}
                  className="px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <input
                type="text"
                value={outreachRecruiterName}
                onChange={(e) => {
                  setOutreachRecruiterName(e.target.value);
                  setOutreachVariants(null);
                }}
                placeholder="Recruiter name (optional)"
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
              />

              <input
                type="text"
                value={outreachCompany}
                onChange={(e) => {
                  setOutreachCompany(e.target.value);
                  setOutreachVariants(null);
                }}
                placeholder="Company (optional)"
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
              />

              <input
                type="text"
                value={outreachRole}
                onChange={(e) => {
                  setOutreachRole(e.target.value);
                  setOutreachVariants(null);
                }}
                placeholder="Role / Position (optional)"
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
              />

              <input
                type="text"
                value={outreachJobLink}
                onChange={(e) => {
                  setOutreachJobLink(e.target.value);
                  setOutreachVariants(null);
                }}
                placeholder="Job link (optional)"
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all md:col-span-2"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const variants = generateOutreachVariants(resume, {
                    channel: outreachChannel,
                    recruiterName: outreachRecruiterName,
                    company: outreachCompany,
                    role: outreachRole,
                    jobLink: outreachJobLink,
                  });
                  setOutreachVariants(variants);
                }}
              >
                Generate messages
              </Button>
            </div>

            {outreachVariants && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['formal', 'short', 'enthusiastic'] as const).map((tone) => {
                  const msg = outreachVariants[tone];
                  const title = tone === 'formal' ? 'Formal' : tone === 'short' ? 'Short' : 'Enthusiastic';
                  const copyText = msg.subject ? `Subject: ${msg.subject}\n\n${msg.body}` : msg.body;

                  return (
                    <div key={tone} className="p-3 rounded-lg border border-dark-border bg-dark-surface/50 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-white">{title}</div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(copyText);
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      {msg.subject && (
                        <div className="text-xs text-gray-200">
                          <strong>Subject:</strong> {msg.subject}
                        </div>
                      )}
                      <pre className="whitespace-pre-wrap text-xs text-gray-200 font-serif">{msg.body}</pre>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card glow="green">
          {(() => {
            const starScoring = scoreStarAnswer(starAnswerDraft);

            return (
              <div className="space-y-4">
                <div>
                  <div className="text-lg font-semibold text-white">STAR Answer Scorer</div>
                  <div className="text-sm text-gray-300">Score your answer for Situation, Task, Action, Result completeness</div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Your answer</label>
                  <textarea
                    rows={6}
                    spellCheck={spellCheckEnabled}
                    value={starAnswerDraft}
                    onChange={(e) => setStarAnswerDraft(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    style={{ backgroundColor: '#111111', color: '#fafafa' }}
                    placeholder="Paste your interview answer here..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">STAR Score</div>
                    <div className="text-sm text-gray-200">{starScoring.score}%</div>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 ease-out flex items-center justify-center text-xs font-semibold"
                      style={{
                        width: `${starScoring.score}%`,
                        background:
                          starScoring.score >= 80
                            ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                            : starScoring.score >= 60
                            ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                            : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                      }}
                    >
                      {starScoring.score > 10 ? `${starScoring.score}%` : ''}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    {starScoring.score >= 80
                      ? 'Complete STAR structure'
                      : starScoring.score >= 60
                      ? 'Mostly complete'
                      : starScoring.score >= 40
                      ? 'Needs stronger structure'
                      : 'Missing key STAR parts'}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(["situation", "task", "action", "result"] as const).map((k) => (
                      <div
                        key={k}
                        className={`px-2 py-2 rounded-lg border border-dark-border bg-dark-surface/50`}
                      >
                        <div className="text-[11px] text-gray-400 capitalize">{k}</div>
                        <div className={`text-xs font-semibold ${starScoring.components[k].present ? 'text-green-300' : 'text-orange-300'}`}>
                          {starScoring.components[k].present ? 'Present' : 'Missing'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-dark-border bg-dark-surface/50 space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-white mb-2">What’s missing</div>
                    {starScoring.missing.length === 0 ? (
                      <div className="text-xs text-green-300">Looks complete.</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {starScoring.missing.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-1 rounded bg-red-600/20 border border-red-600/30 text-xs text-red-200 capitalize"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {starScoring.hints.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-white mb-2">Hints</div>
                      <ul className="text-xs text-gray-300 list-disc list-inside space-y-1">
                        {starScoring.hints.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setStarAnswerDraft('')}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            );
          })()}
        </Card>

        {/* AI Cover Letter Builder Card */}
        <Card glow="purple">
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-white">AI Cover Letter Builder</div>
              <div className="text-sm text-gray-300">Generate a cover letter using your resume and the job description</div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">Tone</div>
                <div className="text-xs text-gray-400">Choose writing style</div>
              </div>
              <select
                value={coverLetterTone}
                onChange={(e) => setCoverLetterTone(e.target.value as 'formal' | 'casual' | 'enthusiastic')}
                className="px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                disabled={coverLetterLoading}
                onClick={generateCoverLetter}
              >
                {coverLetterLoading ? 'Generating…' : 'Generate Cover Letter'}
              </Button>
            </div>

            {coverLetterLoading && (
              <div className="flex items-center gap-2 text-xs text-accent-purple">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Writing your cover letter...</span>
              </div>
            )}

            {coverLetterOutput && (
              <div className="p-3 rounded-lg border border-dark-border bg-dark-surface/50">
                <pre className="whitespace-pre-wrap text-xs text-gray-200 font-serif">{coverLetterOutput}</pre>
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(coverLetterOutput);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* AI Profile Enhancer Card */}
        <Card glow="blue">
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-white">AI Profile Enhancer</div>
              <div className="text-sm text-gray-300">LinkedIn headline, bio shortener, skills prioritization</div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                disabled={profileEnhancerLoading}
                onClick={runProfileEnhancer}
              >
                {profileEnhancerLoading ? 'Enhancing…' : 'Enhance Profile'}
              </Button>
            </div>

            {profileEnhancerLoading && (
              <div className="flex items-center gap-2 text-xs text-accent-purple">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Enhancing...</span>
              </div>
            )}

            {profileEnhancerOutput && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border border-dark-border bg-dark-surface/50">
                    <div className="text-sm font-semibold text-white mb-2">LinkedIn Headline</div>
                    <div className="text-xs text-gray-200 font-mono">{profileEnhancerOutput.linkedinHeadline}</div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(profileEnhancerOutput.linkedinHeadline);
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-dark-border bg-dark-surface/50">
                    <div className="text-sm font-semibold text-white mb-2">Short Bio (≤280 chars)</div>
                    <div className="text-xs text-gray-200">{profileEnhancerOutput.shortBio}</div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(profileEnhancerOutput.shortBio);
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-dark-border bg-dark-surface/50">
                  <div className="text-sm font-semibold text-white mb-2">Prioritized Skills (by demand)</div>
                  <div className="flex flex-wrap gap-2">
                    {profileEnhancerOutput.prioritizedSkills.length === 0 ? (
                      <span className="text-xs text-gray-400">No prioritizable skills detected</span>
                    ) : (
                      profileEnhancerOutput.prioritizedSkills.map((s, i) => (
                        <span
                          key={s}
                          className="px-2 py-1 rounded-full text-xs border"
                          style={{
                            background: `linear-gradient(135deg, var(--color-primary)20 0%, var(--color-secondary)20 100%)`,
                            borderColor: `var(--color-primary)50`,
                          }}
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Skills are ranked by estimated market demand (higher = more in-demand)
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Skills Card */}
        <Card glow={expandedSections.has("skills") ? "gold" : false}>
          <button
            type="button"
            onClick={() => toggleSection("skills")}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-white">Skills</h3>
            <svg
              className={`w-5 h-5 text-gray-300 transition-transform ${
                expandedSections.has("skills") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has("skills") && (
            <div className="mt-6 pt-6 border-t border-dark-border animate-fade-in">
              <input
                type="text"
                value={resume.skills.join(", ")}
                spellCheck={spellCheckEnabled}
                onChange={(e) => {
                  const skills = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                  onResumeChange({ ...resume, skills });
                }}
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
                placeholder="React, Node.js, Python..."
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const result = normalizeSkills(resume.skills);
                    setSkillsCleanerResult(result);
                    setSkillsCleanerOpen(true);
                  }}
                >
                  Clean skills
                </Button>

                {skillsCleanerOpen && skillsCleanerResult && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSkillsCleanerOpen(false);
                    }}
                  >
                    Close
                  </Button>
                )}

                {skillsCleanerOpen && skillsCleanerResult ? (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={skillsCleanerResult.changes.length === 0}
                    onClick={() => {
                      onResumeChange({ ...resume, skills: skillsCleanerResult.skills });
                      setSkillsCleanerOpen(false);
                    }}
                  >
                    Apply
                  </Button>
                ) : null}
              </div>

              {skillsCleanerOpen && skillsCleanerResult && (
                <div className="mt-4 p-4 rounded-lg border border-dark-border bg-dark-card">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">Skill cleanup suggestions</p>
                      <p className="text-[11px] text-gray-400">
                        {skillsCleanerResult.changes.length === 0
                          ? "No duplicates or aliases detected."
                          : `${skillsCleanerResult.changes.length} suggested change(s) · ${resume.skills.length} -> ${skillsCleanerResult.skills.length}`}
                      </p>
                    </div>
                  </div>

                  {skillsCleanerResult.changes.length > 0 ? (
                    <div className="mt-3 max-h-56 overflow-auto space-y-2">
                      {skillsCleanerResult.changes.map((c, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <div className="text-xs text-gray-200">
                            <span className="font-semibold text-white">{c.from}</span>
                            <span className="text-gray-400"> {'->'} </span>
                            <span className="font-semibold text-white">{c.to}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase">
                            {c.action === 'remove_duplicate' ? 'duplicate' : c.method}
                            {typeof c.score === 'number' ? ` (${c.score.toFixed(2)})` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-300 mb-2">Result</p>
                    <div className="flex flex-wrap gap-2">
                      {skillsCleanerResult.skills.map((skill, idx) => (
                        <span
                          key={`${skill}-${idx}`}
                          className="px-3 py-1 border rounded-full text-xs text-white"
                          style={{
                            background: `linear-gradient(135deg, var(--color-primary)20 0%, var(--color-secondary)20 100%)`,
                            borderColor: `var(--color-primary)50`,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {resume.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 border rounded-full text-xs text-white"
                    style={{
                      background: `linear-gradient(135deg, var(--color-primary)20 0%, var(--color-secondary)20 100%)`,
                      borderColor: `var(--color-primary)50`
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Experience Card */}
        <Card glow={expandedSections.has("experience") ? "purple" : false}>
          <button
            type="button"
            onClick={() => toggleSection("experience")}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-white">Experience</h3>
            <svg
              className={`w-5 h-5 text-gray-300 transition-transform ${
                expandedSections.has("experience") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has("experience") && (
            <div className="mt-6 pt-6 border-t border-dark-border animate-fade-in space-y-4">
              {resume.experience.map((exp, idx) => (
                <div key={idx} className="p-4 bg-dark-surface rounded-lg border border-dark-border">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => {
                        const newExp = [...resume.experience];
                        newExp[idx] = { ...exp, title: e.target.value };
                        onResumeChange({ ...resume, experience: newExp });
                      }}
                      placeholder="Job Title"
                      className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...resume.experience];
                        newExp[idx] = { ...exp, company: e.target.value };
                        onResumeChange({ ...resume, experience: newExp });
                      }}
                      placeholder="Company"
                      className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
                    />
                  </div>
                  <textarea
                    value={exp.desc}
                    onChange={(e) => {
                      const newExp = [...resume.experience];
                      newExp[idx] = { ...exp, desc: e.target.value };
                      onResumeChange({ ...resume, experience: newExp });
                    }}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
                  />

                  {parseBulletLines(exp.desc).length > 0 && (
                    <div className="mt-3 space-y-2">
                      {parseBulletLines(exp.desc).map((line) => {
                        const analysis = analyzeBulletImpact(line.content);
                        const isOpen =
                          bulletCoachOpen?.section === "experience" &&
                          bulletCoachOpen.parentIndex === idx &&
                          bulletCoachOpen.lineIndex === line.lineIndex;

                        const colorClass =
                          analysis.score >= 80
                            ? "bg-green-500"
                            : analysis.score >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500";

                        return (
                          <div
                            key={`exp-${idx}-line-${line.lineIndex}`}
                            className="p-3 rounded-lg border border-dark-border bg-dark-card/40"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2 min-w-0">
                                <span className={`mt-1 h-2 w-2 rounded-full ${colorClass}`} />
                                <div className="min-w-0">
                                  <div className="text-xs text-gray-200 break-words">
                                    {line.content}
                                  </div>
                                  <div className="mt-1 text-[11px] text-gray-400">
                                    Impact: {analysis.score}/100
                                    {analysis.issues.includes("missing_action_verb")
                                      ? " · Weak verb"
                                      : ""}
                                    {analysis.issues.includes("missing_metric")
                                      ? " · Missing metric"
                                      : ""}
                                    {analysis.issues.includes("missing_result")
                                      ? " · Missing result"
                                      : ""}
                                  </div>
                                </div>
                              </div>

                              {analysis.suggestions.length > 0 ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setBulletCoachOpen(
                                      isOpen
                                        ? null
                                        : {
                                            section: "experience",
                                            parentIndex: idx,
                                            lineIndex: line.lineIndex,
                                          }
                                    );
                                  }}
                                >
                                  Add metrics suggestions
                                </Button>
                              ) : (
                                <span className="text-[11px] text-gray-400">Looks strong</span>
                              )}
                            </div>

                            {isOpen && analysis.suggestions.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {analysis.suggestions.map((sugg, sIdx) => (
                                  <div
                                    key={`exp-${idx}-line-${line.lineIndex}-s-${sIdx}`}
                                    className="p-2 rounded-md border border-dark-border bg-dark-surface/60"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="text-xs text-gray-200 break-words">
                                        {sugg.mode === "replace"
                                          ? sugg.text
                                          : `${line.content}${sugg.text}`}
                                      </div>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                          const nextDesc = applyBulletSuggestion(
                                            exp.desc,
                                            line.lineIndex,
                                            sugg
                                          );
                                          const newExp = [...resume.experience];
                                          newExp[idx] = { ...exp, desc: nextDesc };
                                          onResumeChange({ ...resume, experience: newExp });
                                          setBulletCoachOpen(null);
                                        }}
                                      >
                                        Apply
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Education Card */}
        <Card glow={expandedSections.has("education") ? "blue" : false}>
          <button
            type="button"
            onClick={() => toggleSection("education")}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-white">Education</h3>
            <svg
              className={`w-5 h-5 text-gray-300 transition-transform ${
                expandedSections.has("education") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has("education") && (
            <div className="mt-6 pt-6 border-t border-dark-border animate-fade-in space-y-4">
              {resume.education.map((edu, idx) => (
                <div key={idx} className="p-4 bg-dark-surface rounded-lg border border-dark-border">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...resume.education];
                      newEdu[idx] = { ...edu, degree: e.target.value };
                      onResumeChange({ ...resume, education: newEdu });
                    }}
                    placeholder="Degree"
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white mb-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={edu.college}
                      onChange={(e) => {
                        const newEdu = [...resume.education];
                        newEdu[idx] = { ...edu, college: e.target.value };
                        onResumeChange({ ...resume, education: newEdu });
                      }}
                      placeholder="College"
                      className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => {
                        const newEdu = [...resume.education];
                        newEdu[idx] = { ...edu, year: e.target.value };
                        onResumeChange({ ...resume, education: newEdu });
                      }}
                      placeholder="Year"
                      className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Projects Card */}
        <Card glow={expandedSections.has("projects") ? "green" : false}>
          <button
            type="button"
            onClick={() => toggleSection("projects")}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-white">Projects</h3>
            <svg
              className={`w-5 h-5 text-gray-300 transition-transform ${
                expandedSections.has("projects") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has("projects") && (
            <div className="mt-6 pt-6 border-t border-dark-border animate-fade-in space-y-4">
              {(resume.projects || []).map((proj, idx) => (
                <div key={idx} className="p-4 bg-dark-surface rounded-lg border border-dark-border space-y-3">
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => {
                      const projects = resume.projects || [];
                      const next = [...projects];
                      next[idx] = { ...proj, name: e.target.value };
                      onResumeChange({ ...resume, projects: next });
                    }}
                    placeholder="Project name"
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
                  />
                  <textarea
                    value={proj.description}
                    onChange={(e) => {
                      const projects = resume.projects || [];
                      const next = [...projects];
                      next[idx] = { ...proj, description: e.target.value };
                      onResumeChange({ ...resume, projects: next });
                    }}
                    placeholder="Short description (what you built, impact, results)"
                    rows={3}
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const result = checkGrammar(proj.description);
                        setGrammarResults(prev => new Map(prev).set(`proj-${idx}`, result));
                        setGrammarOpen(`proj-${idx}`);
                      }}
                    >
                      Check grammar
                    </Button>
                  </div>

                  {grammarOpen === `proj-${idx}` && grammarResults.get(`proj-${idx}`) && (
                    <div className="mt-4 p-4 rounded-lg border border-dark-border bg-dark-card space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-white">Grammar issues</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setGrammarOpen(null)}
                        >
                          Close
                        </Button>
                      </div>
                      {grammarResults.get(`proj-${idx}`)!.issues.length === 0 ? (
                        <div className="text-xs text-green-400">No issues found.</div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-auto">
                          {grammarResults.get(`proj-${idx}`)!.issues.map((issue, iIdx) => (
                            <div key={iIdx} className="p-2 rounded border border-dark-border bg-dark-surface/50">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="text-xs text-gray-200 mb-1">{issue.message}</div>
                                  <div className="text-xs text-gray-400">
                                    Type: {issue.type} | Severity: {issue.severity}
                                  </div>
                                </div>
                                {issue.suggestion && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      const fixed = applyGrammarFix(proj.description, issue);
                                      const projects = resume.projects || [];
                                      const next = [...projects];
                                      next[idx] = { ...proj, description: fixed };
                                      onResumeChange({ ...resume, projects: next });
                                      setGrammarResults(prev => {
                                        const updated = new Map(prev);
                                        updated.set(`proj-${idx}`, checkGrammar(fixed));
                                        return updated;
                                      });
                                    }}
                                  >
                                    Apply fix
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {parseBulletLines(proj.description).length > 0 && (
                    <div className="space-y-2">
                      {parseBulletLines(proj.description).map((line) => {
                        const analysis = analyzeBulletImpact(line.content);
                        const isOpen =
                          bulletCoachOpen?.section === "projects" &&
                          bulletCoachOpen.parentIndex === idx &&
                          bulletCoachOpen.lineIndex === line.lineIndex;

                        const colorClass =
                          analysis.score >= 80
                            ? "bg-green-500"
                            : analysis.score >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500";

                        return (
                          <div
                            key={`proj-${idx}-line-${line.lineIndex}`}
                            className="p-3 rounded-lg border border-dark-border bg-dark-card/40"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2 min-w-0">
                                <span className={`mt-1 h-2 w-2 rounded-full ${colorClass}`} />
                                <div className="min-w-0">
                                  <div className="text-xs text-gray-200 break-words">
                                    {line.content}
                                  </div>
                                  <div className="mt-1 text-[11px] text-gray-400">
                                    Impact: {analysis.score}/100
                                    {analysis.issues.includes("missing_action_verb")
                                      ? " · Weak verb"
                                      : ""}
                                    {analysis.issues.includes("missing_metric")
                                      ? " · Missing metric"
                                      : ""}
                                    {analysis.issues.includes("missing_result")
                                      ? " · Missing result"
                                      : ""}
                                  </div>
                                </div>
                              </div>

                              {analysis.suggestions.length > 0 ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setBulletCoachOpen(
                                      isOpen
                                        ? null
                                        : {
                                            section: "projects",
                                            parentIndex: idx,
                                            lineIndex: line.lineIndex,
                                          }
                                    );
                                  }}
                                >
                                  Add metrics suggestions
                                </Button>
                              ) : (
                                <span className="text-[11px] text-gray-400">Looks strong</span>
                              )}
                            </div>

                            {isOpen && analysis.suggestions.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {analysis.suggestions.map((sugg, sIdx) => (
                                  <div
                                    key={`proj-${idx}-line-${line.lineIndex}-s-${sIdx}`}
                                    className="p-2 rounded-md border border-dark-border bg-dark-surface/60"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="text-xs text-gray-200 break-words">
                                        {sugg.mode === "replace"
                                          ? sugg.text
                                          : `${line.content}${sugg.text}`}
                                      </div>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                          const nextDesc = applyBulletSuggestion(
                                            proj.description,
                                            line.lineIndex,
                                            sugg
                                          );
                                          const projects = resume.projects || [];
                                          const next = [...projects];
                                          next[idx] = { ...proj, description: nextDesc };
                                          onResumeChange({ ...resume, projects: next });
                                          setBulletCoachOpen(null);
                                        }}
                                      >
                                        Apply
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AutocompleteInput
                      value={proj.techStack || ""}
                      onChange={(nextValue) => {
                        const projects = resume.projects || [];
                        const next = [...projects];
                        next[idx] = { ...proj, techStack: nextValue };
                        onResumeChange({ ...resume, projects: next });
                      }}
                      placeholder="Tech stack (Python, React, SQL...)"
                      className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={proj.link || ""}
                      onChange={(e) => {
                        const projects = resume.projects || [];
                        const next = [...projects];
                        next[idx] = { ...proj, link: e.target.value };
                        onResumeChange({ ...resume, projects: next });
                      }}
                      placeholder="GitHub / Demo link (optional)"
                      className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setReadmeEnhancerOpen({ projectIndex: idx });
                        setReadmeText('');
                        setReadmeEnhancerResult(null);
                      }}
                    >
                      Enhance from README
                    </Button>
                  </div>

                  {readmeEnhancerOpen?.projectIndex === idx && (
                    <div className="mt-4 p-4 rounded-lg border border-dark-border bg-dark-card space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">Enhance project from README text</p>
                        <p className="text-xs text-gray-400">Paste README markdown to extract project name, description bullets, and tech stack.</p>
                      </div>

                      <textarea
                        value={readmeText}
                        onChange={(e) => setReadmeText(e.target.value)}
                        placeholder="Paste README markdown here..."
                        rows={6}
                        className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      />

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const result = enhanceProjectFromReadme(readmeText, {
                              fallbackName: proj.name,
                              fallbackTechStack: proj.techStack,
                              maxBullets: 3,
                            });
                            setReadmeEnhancerResult(result);
                          }}
                        >
                          Parse
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReadmeEnhancerOpen(null);
                            setReadmeText('');
                            setReadmeEnhancerResult(null);
                          }}
                        >
                          Close
                        </Button>

                        {readmeEnhancerResult && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              const projects = resume.projects || [];
                              const next = [...projects];
                              next[idx] = {
                                name: readmeEnhancerResult.suggestedName || proj.name,
                                description: readmeEnhancerResult.suggestedDescription || proj.description,
                                techStack: readmeEnhancerResult.suggestedTechStack || proj.techStack,
                                link: proj.link,
                              };
                              onResumeChange({ ...resume, projects: next });
                              setReadmeEnhancerOpen(null);
                              setReadmeText('');
                              setReadmeEnhancerResult(null);
                            }}
                          >
                            Apply
                          </Button>
                        )}
                      </div>

                      {readmeEnhancerResult && (
                        <div className="space-y-3">
                          {readmeEnhancerResult.warnings.length > 0 && (
                            <div className="p-2 rounded-md border border-yellow-600/50 bg-yellow-900/20">
                              <p className="text-xs font-semibold text-yellow-400">Warnings</p>
                              <ul className="list-disc list-inside text-xs text-yellow-300 mt-1">
                                {readmeEnhancerResult.warnings.map((w, wIdx) => (
                                  <li key={wIdx}>{w}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <p className="text-xs font-semibold text-white mb-1">Suggested name</p>
                              <p className="text-xs text-gray-300 bg-dark-surface p-2 rounded border border-dark-border">
                                {readmeEnhancerResult.suggestedName || <span className="text-gray-500">No change</span>}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white mb-1">Tech stack</p>
                              <p className="text-xs text-gray-300 bg-dark-surface p-2 rounded border border-dark-border">
                                {readmeEnhancerResult.suggestedTechStack || <span className="text-gray-500">No change</span>}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white mb-1">Bullets</p>
                              <ul className="list-disc list-inside text-xs text-gray-300 bg-dark-surface p-2 rounded border border-dark-border max-h-20 overflow-auto">
                                {readmeEnhancerResult.bullets.length > 0
                                  ? readmeEnhancerResult.bullets.map((b, bIdx) => (
                                      <li key={bIdx}>{b}</li>
                                    ))
                                  : <span className="text-gray-500">None</span>}
                              </ul>
                            </div>
                          </div>

                          {readmeEnhancerResult.suggestedDescription && (
                            <div>
                              <p className="text-xs font-semibold text-white mb-1">Suggested description</p>
                              <pre className="text-xs text-gray-300 bg-dark-surface p-2 rounded border border-dark-border whitespace-pre-wrap">
                                {readmeEnhancerResult.suggestedDescription}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const projects = resume.projects || [];
                    const next = [
                      ...projects,
                      { name: '', description: '', techStack: '', link: '' },
                    ];
                    onResumeChange({ ...resume, projects: next });
                  }}
                >
                  Add project
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Personal Branding Analyzer */}
        <PersonalBrandingAnalyzer resume={resume} />
      </div>

      {/* Export Wizard */}
      <ExportWizard
        isOpen={showExportWizard}
        onClose={() => setShowExportWizard(false)}
        resume={resume}
        pageSize={pageSize}
        marginMm={marginMm}
        scalePercent={scalePercent}
        onPageSizeChange={setPageSize}
        onMarginChange={setMarginMm}
        onScaleChange={setScalePercent}
      />
    </div>
  );
};

export default EditorPanel;
