export type BulletImpactIssue = 'missing_metric' | 'missing_action_verb' | 'missing_result';

export type BulletImpactSuggestion = {
  mode: 'append' | 'replace';
  text: string;
};

export type BulletImpactAnalysis = {
  score: number;
  hasMetric: boolean;
  hasActionVerb: boolean;
  hasResult: boolean;
  issues: BulletImpactIssue[];
  suggestions: BulletImpactSuggestion[];
};

export type ParsedBulletLine = {
  lineIndex: number;
  raw: string;
  prefix: string;
  content: string;
};

const ACTION_VERBS = [
  'achieved',
  'analyzed',
  'architected',
  'automated',
  'built',
  'collaborated',
  'created',
  'decreased',
  'delivered',
  'designed',
  'developed',
  'drove',
  'eliminated',
  'enabled',
  'enhanced',
  'engineered',
  'executed',
  'improved',
  'implemented',
  'increased',
  'integrated',
  'launched',
  'led',
  'maintained',
  'managed',
  'migrated',
  'optimized',
  'orchestrated',
  'owned',
  'reduced',
  'refactored',
  'released',
  'shipped',
  'simplified',
  'scaled',
  'spearheaded',
  'standardized',
  'streamlined',
  'strengthened',
  'supported',
  'tested',
];

const WEAK_STARTS = [
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
  'tasked with',
  'handled',
];

type MetricCategory = 'performance' | 'scale' | 'cost' | 'quality' | 'reliability' | 'delivery' | 'general';

const METRIC_TEMPLATES: Record<MetricCategory, string[]> = {
  performance: [
    ', reducing latency by <X%> (from <A>ms to <B>ms).',
    ', improving performance by <X%> under peak load.',
    ', cutting response time by <X>ms and improving throughput by <Y%>.',
  ],
  scale: [
    ', supporting <N>+ users and <M> requests/day.',
    ', processing <N>+ records/day with <X%> higher throughput.',
    ', scaling from <A> to <B> users without downtime.',
  ],
  cost: [
    ', saving ~$<X>/month by optimizing infrastructure costs.',
    ', reducing cloud spend by <X%> through right-sizing and caching.',
    ', lowering operational cost by <X%> while maintaining SLAs.',
  ],
  quality: [
    ', increasing test coverage to <X%> and reducing bugs by <Y%>.',
    ', reducing defect rate by <X%> through automation and code reviews.',
    ', improving accuracy/precision by <X%> using better validation.',
  ],
  reliability: [
    ', improving uptime to <99.9%> and reducing incidents by <N>.',
    ', reducing error rate by <X%> and improving monitoring/alerts.',
    ', cutting on-call pages by <X%> through resiliency improvements.',
  ],
  delivery: [
    ', cutting release cycle from <A> days to <B> days.',
    ', reducing manual effort by <N> hours/week via automation.',
    ', improving delivery speed by <X%> with CI/CD and process changes.',
  ],
  general: [
    ', resulting in a <X%> improvement in <KPI>.',
    ', impacting <N>+ users and improving <KPI> by <X%>.',
    ', saving <N> hours/week and improving <KPI> by <X%>.',
  ],
};

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();

const stripLeadingMarkers = (s: string) =>
  s
    .replace(/^\s*(?:[-•*\u2022]|\d+[.)])\s+/, '')
    .replace(/^\s*i\s+/, '')
    .trim();

const isWeakStart = (lower: string) => WEAK_STARTS.some((w) => lower.startsWith(w));

const detectActionVerb = (clean: string): boolean => {
  const lower = clean.toLowerCase();
  if (!lower) return false;
  if (isWeakStart(lower)) return false;
  const first = lower.match(/^[a-z]+/)?.[0];
  if (!first) return false;
  return ACTION_VERBS.includes(first);
};

const detectMetric = (clean: string): boolean => {
  const s = clean;

  const hasPercent = /\b\d+(?:\.\d+)?\s*%\b/.test(s);
  const hasCurrency = /(?:[$₹€£]\s*\d[\d,]*(?:\.\d+)?|\b(?:usd|inr|eur|gbp)\s*\d[\d,]*(?:\.\d+)?\b)/i.test(s);
  const hasTime = /\b\d+(?:\.\d+)?\s*(?:ms|s|sec|secs|seconds|min|mins|minutes|hr|hrs|hours|day|days|week|weeks|month|months|year|years)\b/i.test(s);
  const hasMultiplier = /\b\d+(?:\.\d+)?x\b/i.test(s);
  const hasCountWithUnit = /\b\d[\d,]*(?:\.\d+)?\s*(?:users?|customers?|clients?|requests?|req\/s|rps|records?|rows?|events?|messages?|msgs?|tickets?|bugs?|issues?|features?|deployments?|releases?|pipelines?|models?|experiments?|dashboards?|reports?|endpoints?|apis?)\b/i.test(
    s
  );
  const hasKOrM = /\b\d+(?:\.\d+)?\s*[kKmM]\b/.test(s);

  return hasPercent || hasCurrency || hasTime || hasMultiplier || hasCountWithUnit || hasKOrM;
};

