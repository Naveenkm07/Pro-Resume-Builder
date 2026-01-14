export type SkillNormalizationMethod = 'canonical' | 'alias' | 'fuzzy' | 'clean' | 'unknown';

export type SkillNormalizationChange = {
  from: string;
  to: string;
  action: 'replace' | 'remove_duplicate';
  method: SkillNormalizationMethod;
  score?: number;
};

export type SkillNormalizationResult = {
  skills: string[];
  changes: SkillNormalizationChange[];
};

const cleanSkill = (raw: string): string => {
  return raw
    .replace(/^[\s,;•\u2022]+/g, '')
    .replace(/[\s,;•\u2022]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const toKey = (raw: string): string => {
  return cleanSkill(raw)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9+#.]/g, '')
    .replace(/\.+/g, '.');
};

const CANONICAL_SKILLS: string[] = [
  'React',
  'Angular',
  'AngularJS',
  'Vue.js',
  'Svelte',
  'Next.js',
  'Node.js',
  'Express',
  'TypeScript',
  'JavaScript',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'Redux',
  'React Native',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'SQLite',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Git',
  'Linux',
  'REST',
  'GraphQL',
  'Python',
  'Django',
  'Flask',
  'FastAPI',
  'Java',
  'Spring Boot',
  'C',
  'C++',
  'C#',
  '.NET',
  'Go',
  'Rust',
  'PHP',
  'Laravel',
  'Ruby',
  'Ruby on Rails',
  'Kotlin',
  'Swift',
];

const CANONICAL_BY_KEY = new Map<string, string>(
  CANONICAL_SKILLS.map((s) => [toKey(s), s])
);

const ALIASES: Record<string, string> = {
  reactjs: 'React',
  'react.js': 'React',
  reactnative: 'React Native',

  nodejs: 'Node.js',
  'node.js': 'Node.js',

  nextjs: 'Next.js',
  'next.js': 'Next.js',

  vuejs: 'Vue.js',
  'vue.js': 'Vue.js',

  expressjs: 'Express',
  'express.js': 'Express',

  js: 'JavaScript',
  javascript: 'JavaScript',

  ts: 'TypeScript',
  typescript: 'TypeScript',

  html5: 'HTML',
  css3: 'CSS',

  tailwind: 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',

  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',

  mongodb: 'MongoDB',

  golang: 'Go',

  dotnet: '.NET',
  '.net': '.NET',

  cplusplus: 'C++',
  'c++': 'C++',

  csharp: 'C#',
  'c#': 'C#',
};

const normalizeSingleSkill = (
  raw: string
): { value: string; method: SkillNormalizationMethod; score?: number } => {
  const cleaned = cleanSkill(raw);
  if (!cleaned) return { value: '', method: 'clean' };

  const key = toKey(cleaned);
  const direct = CANONICAL_BY_KEY.get(key);
  if (direct) {
    return { value: direct, method: direct === cleaned ? 'canonical' : 'canonical' };
  }

  const aliased = ALIASES[key];
  if (aliased) {
    return { value: aliased, method: 'alias' };
  }

  const fuzzy = fuzzyMatchCanonical(cleaned);
  if (fuzzy) {
    return { value: fuzzy.value, method: 'fuzzy', score: fuzzy.score };
  }

  return { value: cleaned, method: cleaned === raw ? 'unknown' : 'clean' };
};

const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const m = a.length;
  const n = b.length;
  const dp: number[] = new Array(n + 1);

  for (let j = 0; j <= n; j += 1) dp[j] = j;

  for (let i = 1; i <= m; i += 1) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j += 1) {
      const temp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }

  return dp[n];
};

const fuzzyMatchCanonical = (
  input: string
): { value: string; score: number } | null => {
  const inputKey = toKey(input);
  if (!inputKey) return null;

  const inputLen = inputKey.length;
  if (inputLen < 4) return null;

  let best: { value: string; score: number } | null = null;

  for (const canonical of CANONICAL_SKILLS) {
    const canonicalKey = toKey(canonical);
    const diff = Math.abs(canonicalKey.length - inputLen);

    if (diff > 3) continue;

    const d = levenshtein(inputKey, canonicalKey);
    const maxLen = Math.max(inputLen, canonicalKey.length);
    const score = maxLen === 0 ? 1 : 1 - d / maxLen;

    if (d > 2 && score < 0.9) continue;

    if (!best || score > best.score) {
      best = { value: canonical, score };
    }
  }

  if (!best) return null;
  if (best.score < 0.9) return null;

  return best;
};

export const normalizeSkills = (skills: string[]): SkillNormalizationResult => {
  const out: string[] = [];
  const changes: SkillNormalizationChange[] = [];
  const seen = new Set<string>();

  for (const raw of skills) {
    const cleaned = cleanSkill(raw);
    if (!cleaned) continue;

    const normalized = normalizeSingleSkill(cleaned);
    if (!normalized.value) continue;

    const outKey = toKey(normalized.value);

    if (seen.has(outKey)) {
      changes.push({
        from: cleaned,
        to: normalized.value,
        action: 'remove_duplicate',
        method: normalized.method,
        score: normalized.score,
      });
      continue;
    }

    seen.add(outKey);
    out.push(normalized.value);

    if (cleaned !== normalized.value) {
      changes.push({
        from: cleaned,
        to: normalized.value,
        action: 'replace',
        method: normalized.method,
        score: normalized.score,
      });
    }
  }

  return { skills: out, changes };
};
