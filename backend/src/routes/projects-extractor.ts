import { Router } from "express";
import { z } from "zod";

const router = Router();

type Project = {
  name: string;
  description: string;
  techStack?: string;
  link?: string;
};

type ParsedProject = {
  name: string;
  descriptionParts: string[];
  techStackParts: string[];
  link?: string;
};

const schema = z.object({
  text: z.string(),
});

const toUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.toLowerCase().startsWith("http")) return trimmed;
  return `https://${trimmed}`;
};

const isProjectsHeading = (line: string): boolean => {
  const normalized = line
    .toLowerCase()
    .replace(/[:\-–—]+$/g, "")
    .trim();

  return (
    normalized === "projects" ||
    normalized === "project" ||
    normalized === "personal projects" ||
    normalized === "academic projects" ||
    normalized === "key projects"
  );
};

const otherSectionHeadings = [
  "skills",
  "technical skills",
  "experience",
  "work experience",
  "professional experience",
  "education",
  "summary",
  "profile",
  "websites",
  "websites, portfolios, profiles",
  "certifications",
  "certifications & licenses",
  "extracurricular",
  "extracurricular activities",
  "achievements",
  "activities",
  "internships",
  "internship",
];

const isOtherHeading = (line: string): boolean => {
  const lower = line
    .toLowerCase()
    .replace(/[:\-–—]+$/g, "")
    .trim();

  if (!lower) return false;
  if (isProjectsHeading(lower)) return false;

  return otherSectionHeadings.some((h) => lower === h || lower.startsWith(`${h} `));
};

const techLineRegex = /^(tech\s*stack|technologies|tools|stack)\s*[:\-–—]\s*(.+)$/i;
const inlineTechRegex = /(tech\s*stack|technologies|tools|stack)\s*[:\-–—]\s*(.+)$/i;
const urlRegex = /(https?:\/\/[^\s)\]]+|www\.[^\s)\]]+)/i;
const bulletRegex = /^\s*([-•*●▪–—])\s+/;
const numberedBulletRegex = /^\s*\d+[\).\]]\s+/;

const descriptionStartVerbs = [
  "built",
  "developed",
  "created",
  "implemented",
  "designed",
  "engineered",
  "led",
  "worked",
  "used",
  "optimized",
  "improved",
  "delivered",
  "integrated",
  "managed",
];

const isLikelyProjectHeader = (
  trimmed: string,
  raw: string,
  prevWasBullet: boolean,
  hasDescription: boolean
): boolean => {
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (techLineRegex.test(trimmed)) return false;

  if (prevWasBullet && /^\s+/.test(raw)) return false;

  if (!hasDescription) {
    const startsWithVerb = descriptionStartVerbs.some((v) => lower.startsWith(`${v} `));
    if (startsWithVerb) return false;
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > 12) return false;
  if (trimmed.length > 90) return false;

  return true;
};

const normalizeTechStack = (parts: string[]): string | undefined => {
  const joined = parts
    .flatMap((p) => p.split(/[,•;|]/))
    .map((s) => s.trim())
    .filter(Boolean);

  const deduped = Array.from(new Set(joined));
  if (!deduped.length) return undefined;
  return deduped.join(", ");
};

const addDescription = (project: ParsedProject, line: string) => {
  const cleaned = line.trim();
  if (!cleaned) return;
  project.descriptionParts.push(cleaned);
};

const extractProjectsSection = (text: string): string[] => {
  const rawLines = text.split(/\r?\n/);
  const trimmedLines = rawLines.map((l) => l.trim());

  const startIndex = trimmedLines.findIndex((l) => isProjectsHeading(l));
  if (startIndex === -1) return [];

  let endIndex = trimmedLines.length;
  for (let i = startIndex + 1; i < trimmedLines.length; i += 1) {
    const l = trimmedLines[i];
    if (!l) continue;
    if (isOtherHeading(l)) {
      endIndex = i;
      break;
    }
  }

  return rawLines.slice(startIndex + 1, endIndex);
};

