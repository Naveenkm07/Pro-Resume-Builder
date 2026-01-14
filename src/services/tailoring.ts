import type { ResumeData } from '../types';

export type RoleTemplateId = 'ml-engineer' | 'backend' | 'frontend' | 'fullstack' | 'devops' | 'data-scientist';

export interface RoleTemplate {
  id: RoleTemplateId;
  label: string;
  keywords: string[];
  sectionOrder?: string[];
}

export const ROLE_TEMPLATES: Record<RoleTemplateId, RoleTemplate> = {
  'ml-engineer': {
    id: 'ml-engineer',
    label: 'ML Engineer',
    keywords: [
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn',
      'python', 'numpy', 'pandas', 'data science', 'nlp', 'computer vision', 'algorithms',
      'statistics', 'mathematics', 'research', 'model deployment', 'mlops', 'jupyter',
      'spark', 'hadoop', 'sql', 'data engineering', 'feature engineering'
    ],
    sectionOrder: ['summary', 'skills', 'projects', 'experience', 'education'],
  },
  'backend': {
    id: 'backend',
    label: 'Backend',
    keywords: [
      'node.js', 'express', 'python', 'django', 'flask', 'java', 'spring', 'c#', '.net',
      'api', 'rest', 'graphql', 'microservices', 'databases', 'sql', 'nosql', 'mongodb',
      'postgresql', 'mysql', 'redis', 'kafka', 'rabbitmq', 'aws', 'azure', 'gcp',
      'docker', 'kubernetes', 'ci/cd', 'testing', 'authentication', 'security'
    ],
    sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education'],
  },
  'frontend': {
    id: 'frontend',
    label: 'Frontend',
    keywords: [
      'react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'sass', 'tailwind',
      'redux', 'state management', 'ui/ux', 'responsive design', 'accessibility', 'performance',
      'webpack', 'vite', 'next.js', 'gatsby', 'testing', 'jest', 'cypress', 'storybook',
      'figma', 'design systems', 'component libraries', 'web accessibility'
    ],
    sectionOrder: ['summary', 'skills', 'projects', 'experience', 'education'],
  },
  'fullstack': {
    id: 'fullstack',
    label: 'Fullstack',
    keywords: [
      'javascript', 'typescript', 'react', 'node.js', 'express', 'python', 'django', 'sql',
      'nosql', 'mongodb', 'postgresql', 'rest', 'graphql', 'api', 'authentication', 'security',
      'docker', 'aws', 'azure', 'gcp', 'ci/cd', 'testing', 'agile', 'scrum', 'devops'
    ],
    sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education'],
  },
  'devops': {
    id: 'devops',
    label: 'DevOps',
    keywords: [
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'ci/cd',
      'jenkins', 'gitlab', 'github actions', 'linux', 'bash', 'python', 'monitoring',
      'logging', 'prometheus', 'grafana', 'elk', 'security', 'networking', 'infrastructure'
    ],
    sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education'],
  },
  'data-scientist': {
    id: 'data-scientist',
    label: 'Data Scientist',
    keywords: [
      'python', 'r', 'statistics', 'machine learning', 'data analysis', 'pandas', 'numpy',
      'scikit-learn', 'tensorflow', 'pytorch', 'sql', 'data visualization', 'tableau',
      'power bi', 'jupyter', 'research', 'a/b testing', 'experimentation', 'data mining'
    ],
    sectionOrder: ['summary', 'skills', 'projects', 'experience', 'education'],
  },
};

function scoreKeywords(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  for (const keyword of keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += 1;
    }
  }
  return score;
}

export function tailorResumeForRole(
  baseResume: ResumeData,
  roleTemplateId: RoleTemplateId
): ResumeData {
  const template = ROLE_TEMPLATES[roleTemplateId];
  if (!template) return baseResume;

  const keywords = template.keywords.map(k => k.toLowerCase());

  const skillsWithScore = baseResume.skills.map(skill => ({
    skill,
    score: scoreKeywords(skill, keywords)
  }));
  skillsWithScore.sort((a, b) => b.score - a.score);
  const tailoredSkills = skillsWithScore.map(s => s.skill);

  const projectsWithScore = baseResume.projects.map(project => ({
    project,
    score: scoreKeywords(project.name + ' ' + project.description, keywords)
  }));
  projectsWithScore.sort((a, b) => b.score - a.score);
  const tailoredProjects = projectsWithScore.map(p => p.project);

  const experienceWithScore = baseResume.experience.map(exp => ({
    exp,
    score: scoreKeywords(exp.title + ' ' + exp.company + ' ' + exp.desc, keywords)
  }));
  experienceWithScore.sort((a, b) => b.score - a.score);
  const tailoredExperience = experienceWithScore.map(e => e.exp);

  const sectionOrder = template.sectionOrder || ['summary', 'skills', 'experience', 'projects', 'education'];

  return {
    ...baseResume,
    skills: tailoredSkills,
    projects: tailoredProjects,
    experience: tailoredExperience,
    sectionOrder,
  };
}
