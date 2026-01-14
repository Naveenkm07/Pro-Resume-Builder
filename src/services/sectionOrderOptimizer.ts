import type { ResumeData } from "../types";
import { ROLE_TEMPLATES, type RoleTemplateId } from "./tailoring";

export type ResumeSectionId = "summary" | "skills" | "projects" | "experience" | "education";

const DEFAULT_SECTION_ORDER: ResumeSectionId[] = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
];

function uniq<T>(items: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const item of items) {
    if (!seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

function normalizeSectionOrder(order: string[] | undefined): ResumeSectionId[] {
  const allowed: ResumeSectionId[] = [
    "summary",
    "skills",
    "projects",
    "experience",
    "education",
  ];

  const filtered = uniq(
    (order || [])
      .filter((s): s is ResumeSectionId => allowed.includes(s as ResumeSectionId))
  );

  const missing = DEFAULT_SECTION_ORDER.filter((s) => !filtered.includes(s));
  return [...filtered, ...missing];
}

function parseYear(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/(19\d{2}|20\d{2})/);
  if (!match) return null;
  const year = Number(match[0]);
  return Number.isFinite(year) ? year : null;
}

export function estimateYearsOfExperience(resume: ResumeData): number {
  if (!resume.experience || resume.experience.length === 0) return 0;

  const startYears: number[] = [];
  const endYears: number[] = [];
  const nowYear = new Date().getFullYear();

  for (const exp of resume.experience) {
    const start = parseYear(exp.from);
    const end =
      exp.to && exp.to.toLowerCase().includes("present")
        ? nowYear
        : parseYear(exp.to) ?? nowYear;

    if (start) startYears.push(start);
    if (end) endYears.push(end);
  }

  if (startYears.length === 0 || endYears.length === 0) return 0;

  const minStart = Math.min(...startYears);
  const maxEnd = Math.max(...endYears);
  return Math.max(0, maxEnd - minStart);
}

function scoreKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const keyword of keywords) {
    if (lower.includes(keyword.toLowerCase())) score += 1;
  }
  return score;
}

export function inferRoleTemplateId(
  resume: ResumeData,
  roleHint?: string
): RoleTemplateId | null {
  if (roleHint && roleHint.trim()) {
    const hint = roleHint.trim().toLowerCase();
    for (const [id, tpl] of Object.entries(ROLE_TEMPLATES)) {
      if (id === hint) return id as RoleTemplateId;
      if (tpl.label.toLowerCase() === hint) return id as RoleTemplateId;
      if (tpl.label.toLowerCase().includes(hint) || hint.includes(tpl.label.toLowerCase())) {
        return id as RoleTemplateId;
      }
    }
  }

  const resumeText = [
    resume.summary,
    resume.skills.join(" "),
    resume.experience.map((e) => `${e.title} ${e.company} ${e.desc}`).join(" "),
    resume.projects.map((p) => `${p.name} ${p.description} ${p.techStack || ""}`).join(" "),
  ].join(" ");

  let best: { id: RoleTemplateId; score: number } | null = null;
  for (const [id, tpl] of Object.entries(ROLE_TEMPLATES)) {
    const score = scoreKeywords(resumeText, tpl.keywords);
    if (!best || score > best.score) {
      best = { id: id as RoleTemplateId, score };
    }
  }

  if (!best || best.score < 2) return null;
  return best.id;
}

function moveBefore(
  order: ResumeSectionId[],
  section: ResumeSectionId,
  before: ResumeSectionId
): ResumeSectionId[] {
  const next = order.filter((s) => s !== section);
  const beforeIdx = next.indexOf(before);
  if (beforeIdx === -1) return [...next, section];
  next.splice(beforeIdx, 0, section);
  return next;
}

export function getOptimizedSectionOrder(
  resume: ResumeData,
  roleHint?: string
): ResumeSectionId[] {
  const roleId = inferRoleTemplateId(resume, roleHint);
  const baseline = roleId ? ROLE_TEMPLATES[roleId]?.sectionOrder : undefined;
  let order = normalizeSectionOrder(baseline);

  const years = estimateYearsOfExperience(resume);
  const isFresher = years < 2;
  const rolePrefersProjectsFirst =
    roleId === "frontend" || roleId === "ml-engineer" || roleId === "data-scientist";

  if ((isFresher || rolePrefersProjectsFirst) && resume.projects.length > 0) {
    order = moveBefore(order, "projects", "experience");
  }

  if (isFresher && resume.education.length > 0) {
    order = moveBefore(order, "education", "experience");
  }

  return order;
}
