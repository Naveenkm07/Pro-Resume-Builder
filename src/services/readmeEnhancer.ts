
export type ReadmeEnhancementResult = {
  suggestedName: string;
  suggestedDescription: string;
  suggestedTechStack: string;
  bullets: string[];
  extractedTech: string[];
  overview: string;
  warnings: string[];
};

type EnhanceOptions = {
  fallbackName?: string;
  fallbackTechStack?: string;
  maxBullets?: number;
};

const normalizeNewlines = (s: string) => s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const stripMarkdown = (s: string): string => {
  const out = s
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return out;
};

const isBadgeLine = (line: string): boolean => {
  const l = line.trim();
  if (!l) return false;
  return /^\s*(?:\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)|!\[[^\]]*\]\([^)]*\))\s*$/.test(l);
};

const isHeadingLine = (line: string): boolean => /^\s*#{1,6}\s+/.test(line);

const headingText = (line: string): string => stripMarkdown(line.replace(/^\s*#{1,6}\s+/, '').trim());

const clamp = (s: string, max: number): string => {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1)).trim()}…`;
};

const cleanBullet = (raw: string): string => {
  const stripped = raw
    .replace(/^\s*(?:[-*+•\u2022]|\d+[.)])\s+/, '')
    .trim();
  return clamp(stripMarkdown(stripped), 180);
};

const extractTitle = (lines: string[]): { title: string; index: number } => {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]?.trim() ?? '';
    if (!line) continue;
    if (isBadgeLine(line)) continue;

    const m = line.match(/^#\s+(.+)$/);
    if (m) {
      const title = stripMarkdown(m[1]);
      return { title, index: i };
    }
  }
  return { title: '', index: -1 };
};

const extractOverview = (lines: string[], titleIndex: number): string => {
  const start = Math.max(0, titleIndex + 1);

  let i = start;
  while (i < lines.length) {
    const line = lines[i]?.trim() ?? '';
    if (!line || isBadgeLine(line)) {
      i += 1;
      continue;
    }
    if (isHeadingLine(line)) {
      i += 1;
      continue;
    }
    break;
  }

  const parts: string[] = [];
  for (; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();
    if (!trimmed) break;
    if (isHeadingLine(trimmed)) break;
    if (isBadgeLine(trimmed)) continue;
    if (/^\s*(?:[-*+•\u2022]|\d+[.)])\s+/.test(trimmed)) break;
    parts.push(trimmed);
    if (parts.join(' ').length > 260) break;
  }

  return clamp(stripMarkdown(parts.join(' ')), 260);
};

const SECTION_KEYWORDS = [
  'features',
  'feature',
  'highlights',
  'overview',
  'about',
  'description',
  'what it does',
  'capabilities',
  'functionality',
];

const extractSectionBullets = (lines: string[], maxBullets: number): string[] => {
  const bullets: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    if (!isHeadingLine(line)) continue;

    const h = headingText(line).toLowerCase();
    if (!SECTION_KEYWORDS.some((k) => h.includes(k))) continue;

    for (let j = i + 1; j < lines.length; j += 1) {
      const l = lines[j] ?? '';
      if (isHeadingLine(l)) break;

      const trimmed = l.trim();
      if (!trimmed) continue;

      if (/^\s*(?:[-*+•\u2022]|\d+[.)])\s+/.test(trimmed)) {
        const b = cleanBullet(trimmed);
        if (b) bullets.push(b);
      }

      if (bullets.length >= maxBullets) return bullets;
    }

    if (bullets.length > 0) return bullets;
  }

  return bullets;
};

const extractFirstBulletsAnywhere = (lines: string[], maxBullets: number): string[] => {
  const out: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i] ?? '';
    const trimmed = raw.trim();

    if (!trimmed) {
      if (inList && out.length > 0) break;
      continue;
    }

    if (isHeadingLine(trimmed)) {
      if (inList && out.length > 0) break;
      continue;
    }

    const isBullet = /^\s*(?:[-*+•\u2022]|\d+[.)])\s+/.test(trimmed);
    if (isBullet) {
      inList = true;
      const b = cleanBullet(trimmed);
      if (b) out.push(b);
      if (out.length >= maxBullets) break;
      continue;
    }

    if (inList && out.length > 0) break;
  }

  return out;
};

type TechPattern = { name: string; pattern: RegExp };

const TECH_PATTERNS: TechPattern[] = [
  { name: 'React', pattern: /\breact\b/i },
  { name: 'Next.js', pattern: /\bnext\.?js\b/i },
  { name: 'Vite', pattern: /\bvite\b/i },
  { name: 'TypeScript', pattern: /\btypescript\b/i },
  { name: 'JavaScript', pattern: /\bjavascript\b/i },
  { name: 'Node.js', pattern: /\bnode\.?js\b|\bnodejs\b/i },
  { name: 'Express', pattern: /\bexpress\b/i },
  { name: 'Python', pattern: /\bpython\b/i },
  { name: 'FastAPI', pattern: /\bfastapi\b/i },
  { name: 'Flask', pattern: /\bflask\b/i },
  { name: 'Django', pattern: /\bdjango\b/i },
  { name: 'Java', pattern: /\bjava\b/i },
  { name: 'Spring Boot', pattern: /\bspring\s*boot\b/i },
  { name: 'Go', pattern: /\bgo(lang)?\b/i },
  { name: 'Rust', pattern: /\brust\b/i },
  { name: 'C++', pattern: /\bc\+\+\b/i },
  { name: 'C#', pattern: /\bc#\b/i },
  { name: '.NET', pattern: /\b\.net\b|\bdotnet\b/i },
  { name: 'PostgreSQL', pattern: /\bpostgre(s|sql)?\b/i },
  { name: 'MySQL', pattern: /\bmysql\b/i },
  { name: 'MongoDB', pattern: /\bmongodb\b/i },
  { name: 'Redis', pattern: /\bredis\b/i },
  { name: 'Firebase', pattern: /\bfirebase\b/i },
  { name: 'Supabase', pattern: /\bsupabase\b/i },
  { name: 'Docker', pattern: /\bdocker\b/i },
  { name: 'Kubernetes', pattern: /\bkubernetes\b|\bk8s\b/i },
  { name: 'AWS', pattern: /\baws\b|\bamazon\s+web\s+services\b/i },
  { name: 'Azure', pattern: /\bazure\b/i },
  { name: 'GCP', pattern: /\bgcp\b|\bgoogle\s+cloud\b/i },
  { name: 'OpenAI', pattern: /\bopenai\b/i },
  { name: 'LangChain', pattern: /\blangchain\b/i },
  { name: 'PyTorch', pattern: /\bpytorch\b/i },
  { name: 'TensorFlow', pattern: /\btensorflow\b/i },
];

const extractTech = (text: string): string[] => {
  const hits: Array<{ idx: number; name: string }> = [];

  for (const t of TECH_PATTERNS) {
    const idx = text.search(t.pattern);
    if (idx !== -1) hits.push({ idx, name: t.name });
  }

  hits.sort((a, b) => a.idx - b.idx);

  const out: string[] = [];
  const seen = new Set<string>();

  for (const h of hits) {
    const key = h.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h.name);
  }

  return out;
};

export const enhanceProjectFromReadme = (
  readmeText: string,
  options: EnhanceOptions = {}
): ReadmeEnhancementResult => {
  const fallbackName = options.fallbackName?.trim() ?? '';
  const fallbackTechStack = options.fallbackTechStack?.trim() ?? '';
  const maxBullets = options.maxBullets ?? 3;

  const warnings: string[] = [];

  const text = normalizeNewlines(readmeText || '').trim();
  if (!text) {
    return {
      suggestedName: fallbackName,
      suggestedDescription: '',
      suggestedTechStack: fallbackTechStack,
      bullets: [],
      extractedTech: [],
      overview: '',
      warnings: ['No README text provided.'],
    };
  }

  const lines = text.split('\n');

  const title = extractTitle(lines);
  const suggestedName = title.title || fallbackName;
  if (!suggestedName) warnings.push('Could not detect a project title from README.');

  const overview = extractOverview(lines, title.index);

  let bullets = extractSectionBullets(lines, maxBullets);
  if (bullets.length === 0) bullets = extractFirstBulletsAnywhere(lines, maxBullets);
  if (bullets.length === 0 && overview) bullets = [overview];

  let suggestedDescription = bullets.length
    ? bullets.map((b) => `- ${b}`).join('\n')
    : overview;

  if (suggestedDescription) {
    // TODO: integrate tone/verb fixes if needed
  }

  const extractedTech = extractTech(text);
  const suggestedTechStack = extractedTech.length > 0 ? extractedTech.join(', ') : fallbackTechStack;

  return {
    suggestedName,
    suggestedDescription,
    suggestedTechStack,
    bullets,
    extractedTech,
    overview,
    warnings,
  };
};
