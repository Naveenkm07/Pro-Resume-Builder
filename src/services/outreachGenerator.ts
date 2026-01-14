import type { ResumeData } from "../types";

export type OutreachTone = "formal" | "short" | "enthusiastic";
export type OutreachChannel = "linkedin" | "email";

export type OutreachPersonalization = {
  channel: OutreachChannel;
  recruiterName?: string;
  company?: string;
  role?: string;
  jobLink?: string;
};

export type OutreachMessage = {
  subject?: string;
  body: string;
};

export type OutreachVariants = Record<OutreachTone, OutreachMessage>;

type Tokens = Record<string, string>;

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  for (const v of values) {
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return "";
}

function extractEmail(contact: string): string {
  const match = contact.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : "";
}

function titleCase(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function buildTokens(resume: ResumeData, input: OutreachPersonalization): Tokens {
  const candidateName = firstNonEmpty(resume.name, "Your Name");
  const candidateContact = firstNonEmpty(resume.contact);
  const candidateEmail = extractEmail(candidateContact);

  const recruiterNameRaw = firstNonEmpty(input.recruiterName);
  const recruiterName = recruiterNameRaw ? titleCase(recruiterNameRaw) : "";

  const company = firstNonEmpty(input.company);
  const role = firstNonEmpty(input.role);

  const topSkills = (resume.skills || []).slice(0, 4).filter(Boolean).join(", ");

  const topProject = (resume.projects || [])[0];
  const topProjectName = firstNonEmpty(topProject?.name);
  const topProjectLink = firstNonEmpty(topProject?.link);

  const exp = (resume.experience || [])[0];
  const expTitle = firstNonEmpty(exp?.title);
  const expCompany = firstNonEmpty(exp?.company);

  const jobLink = firstNonEmpty(input.jobLink);

  const recruiterGreetingName = recruiterName || "there";
  const hiringTeamGreeting = company ? `the ${company} team` : "your team";

  const companyOrTeam = company || "your team";
  const roleOrOpportunity = role || "this opportunity";

  const projectLine = topProjectName
    ? topProjectLink
      ? `${topProjectName} (${topProjectLink})`
      : topProjectName
    : "";

  const projectLineLabel = projectLine ? `Project: ${projectLine}` : "";
  const jobLinkLine = jobLink ? `Job link: ${jobLink}` : "";

  const expLine = expTitle || expCompany ? `${expTitle}${expTitle && expCompany ? " at " : ""}${expCompany}` : "";

  return {
    candidateName,
    candidateContact,
    candidateEmail,
    recruiterName,
    recruiterGreetingName,
    hiringTeamGreeting,
    company,
    companyOrTeam,
    role,
    roleOrOpportunity,
    topSkills,
    topProjectName,
    topProjectLink,
    projectLine,
    projectLineLabel,
    jobLink,
    jobLinkLine,
    expTitle,
    expCompany,
    expLine,
  };
}

function fill(template: string, tokens: Tokens): string {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_m, key: string) => tokens[key] ?? "");
}

function cleanText(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""))
    .filter((l, idx, arr) => {
      if (l.trim().length > 0) return true;
      const prevNonEmpty = idx > 0 && arr[idx - 1].trim().length > 0;
      const nextNonEmpty = idx < arr.length - 1 && arr[idx + 1].trim().length > 0;
      return prevNonEmpty && nextNonEmpty;
    });
  return lines.join("\n").trim();
}

function buildLinkedInTemplates(tone: OutreachTone): { body: string } {
  if (tone === "short") {
    return {
      body:
        "Hi {{recruiterGreetingName}} — I’m {{candidateName}}. Interested in {{roleOrOpportunity}} at {{companyOrTeam}}. Skills: {{topSkills}}. {{projectLineLabel}}. Open to a quick chat?",
    };
  }

  if (tone === "enthusiastic") {
    return {
      body:
        "Hi {{recruiterGreetingName}}! I’m {{candidateName}} and I’m excited about {{roleOrOpportunity}} at {{companyOrTeam}}.\n\nMy background includes {{topSkills}} and I recently worked on {{topProjectName}}. {{projectLineLabel}}\n\nIf you’re the right person to speak with, I’d love to connect. Thanks!",
    };
  }

  return {
    body:
      "Hi {{recruiterGreetingName}},\n\nI’m {{candidateName}} and I’m reaching out about {{roleOrOpportunity}} at {{companyOrTeam}}. I have experience with {{topSkills}} and have worked on {{topProjectName}}. {{projectLineLabel}}\n\nWould you be open to a quick chat or can you point me to the right contact? Thanks!",
  };
}

function buildEmailTemplates(tone: OutreachTone): { subject: string; body: string } {
  const subject = "Interest in {{roleOrOpportunity}} at {{companyOrTeam}} — {{candidateName}}";

  if (tone === "short") {
    return {
      subject,
      body:
        "Hello {{hiringTeamGreeting}},\n\nI’m {{candidateName}} and I’m interested in {{roleOrOpportunity}}. I have experience with {{topSkills}}. {{projectLineLabel}}\n\nThanks,\n{{candidateName}}\n{{candidateContact}}",
    };
  }

  if (tone === "enthusiastic") {
    return {
      subject,
      body:
        "Hello {{hiringTeamGreeting}},\n\nI hope you’re doing well. I’m {{candidateName}} and I’m excited about {{roleOrOpportunity}} at {{companyOrTeam}}.\n\nMy background includes {{topSkills}} and I recently worked on {{topProjectName}}. {{projectLineLabel}}\n{{jobLinkLine}}\n\nIf there’s someone I should connect with, I’d really appreciate a quick direction.\n\nThanks,\n{{candidateName}}\n{{candidateContact}}",
    };
  }

  return {
    subject,
    body:
      "Hello {{hiringTeamGreeting}},\n\nMy name is {{candidateName}} and I’m reaching out regarding {{roleOrOpportunity}} at {{companyOrTeam}}.\n\nI bring experience with {{topSkills}} and have worked on {{topProjectName}}. {{projectLineLabel}}\n{{jobLinkLine}}\n\nIf you’re open to a brief chat, I’d love to share more.\n\nSincerely,\n{{candidateName}}\n{{candidateContact}}",
  };
}

export function generateOutreachVariants(resume: ResumeData, input: OutreachPersonalization): OutreachVariants {
  const tokens = buildTokens(resume, input);

  const tones: OutreachTone[] = ["formal", "short", "enthusiastic"];
  const variants = {} as OutreachVariants;

  for (const tone of tones) {
    if (input.channel === "email") {
      const tpl = buildEmailTemplates(tone);
      variants[tone] = {
        subject: cleanText(fill(tpl.subject, tokens)),
        body: cleanText(fill(tpl.body, tokens)),
      };
    } else {
      const tpl = buildLinkedInTemplates(tone);
      variants[tone] = {
        body: cleanText(fill(tpl.body, tokens)),
      };
    }
  }

  return variants;
}
