export type StarComponent = "situation" | "task" | "action" | "result";

export type StarComponentScore = {
  present: boolean;
  confidence: number;
};

export type StarScoringResult = {
  score: number;
  components: Record<StarComponent, StarComponentScore>;
  missing: StarComponent[];
  hints: string[];
};

const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

const countWords = (s: string) => {
  const n = normalize(s);
  if (!n) return 0;
  return n.split(" ").filter(Boolean).length;
};

const detectMetric = (s: string): boolean => {
  const hasPercent = /\b\d+(?:\.\d+)?\s*%\b/i.test(s);
  const hasCurrency = /(?:[$₹€£]\s*\d[\d,]*(?:\.\d+)?|\b(?:usd|inr|eur|gbp)\s*\d[\d,]*(?:\.\d+)?\b)/i.test(s);
  const hasTime = /\b\d+(?:\.\d+)?\s*(?:ms|s|sec|secs|seconds|min|mins|minutes|hr|hrs|hours|day|days|week|weeks|month|months|year|years)\b/i.test(
    s
  );
  const hasMultiplier = /\b\d+(?:\.\d+)?x\b/i.test(s);
  const hasCountWithUnit = /\b\d[\d,]*(?:\.\d+)?\s*(?:users?|customers?|clients?|requests?|req\/s|rps|records?|rows?|events?|messages?|tickets?|bugs?|issues?|features?|deployments?|releases?|pipelines?)\b/i.test(
    s
  );
  const hasKOrM = /\b\d+(?:\.\d+)?\s*[kKmM]\b/.test(s);

  return hasPercent || hasCurrency || hasTime || hasMultiplier || hasCountWithUnit || hasKOrM;
};

type DetectConfig = {
  explicit: RegExp[];
  strong: RegExp[];
  weak: RegExp[];
};

const detectComponent = (text: string, cfg: DetectConfig): StarComponentScore => {
  if (cfg.explicit.some((r) => r.test(text))) {
    return { present: true, confidence: 1 };
  }

  if (cfg.strong.some((r) => r.test(text))) {
    return { present: true, confidence: 0.8 };
  }

  if (cfg.weak.some((r) => r.test(text))) {
    return { present: true, confidence: 0.6 };
  }

  return { present: false, confidence: 0 };
};

const CONFIG: Record<StarComponent, DetectConfig> = {
  situation: {
    explicit: [/\b(situation|context|background)\s*:/i],
    strong: [
      /\b(in my (?:previous|last)? role|at my company|on (?:a|the) (?:team|project)|for (?:a|the) (?:client|customer))\b/i,
      /\b(the (?:challenge|problem|issue) was|we faced|there was (?:a|an) (?:challenge|problem|issue)|constraints? included|deadline)\b/i,
    ],
    weak: [/\b(when|while)\b/i, /\b(context|background|situation)\b/i],
  },
  task: {
    explicit: [/\b(task|goal|objective)\s*:/i],
    strong: [
      /\b(my goal was|the goal was|objective was|i needed to|i had to|i was tasked with|i was responsible for)\b/i,
      /\b(target was to|i was assigned to|i was expected to)\b/i,
    ],
    weak: [/\b(needed to|had to|goal|objective|responsible)\b/i],
  },
  action: {
    explicit: [/\b(action|approach|what i did)\s*:/i],
    strong: [
      /\b(i|we)\s+(led|built|designed|implemented|created|developed|improved|optimized|reduced|increased|managed|owned|collaborated|delivered|shipped|launched|automated|analyzed|refactored|migrated|debugged|fixed)\b/i,
      /\b(so i|so we|therefore i|therefore we|i then|we then)\b/i,
    ],
    weak: [/\b(i|we)\s+(helped|supported|worked on|assisted|contributed)\b/i],
  },
  result: {
    explicit: [/\b(result|outcome|impact)\s*:/i],
    strong: [
      /\b(as a result|which led to|resulting in|leading to|thereby)\b/i,
      /\b(improv(?:ed|ement)|increas(?:ed|e)|reduc(?:ed|e)|sav(?:ed|e)|boost(?:ed)?|cut|delivered|achieved)\b/i,
    ],
    weak: [/\b(result|outcome|impact|success)\b/i],
  },
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const scoreStarAnswer = (answer: string): StarScoringResult => {
  const text = answer.trim();
  const words = countWords(text);

  const situation = detectComponent(text, CONFIG.situation);
  const task = detectComponent(text, CONFIG.task);
  const action = detectComponent(text, CONFIG.action);

  const hasMetric = detectMetric(text);
  const baseResult = detectComponent(text, CONFIG.result);
  const result: StarComponentScore = hasMetric
    ? { present: true, confidence: Math.max(baseResult.confidence, 0.8) }
    : baseResult;

  const components: Record<StarComponent, StarComponentScore> = {
    situation,
    task,
    action,
    result,
  };

  const weights: Record<StarComponent, number> = {
    situation: 25,
    task: 25,
    action: 25,
    result: 25,
  };

  let rawScore = 0;
  (Object.keys(weights) as StarComponent[]).forEach((k) => {
    rawScore += weights[k] * clamp01(components[k].confidence);
  });

  if (words > 0 && words < 30) rawScore *= 0.75;
  else if (words >= 30 && words < 60) rawScore *= 0.9;

  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  const missing: StarComponent[] = [];
  if (!components.situation.present) missing.push("situation");
  if (!components.task.present) missing.push("task");
  if (!components.action.present) missing.push("action");
  if (!components.result.present) missing.push("result");

  const hints: string[] = [];

  if (missing.includes("situation")) {
    hints.push("Add Situation: 1–2 lines of context (where/when, what was happening, why it was challenging). ");
  }
  if (missing.includes("task")) {
    hints.push("Add Task: clearly state your responsibility or goal (what you needed to achieve). ");
  }
  if (missing.includes("action")) {
    hints.push("Add Action: describe specific steps you took (tools, decisions, collaboration, implementation). ");
  }
  if (missing.includes("result")) {
    hints.push("Add Result: explain the outcome and quantify impact (%, time saved, revenue, quality, scale). ");
  }

  if (components.result.present && !hasMetric) {
    hints.push("Strengthen Result: add at least one measurable metric to make the impact concrete.");
  }

  if (words > 0 && words < 40) {
    hints.push("Length tip: aim for ~6–10 lines; expand with context and measurable impact.");
  }

  return {
    score,
    components,
    missing,
    hints: hints.slice(0, 6),
  };
};
