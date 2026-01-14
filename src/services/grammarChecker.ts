export type GrammarIssue = {
  type: 'grammar' | 'spelling' | 'clarity' | 'punctuation';
  message: string;
  suggestion?: string;
  startIndex: number;
  endIndex: number;
  severity: 'error' | 'warning' | 'info';
};

export type GrammarCheckResult = {
  issues: GrammarIssue[];
  correctedText?: string;
};

const COMMON_SPELLING_ERRORS: Record<string, string> = {
  'recieve': 'receive',
  'seperate': 'separate',
  'occured': 'occurred',
  'untill': 'until',
  'wich': 'which',
  'thier': 'their',
  'alot': 'a lot',
  'definately': 'definitely',
  'accomodate': 'accommodate',
  'begining': 'beginning',
  'bussiness': 'business',
  'calender': 'calendar',
  'collegue': 'colleague',
  'comming': 'coming',
  'compatability': 'compatibility',
  'concensus': 'consensus',
  'experiance': 'experience',
  'goverment': 'government',
  'happend': 'happened',
  'independant': 'independent',
  'knowlege': 'knowledge',
  'maintainance': 'maintenance',
  'neccessary': 'necessary',
  'occassion': 'occasion',
  'oppurtunity': 'opportunity',
  'paralell': 'parallel',
  'priviledge': 'privilege',
  'recomend': 'recommend',
  'refering': 'referring',
  'relevent': 'relevant',
  'responsable': 'responsible',
  'sincerly': 'sincerely',
  'sucess': 'success',
  'suprise': 'surprise',
  'thourough': 'thorough',
  'transfering': 'transferring',
  'usualy': 'usually',
  'visable': 'visible',
  'volontary': 'voluntary',
  'weather': 'whether',
  'whereas': 'where as',
  'writting': 'writing',
};

const GRAMMAR_RULES = [
  {
    pattern: /\b(i)\s+(am|is|are|was|were|be|being|been)\b/gi,
    message: 'Incorrect capitalization: "I" should be capitalized',
    type: 'grammar' as const,
    fix: (match: string) => match.replace(/\bi\b/g, 'I'),
  },
  {
    pattern: /\b(your|you're)\s+(welcome|right|wrong|good|bad)\b/gi,
    message: 'Consider being more specific in professional writing',
    type: 'clarity' as const,
  },
  {
    pattern: /\b(very|really|quite|rather|somewhat|pretty)\s+\w+/gi,
    message: 'Avoid weak intensifiers in professional writing',
    type: 'clarity' as const,
  },
  {
    pattern: /\s{2,}/g,
    message: 'Multiple spaces detected',
    type: 'punctuation' as const,
    fix: (match: string) => ' ',
  },
  {
    pattern: /\b(a lot)\b/gi,
    message: 'Consider using "many" or "numerous" in formal writing',
    type: 'clarity' as const,
    fix: (match: string) => 'numerous',
  },
  {
    pattern: /\b(and|but|or|so)\s+[a-z]/gi,
    message: 'Consider starting a new sentence after conjunctions',
    type: 'clarity' as const,
  },
  {
    pattern: /\.{2,}/g,
    message: 'Multiple periods detected',
    type: 'punctuation' as const,
    fix: (match: string) => '.',
  },
  {
    pattern: /\b(i|he|she|it|we|they)\s+(have|has|had)\s+\w+ed\b/gi,
    message: 'Check for correct past tense usage',
    type: 'grammar' as const,
  },
  {
    pattern: /\b(their|there|they're|its|it's)\b/gi,
    message: 'Common homophone confusion detected',
    type: 'grammar' as const,
  },
];

function checkSpelling(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  const words = text.toLowerCase().split(/\s+/);
  let currentIndex = 0;

  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, '');
    const foundIndex = text.toLowerCase().indexOf(word, currentIndex);
    if (COMMON_SPELLING_ERRORS[cleanWord]) {
      const startIndex = foundIndex === -1 ? currentIndex : foundIndex;
      issues.push({
        type: 'spelling',
        message: `Spelling: "${cleanWord}" should be "${COMMON_SPELLING_ERRORS[cleanWord]}"`,
        suggestion: COMMON_SPELLING_ERRORS[cleanWord],
        startIndex,
        endIndex: startIndex + cleanWord.length,
        severity: 'error',
      });
    }
    currentIndex = (foundIndex === -1 ? currentIndex : foundIndex) + word.length + 1;
  }

  return issues;
}

function checkGrammarRules(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  for (const rule of GRAMMAR_RULES) {
    let match: RegExpExecArray | null;
    while ((match = rule.pattern.exec(text)) !== null) {
      const startIndex = match.index || 0;
      const endIndex = startIndex + match[0].length;
      
      issues.push({
        type: rule.type,
        message: rule.message,
        suggestion: rule.fix ? rule.fix(match[0]) : undefined,
        startIndex,
        endIndex,
        severity: rule.type === 'grammar' ? 'error' : 'warning',
      });
    }
  }

  return issues;
}

function checkClarity(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  sentences.forEach((sentence) => {
    const trimmed = sentence.trim();
    
    // Check for very long sentences
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount > 25) {
      const startIndex = text.indexOf(sentence);
      issues.push({
        type: 'clarity',
        message: `Very long sentence (${wordCount} words). Consider breaking it into multiple sentences.`,
        startIndex,
        endIndex: startIndex + sentence.length,
        severity: 'warning',
      });
    }

    // Check for sentences starting with conjunctions
    if (/^(and|but|or|so|because|however|therefore)\s+/i.test(trimmed)) {
      const startIndex = text.indexOf(sentence);
      issues.push({
        type: 'clarity',
        message: 'Avoid starting sentences with conjunctions',
        startIndex,
        endIndex: startIndex + sentence.length,
        severity: 'warning',
      });
    }
  });

  return issues;
}

export function checkGrammar(text: string): GrammarCheckResult {
  const spellingIssues = checkSpelling(text);
  const grammarIssues = checkGrammarRules(text);
  const clarityIssues = checkClarity(text);

  const allIssues = [...spellingIssues, ...grammarIssues, ...clarityIssues]
    .sort((a, b) => a.startIndex - b.startIndex);

  return {
    issues: allIssues,
  };
}

export function applyGrammarFix(text: string, issue: GrammarIssue): string {
  if (!issue.suggestion) return text;

  const before = text.substring(0, issue.startIndex);
  const after = text.substring(issue.endIndex);
  return before + issue.suggestion + after;
}

export function applyAllGrammarFixes(text: string, issues: GrammarIssue[]): string {
  let result = text;
  
  // Apply fixes from end to start to avoid index shifting
  const sortedIssues = [...issues]
    .filter(issue => issue.suggestion)
    .sort((a, b) => b.startIndex - a.startIndex);

  for (const issue of sortedIssues) {
    result = applyGrammarFix(result, issue);
  }

  return result;
}
