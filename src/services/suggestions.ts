export type SuggestionSource = {
  getSuggestions: (query: string, limit?: number) => string[];
  recordUse: (value: string) => void;
};

const STORAGE_KEY = 'autocomplete_mru_v1';
const DEFAULT_LIMIT = 8;
const MAX_MRU = 50;

const DEFAULT_DICTIONARY: string[] = [
  'PyTorch',
  'PyTest',
  'PySpark',
  'Python',
  'Pandas',
  'NumPy',
  'FastAPI',
  'Flask',
  'Django',
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Git',
  'Linux',
  'REST',
  'GraphQL',
];

const normalize = (s: string) => s.trim();
const normalizeKey = (s: string) => normalize(s).toLowerCase();

const readMru = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v) => typeof v === 'string')
      .map((v) => normalize(v))
      .filter(Boolean);
  } catch {
    return [];
  }
};

const writeMru = (values: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values.slice(0, MAX_MRU)));
  } catch {
    // ignore
  }
};

export const createSuggestionSource = (dictionary: string[] = DEFAULT_DICTIONARY): SuggestionSource => {
  const dict = dictionary
    .map((v) => normalize(v))
    .filter(Boolean);

  const recordUse = (value: string) => {
    const clean = normalize(value);
    if (!clean) return;

    const current = readMru();
    const key = normalizeKey(clean);

    const next = [clean, ...current.filter((v) => normalizeKey(v) !== key)];
    writeMru(next);
  };

  const getSuggestions = (query: string, limit: number = DEFAULT_LIMIT): string[] => {
    const q = normalize(query);
    if (!q) return [];

    const qKey = normalizeKey(q);
    const mru = readMru();

    const merged: string[] = [];
    const seen = new Set<string>();

    const pushUnique = (v: string) => {
      const clean = normalize(v);
      if (!clean) return;
      const k = normalizeKey(clean);
      if (seen.has(k)) return;
      seen.add(k);
      merged.push(clean);
    };

    for (const v of mru) pushUnique(v);
    for (const v of dict) pushUnique(v);

    const matches = merged.filter((v) => normalizeKey(v).startsWith(qKey));

    const mruRank = new Map<string, number>();
    mru.forEach((v, idx) => mruRank.set(normalizeKey(v), idx));

    matches.sort((a, b) => {
      const ak = normalizeKey(a);
      const bk = normalizeKey(b);
      const ar = mruRank.has(ak) ? mruRank.get(ak)! : Number.POSITIVE_INFINITY;
      const br = mruRank.has(bk) ? mruRank.get(bk)! : Number.POSITIVE_INFINITY;
      if (ar !== br) return ar - br;
      return a.localeCompare(b);
    });

    return matches.slice(0, limit);
  };

  return { getSuggestions, recordUse };
};

export const DefaultSuggestionSource = createSuggestionSource();