const detectResult = (clean: string): boolean => {
  const s = clean.toLowerCase();
  return /(resulting in|leading to|so that|thereby|improv|increas|reduc|sav|boost|cut|impact)/.test(s);
};

const inferMetricCategory = (clean: string): MetricCategory => {
  const s = clean.toLowerCase();

  if (/(latency|response time|throughput|performance|optimi[sz]e|cache|query|speed)/.test(s)) return 'performance';
  if (/(users?|customers?|clients?|traffic|requests?|rps|scale|scaling)/.test(s)) return 'scale';
  if (/(cost|spend|budget|revenue|profit|sales|pricing|billing|cloud spend)/.test(s)) return 'cost';
  if (/(test|coverage|bug|defect|qa|quality|accuracy|precision|recall|f1|auc)/.test(s)) return 'quality';
  if (/(uptime|reliab|incident|outage|sla|slo|error rate|crash)/.test(s)) return 'reliability';
  if (/(delivery|release|deploy|ci\/cd|automation|manual|cycle time|lead time)/.test(s)) return 'delivery';

  return 'general';
};

const scoreBullet = (hasActionVerb: boolean, hasMetric: boolean, hasResult: boolean): number => {
  let score = 0;
  if (hasActionVerb) score += 35;
  if (hasMetric) score += 45;
  if (hasResult) score += 20;
  return Math.min(100, score);
};

export const analyzeBulletImpact = (bullet: string): BulletImpactAnalysis => {
  const clean = normalize(stripLeadingMarkers(bullet));

  const hasActionVerb = detectActionVerb(clean);
  const hasMetric = detectMetric(clean);
  const hasResult = detectResult(clean) || hasMetric;

  const issues: BulletImpactIssue[] = [];
  if (!hasMetric) issues.push('missing_metric');
  if (!hasActionVerb) issues.push('missing_action_verb');
  if (!hasResult) issues.push('missing_result');

  const category = inferMetricCategory(clean);

  const suggestions: BulletImpactSuggestion[] = [];

  if (!hasMetric) {
    METRIC_TEMPLATES[category].slice(0, 3).forEach((t) => {
      suggestions.push({ mode: 'append', text: t });
    });
  }

  if (!hasActionVerb) {
    const stripped = stripLeadingMarkers(bullet);
    const lower = stripped.toLowerCase();
    const weak = WEAK_STARTS.find((w) => lower.startsWith(w));
    const rest = weak ? stripped.slice(weak.length).trim() : stripped;
    const next = rest ? `Built ${rest.charAt(0).toLowerCase()}${rest.slice(1)}` : 'Built <what you did>';
    suggestions.unshift({ mode: 'replace', text: next });
  }

  const score = scoreBullet(hasActionVerb, hasMetric, hasResult);

  return {
    score,
    hasMetric,
    hasActionVerb,
    hasResult,
    issues,
    suggestions,
  };
};

export const parseBulletLines = (text: string): ParsedBulletLine[] => {
  const lines = text.split(/\r?\n/);
  const out: ParsedBulletLine[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i] ?? '';
    if (!raw.trim()) continue;

    const match = raw.match(/^(\s*(?:[-•*\u2022]|\d+[.)])\s+)/);
    const prefix = match?.[1] ?? '';
    const content = prefix ? raw.slice(prefix.length).trim() : raw.trim();

    out.push({ lineIndex: i, raw, prefix, content });
  }

  return out;
};

const stripTrailingPunct = (s: string) => s.replace(/[.,;:]+\s*$/, '').trim();

export const applyBulletSuggestion = (
  text: string,
  lineIndex: number,
  suggestion: BulletImpactSuggestion
): string => {
  const lines = text.split(/\r?\n/);
  const raw = lines[lineIndex] ?? '';
  const match = raw.match(/^(\s*(?:[-•*\u2022]|\d+[.)])\s+)/);
  const prefix = match?.[1] ?? '';
  const current = prefix ? raw.slice(prefix.length).trim() : raw.trim();

  if (suggestion.mode === 'replace') {
    lines[lineIndex] = prefix ? `${prefix}${suggestion.text}` : suggestion.text;
    return lines.join('\n');
  }

  const base = stripTrailingPunct(current);
  const append = suggestion.text;
  const space = append.startsWith(',') || append.startsWith('.') ? '' : ' ';
  const next = `${base}${space}${append}`;

  lines[lineIndex] = prefix ? `${prefix}${next}` : next;
  return lines.join('\n');
};