const parseHeaderLine = (rawHeader: string): { name: string; desc?: string; techStackParts: string[]; link?: string } => {
  let header = rawHeader.trim();
  if (!header) return { name: "", techStackParts: [] };

  let link: string | undefined;
  const urlMatch = header.match(urlRegex);
  if (urlMatch) {
    link = toUrl(urlMatch[0]);
    header = header.replace(urlMatch[0], " ").replace(/\s+/g, " ").trim();
  }

  const techParts: string[] = [];
  const inlineTechMatch = header.match(inlineTechRegex);
  if (inlineTechMatch) {
    const tech = inlineTechMatch[2].trim();
    if (tech) techParts.push(tech);
    header = header.replace(inlineTechMatch[0], " ").replace(/\s+/g, " ").trim();
  }

  if (header.includes("|")) {
    const segments = header.split("|").map((s) => s.trim()).filter(Boolean);
    if (!segments.length) return { name: "", techStackParts: techParts, link };

    const name = segments[0];
    let desc: string | undefined;

    for (const seg of segments.slice(1)) {
      const m = seg.match(techLineRegex);
      if (m) {
        const tech = m[2].trim();
        if (tech) techParts.push(tech);
        continue;
      }
      const u = seg.match(urlRegex);
      if (u && !link) {
        link = toUrl(u[0]);
        continue;
      }
      if (!desc) desc = seg;
      else desc = `${desc} ${seg}`;
    }

    return { name, desc, techStackParts: techParts, link };
  }

  const dashSplit = header.split(/\s[–—-]\s/).map((s) => s.trim()).filter(Boolean);
  if (dashSplit.length >= 2) {
    const left = dashSplit[0];
    const right = dashSplit.slice(1).join(" - ").trim();
    if (left && right && left.length <= 60) {
      return { name: left, desc: right, techStackParts: techParts, link };
    }
  }

  const colonSplit = header.split(":").map((s) => s.trim()).filter(Boolean);
  if (colonSplit.length >= 2) {
    const left = colonSplit[0];
    const right = colonSplit.slice(1).join(": ").trim();
    if (left && right && left.length <= 60 && !techLineRegex.test(left)) {
      return { name: left, desc: right, techStackParts: techParts, link };
    }
  }

  return { name: header, techStackParts: techParts, link };
};

const buildProject = (p: ParsedProject): Project | null => {
  const name = p.name.trim();
  if (!name) return null;

  const description = p.descriptionParts
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");

  const techStack = normalizeTechStack(p.techStackParts);

  const out: Project = {
    name,
    description,
  };

  if (techStack) out.techStack = techStack;
  if (p.link) out.link = p.link;

  return out;
};

const extractProjectsFromText = (text: string): Project[] => {
  const sectionLines = extractProjectsSection(text);
  if (!sectionLines.length) return [];

  const projects: Project[] = [];
  let current: ParsedProject | null = null;
  let prevWasBullet = false;

  const flush = () => {
    if (!current) return;
    const built = buildProject(current);
    if (built) projects.push(built);
    current = null;
  };

  for (const rawLine of sectionLines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      prevWasBullet = false;
      continue;
    }

    const techMatch = trimmed.match(techLineRegex);
    if (techMatch) {
      if (current) {
        const tech = techMatch[2].trim();
        if (tech) current.techStackParts.push(tech);
      }
      prevWasBullet = false;
      continue;
    }

    const bulletMatch = rawLine.match(bulletRegex) || rawLine.match(numberedBulletRegex);
    if (bulletMatch) {
      const content = trimmed
        .replace(bulletRegex, "")
        .replace(numberedBulletRegex, "")
        .trim();

      if (!current) {
        current = { name: "Project", descriptionParts: [], techStackParts: [] };
      }

      const inlineTech = content.match(inlineTechRegex);
      if (inlineTech) {
        const tech = inlineTech[2].trim();
        if (tech) current.techStackParts.push(tech);
      } else {
        addDescription(current, content);
      }

      const u = content.match(urlRegex);
      if (u && !current.link) current.link = toUrl(u[0]);

      prevWasBullet = true;
      continue;
    }

    if (current && prevWasBullet && /^\s+/.test(rawLine)) {
      const u = trimmed.match(urlRegex);
      if (u && !current.link) {
        current.link = toUrl(u[0]);
      }
      addDescription(current, trimmed);
      prevWasBullet = true;
      continue;
    }

    const hasDescription = Boolean(current && current.descriptionParts.length);

    if (!current) {
      const parsed = parseHeaderLine(trimmed);
      current = {
        name: parsed.name,
        descriptionParts: [],
        techStackParts: parsed.techStackParts,
        link: parsed.link,
      };
      if (parsed.desc) addDescription(current, parsed.desc);
      prevWasBullet = false;
      continue;
    }

    if (isLikelyProjectHeader(trimmed, rawLine, prevWasBullet, hasDescription)) {
      flush();
      const parsed = parseHeaderLine(trimmed);
      current = {
        name: parsed.name,
        descriptionParts: [],
        techStackParts: parsed.techStackParts,
        link: parsed.link,
      };
      if (parsed.desc) addDescription(current, parsed.desc);
      prevWasBullet = false;
      continue;
    }

    const u = trimmed.match(urlRegex);
    if (u && !current.link) {
      current.link = toUrl(u[0]);
    }

    addDescription(current, trimmed);
    prevWasBullet = false;
  }

  flush();

  return projects.slice(0, 10);
};

router.post("/", (req, res) => {
  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const projects = extractProjectsFromText(validation.data.text);

  return res.json({ projects });
});

export default router;
