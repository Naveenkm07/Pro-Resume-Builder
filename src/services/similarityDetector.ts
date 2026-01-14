import { type ResumeData } from "../types";
import { parseBulletLines } from "./bulletImpact";

export type ResumeTextItem = {
  id: string;
  group: string;
  label: string;
  text: string;
};

export type SimilarityWarning = {
  a: ResumeTextItem;
  b: ResumeTextItem;
  similarity: number;
};

export type SimilarityScanOptions = {
  threshold?: number;
  maxWarnings?: number;
  minTokens?: number;
  compareWithinSameGroup?: boolean;
};

export type SimilarityScanResult = {
  threshold: number;
  items: ResumeTextItem[];
  warnings: SimilarityWarning[];
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ");

const tokenize = (s: string): string[] => {
  const cleaned = normalize(s).replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  return cleaned.split(" ").filter(Boolean);
};

const splitIntoSentences = (text: string): string[] => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const matches = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  const parts = (matches ?? [cleaned]).map((s) => s.trim()).filter(Boolean);
  return parts;
};

export const extractResumeTextItems = (resume: ResumeData): ResumeTextItem[] => {
  const items: ResumeTextItem[] = [];

  const summarySentences = splitIntoSentences(resume.summary ?? "");
  summarySentences.forEach((s, idx) => {
    items.push({
      id: `summary:${idx}`,
      group: "summary",
      label: "Summary",
      text: s,
    });
  });

  (resume.experience ?? []).forEach((exp, expIndex) => {
    const group = `experience:${expIndex}`;
    const label = `Experience: ${exp.title}${exp.company ? ` @ ${exp.company}` : ""}`;

    const lines = parseBulletLines(exp.desc ?? "");
    if (lines.length === 0 && (exp.desc ?? "").trim()) {
      items.push({
        id: `experience:${expIndex}:desc:0`,
        group,
        label,
        text: (exp.desc ?? "").trim(),
      });
      return;
    }

    lines.forEach((line) => {
      items.push({
        id: `experience:${expIndex}:line:${line.lineIndex}`,
        group,
        label,
        text: line.content,
      });
    });
  });

  (resume.projects ?? []).forEach((p, projectIndex) => {
    const group = `project:${projectIndex}`;
    const label = `Project: ${p.name}`;

    const lines = parseBulletLines(p.description ?? "");
    if (lines.length === 0 && (p.description ?? "").trim()) {
      items.push({
        id: `project:${projectIndex}:desc:0`,
        group,
        label,
        text: (p.description ?? "").trim(),
      });
      return;
    }

    lines.forEach((line) => {
      items.push({
        id: `project:${projectIndex}:line:${line.lineIndex}`,
        group,
        label,
        text: line.content,
      });
    });
  });

  return items
    .map((it) => ({ ...it, text: it.text.replace(/\s+/g, " ").trim() }))
    .filter((it) => Boolean(it.text));
};

const computeIdf = (docs: string[][]): Map<string, number> => {
  const df = new Map<string, number>();

  for (const tokens of docs) {
    const seen = new Set<string>();
    for (const t of tokens) {
      if (seen.has(t)) continue;
      seen.add(t);
      df.set(t, (df.get(t) ?? 0) + 1);
    }
  }

  const n = docs.length;
  const idf = new Map<string, number>();
  for (const [term, count] of df.entries()) {
    const v = Math.log((n + 1) / (count + 1)) + 1;
    idf.set(term, v);
  }
  return idf;
};

const toTfidfVector = (tokens: string[], idf: Map<string, number>): Map<string, number> => {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }

  const len = tokens.length || 1;
  const vec = new Map<string, number>();
  for (const [term, count] of tf.entries()) {
    const tfNorm = count / len;
    const w = tfNorm * (idf.get(term) ?? 0);
    if (w !== 0) vec.set(term, w);
  }
  return vec;
};

const dot = (a: Map<string, number>, b: Map<string, number>): number => {
  let sum = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const [term, av] of small.entries()) {
    const bv = large.get(term);
    if (bv !== undefined) sum += av * bv;
  }
  return sum;
};

const cosineSimilarity = (
  a: Map<string, number>,
  aNorm: number,
  b: Map<string, number>,
  bNorm: number
): number => {
  if (aNorm === 0 || bNorm === 0) return 0;
  return dot(a, b) / (aNorm * bNorm);
};

export function scanResumeSimilarity(resume: ResumeData, options: SimilarityScanOptions = {}): SimilarityScanResult {
  const threshold = clamp01(options.threshold ?? 0.82);
  const maxWarnings = Math.max(1, options.maxWarnings ?? 40);
  const minTokens = Math.max(1, options.minTokens ?? 3);
  const compareWithinSameGroup = options.compareWithinSameGroup ?? false;

  const items = extractResumeTextItems(resume);
  const eligible = items.filter((it) => tokenize(it.text).length >= minTokens);

  const docs = eligible.map((it) => tokenize(it.text));
  const idf = computeIdf(docs);
  const vectors = docs.map((tokens) => toTfidfVector(tokens, idf));
  const norms = vectors.map((v) => Math.sqrt(dot(v, v)));

  const warnings: SimilarityWarning[] = [];

  for (let i = 0; i < eligible.length; i += 1) {
    for (let j = i + 1; j < eligible.length; j += 1) {
      if (!compareWithinSameGroup && eligible[i].group === eligible[j].group) continue;

      const sim = cosineSimilarity(vectors[i], norms[i], vectors[j], norms[j]);
      if (sim >= threshold) {
        warnings.push({ a: eligible[i], b: eligible[j], similarity: sim });
      }
    }
  }

  warnings.sort((x, y) => y.similarity - x.similarity);

  return {
    threshold,
    items: eligible,
    warnings: warnings.slice(0, maxWarnings),
  };
}
