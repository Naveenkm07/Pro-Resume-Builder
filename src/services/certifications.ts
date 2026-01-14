import type { Certification } from '../types';

export type CertParseResult = {
  certifications: Certification[];
  skipped: string[];
};

const MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
];

const DATE_REGEXES = [
  /\b(\b(19|20)\d{2}\b)\b/g,
  /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-\s]*\d{4})\b/gi,
  /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/g,
  /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-\s]*\d{1,2}[-\s,]*\d{4})\b/gi,
];

const URL_REGEX = /(https?:\/\/[^\s\)]+|www\.[^\s\)]+)/gi;

const CREDENTIAL_ID_PATTERNS = [
  /(?:ID|Credential|Certification|Certificate)[\s:]*#?([A-Z0-9\-_]{4,})/gi,
  /#([A-Z0-9\-_]{4,})\b/g,
  /\b([A-Z]{2,}-\d{4,})\b/g,
];

const COMMON_ISSUERS = [
  'aws', 'amazon web services', 'azure', 'microsoft', 'google', 'gcp',
  'cisco', 'compTIA', 'oracle', 'salesforce', 'hubspot', 'coursera',
  'udemy', 'edx', 'linkedin learning', 'pluralsight', 'aws certified',
  'microsoft certified', 'google certified', 'cisco certified',
];

function cleanLine(line: string): string {
  return line
    .replace(/^\s*[-•*]\s*/, '')
    .replace(/^\s*\d+\.\s*/, '')
    .trim();
}

function extractDate(line: string): string | undefined {
  for (const regex of DATE_REGEXES) {
    const matches = line.match(regex);
    if (matches && matches.length > 0) {
      const date = matches[0];
      const normalized = date.replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/gi, (m) =>
        m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
      );
      return normalized;
    }
  }
  return undefined;
}

function extractIssuer(line: string): string | undefined {
  const lower = line.toLowerCase();
  for (const issuer of COMMON_ISSUERS) {
    if (lower.includes(issuer)) {
      return issuer
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }
  return undefined;
}

function extractCredentialId(line: string): string | undefined {
  for (const pattern of CREDENTIAL_ID_PATTERNS) {
    const match = line.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return undefined;
}

function extractUrl(line: string): string | undefined {
  const match = line.match(URL_REGEX);
  if (match) {
    return match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
  }
  return undefined;
}

function parseCertificationLine(line: string): Certification | null {
  const cleaned = cleanLine(line);
  if (!cleaned || cleaned.length < 5) return null;

  const date = extractDate(cleaned);
  const issuer = extractIssuer(cleaned);
  const credentialId = extractCredentialId(cleaned);
  const url = extractUrl(cleaned);

  let name = cleaned;
  name = name.replace(URL_REGEX, '');
  name = name.replace(/#?[A-Z0-9\-_]{4,}/g, '');
  name = name.replace(/\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-\s]*\d{1,2}[-\s,]*\d{4})\b/gi, '');
  name = name.replace(/\b(19|20)\d{2}\b/g, '');
  name = name.trim();

  if (!name || name.length < 3) return null;

  return {
    name,
    issuer,
    date,
    credentialId,
    url,
  };
}

export function parseCertifications(raw: string): CertParseResult {
  const lines = raw
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const certifications: Certification[] = [];
  const skipped: string[] = [];

  for (const line of lines) {
    const cert = parseCertificationLine(line);
    if (cert) {
      certifications.push(cert);
    } else {
      skipped.push(line);
    }
  }

  return { certifications, skipped };
}

export function formatCertification(cert: Certification): string {
  const parts = [cert.name];
  if (cert.issuer) parts.push(`(${cert.issuer})`);
  if (cert.date) parts.push(cert.date);
  if (cert.credentialId) parts.push(`ID: ${cert.credentialId}`);
  if (cert.url) parts.push(cert.url);
  return parts.join(' ');
}

export function formatCertificationsList(certifications: Certification[]): string {
  return certifications.map(formatCertification).join('\n');
}
