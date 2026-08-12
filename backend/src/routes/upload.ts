import { Router } from "express";
import fs from "fs";
import path from "path";
import * as mammoth from "mammoth";
import { z } from "zod";


const router = Router();


const fileSchema = z.object({
  mimetype: z.enum([
    "application/pdf",
    "application/x-pdf",
    "application/octet-stream",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/html",
    "text/rtf",
  ]),
});

type Experience = {
  title: string;
  company: string;
  desc: string;
  from: string;
  to: string;
};

type Education = {
  degree: string;
  college: string;
  year: string;
};

type Project = {
  name: string;
  description: string;
  techStack?: string;
  link?: string;
};

type ResumeData = {
  name: string;
  contact: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
};

const extractResumeDataFromText = (text: string): ResumeData => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const phoneRegex = /(?:\+?\d{1,3}[-\s.]*)?(?:\d{3}[-\s.]?\d{3}[-\s.]?\d{4})/;

  const name = lines[0] || "Your Name";

  let contact = "";
  for (const line of lines.slice(0, 10)) {
    if (emailRegex.test(line) || phoneRegex.test(line)) {
      contact = line;
      break;
    }
  }
  if (!contact) {
    contact = lines.slice(0, 3).join(" · ");
  }

  const sectionHeadings = [
    "skills",
    "technical skills",
    "experience",
    "work experience",
    "professional experience",
    "education",
    "projects",
    "summary",
    "profile",
    // Extra headings commonly seen in exported resumes (like nb.html)
    "websites",
    "websites, portfolios, profiles",
    "certifications",
    "certifications & licenses",
    "extracurricular",
    "extracurricular activities",
    "achievements",
    "achievements internship",
    "activities",
  ];

  const summaryLines: string[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const lower = lines[i].toLowerCase();
    if (sectionHeadings.some((h) => lower.startsWith(h))) {
      break;
    }
    if (summaryLines.length >= 5) break;
    summaryLines.push(lines[i]);
  }
  const summary =
    summaryLines.join(" ") || "Imported from uploaded resume.";

  let skills: string[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const lower = lines[i].toLowerCase();
    if (lower.startsWith("skills") || lower.startsWith("technical skills")) {
      const skillLines: string[] = [];
      for (let j = i + 1; j < lines.length; j += 1) {
        const l = lines[j];
        const lLower = l.toLowerCase();
        if (sectionHeadings.some((h) => lLower.startsWith(h))) {
          break;
        }
        skillLines.push(l);
      }
      const joined = skillLines.join(", ");
      skills = joined
        .split(/[,•;\u2022\-]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      break;
    }
  }
  skills = Array.from(new Set(skills)).slice(0, 30);

  // Helper to slice a logical section by heading
  const sliceSection = (starts: string[]): string[] => {
    const startIndex = lines.findIndex((l) => {
      const lower = l.toLowerCase();
      return starts.some((s) => lower.startsWith(s));
    });
    if (startIndex === -1) return [];

    let endIndex = lines.length;
    for (let i = startIndex + 1; i < lines.length; i += 1) {
      const lower = lines[i].toLowerCase();
      if (sectionHeadings.some((h) => lower.startsWith(h))) {
        endIndex = i;
        break;
      }
    }
    return lines.slice(startIndex + 1, endIndex);
  };

  const experience: Experience[] = [];
  const education: Education[] = [];

  // Heuristic Experience parsing
  const expLines = sliceSection(["experience", "work experience", "professional experience"]);
  if (expLines.length) {
    const yearRegex = /\b(19|20)\d{2}\b/;

    let currentBlock: string[] = [];
    const flushBlock = () => {
      if (!currentBlock.length || experience.length >= 5) {
        currentBlock = [];
        return;
      }

      const header = currentBlock[0];
      const bodyLines = currentBlock.slice(1);

      const dateRangeMatch = header.match(/\b(19|20)\d{2}\b\s*[-–]\s*\b((?:19|20)\d{2}|present|current)\b/i);
      let from = "";
      let to = "";
      let headerClean = header;
      if (dateRangeMatch) {
        from = dateRangeMatch[1];
        to = dateRangeMatch[2];
        headerClean = header.replace(dateRangeMatch[0], "").trim();
      }

      let title = "";
      let company = "";
      const lowerHeader = headerClean.toLowerCase();
      const atIdx = lowerHeader.indexOf(" at ");
      if (atIdx !== -1) {
        title = headerClean.slice(0, atIdx).trim();
        company = headerClean.slice(atIdx + 4).trim();
      } else {
        const dashIdx = headerClean.indexOf("-");
        if (dashIdx !== -1) {
          title = headerClean.slice(0, dashIdx).trim();
          company = headerClean.slice(dashIdx + 1).trim();
        } else {
          title = headerClean.trim();
        }
      }

      const desc = bodyLines.join(" ").trim();
      if (!title && !desc) {
        currentBlock = [];
        return;
      }

      experience.push({
        title: title || "Experience",
        company,
        from,
        to,
        desc,
      });
      currentBlock = [];
    };

    for (const line of expLines) {
      if (yearRegex.test(line) && currentBlock.length > 0) {
        flushBlock();
        currentBlock.push(line);
      } else {
        currentBlock.push(line);
      }
    }
    flushBlock();
  }

  // Heuristic Education parsing
  const eduLines = sliceSection(["education"]);
  if (eduLines.length) {
    const yearRegex = /\b(19|20)\d{2}\b/g;

    // Group consecutive lines into logical education blocks. This is more
    // robust for layouts where date, degree, college, and GPA appear on
    // separate lines (like nb.html exported to PDF).
    const blocks: string[][] = [];
    let current: string[] = [];

    const isBlockStart = (line: string): boolean => {
      if (!line) return false;
      const lower = line.toLowerCase();
      if (/(expected in)/i.test(lower)) return true;
      return /\b(19|20)\d{2}\b/.test(line);
    };

    for (const line of eduLines) {
      if (education.length >= 5) break;
      if (isBlockStart(line) && current.length) {
        blocks.push(current);
        current = [line];
      } else {
        current.push(line);
      }
    }
    if (current.length) {
      blocks.push(current);
    }

    for (const block of blocks) {
      if (education.length >= 5) break;
      const joined = block.join(" ");
      const matches = joined.match(yearRegex);
      const year = matches && matches.length ? matches[matches.length - 1] : "";

      // Prefer a line that clearly looks like a degree; otherwise fall back
      // to the first line in the block.
      const degreeLine =
        block.find((l) =>
          /(bachelor|diploma|sslc|b\.e\.|be\b|btech|b-tech)/i.test(l)
        ) || block[0];

      let degree = degreeLine.replace(/[:]/g, "").trim();

      // Prefer a line that contains an institution keyword.
      const collegeLine =
        block.find((l) =>
          /(college|polytechnic|school|university|institute)/i.test(l)
        ) || "";

      const college = collegeLine.trim();

      if (!degree && !college && !year) continue;

      education.push({
        degree,
        college,
        year: year || "",
      });
    }
  }

  return {
    name,
    contact,
    summary,
    skills,
    experience,
    education,
    projects: [],
  };
};

import pdfParse from "pdf-parse";

const parsePdfFile = async (buffer: Buffer): Promise<string> => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (err) {
    throw err;
  }
};

const parseDocxFile = async (buffer: Buffer): Promise<string> => {
  const result = await mammoth.extractRawText({ buffer } as any);
  return result.value ?? "";
};

const parseTextFile = async (buffer: Buffer, ext: string): Promise<string> => {
  let raw = "";
  try {
    raw = buffer.toString("utf8");
  } catch {
    return "";
  }

  const lowerExt = ext.toLowerCase();

  // Basic HTML to text: strip scripts/styles then tags.
  if (lowerExt === ".html" || lowerExt === ".htm") {
    const noScript = raw.replace(/<script[\s\S]*?<\/script>/gi, " ");
    const noStyle = noScript.replace(/<style[\s\S]*?<\/style>/gi, " ");
    return noStyle.replace(/<[^>]+>/g, " ");
  }

  // Very naive RTF to text: strip control words and braces.
  if (lowerExt === ".rtf") {
    return raw
      .replace(/\\par[d]?/g, "\n")
      .replace(/\\'[0-9a-fA-F]{2}/g, " ")
      .replace(/\\[a-zA-Z]+-?\d* ?/g, "")
      .replace(/[{}]/g, " ");
  }

  // Plain text or unknown text-like.
  return raw;
};

router.post("/", async (req, res) => {
  try {
    const { resumeBase64, filename, mimetype: clientMimetype } = req.body;

    if (!resumeBase64) {
      return res.status(400).json({ error: "File data (resumeBase64) is required." });
    }

    // resumeBase64 looks like "data:application/pdf;base64,JVBERi..."
    const base64Data = resumeBase64.split(",")[1] || resumeBase64;
    const buffer = Buffer.from(base64Data, "base64");

    const originalname = filename || "resume";
    const mimetype = clientMimetype || "application/octet-stream";
    const ext = path.extname(originalname).toLowerCase();

    const isPdf = mimetype === "application/pdf" || mimetype === "application/x-pdf" || ext === ".pdf";
    const isDocx =
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === ".docx";
    const isText =
      mimetype === "text/plain" ||
      mimetype === "text/html" ||
      mimetype === "text/rtf" ||
      ext === ".txt" ||
      ext === ".html" ||
      ext === ".htm" ||
      ext === ".rtf";

    const validation = fileSchema.safeParse({ mimetype: mimetype });
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid file type. Allowed types: PDF, DOC, DOCX, HTML, RTF, TXT." });
    }

    let text = "";
    if (isPdf) {
      text = await parsePdfFile(buffer);
    } else if (isDocx) {
      text = await parseDocxFile(buffer);
    } else if (isText) {
      text = await parseTextFile(buffer, ext);
    }

    let resume: ResumeData;
    if (!text.trim()) {
      console.warn("No text extracted from resume; falling back to minimal ResumeData");
      const baseName = path.basename(originalname, ext);
      resume = {
        name: baseName || "Imported Resume",
        contact: "",
        summary:
          "Imported resume. Automatic text extraction failed, please review and complete details manually.",
        skills: [],
        experience: [],
        education: [],
        projects: [],
      };
    } else {
      resume = extractResumeDataFromText(text);
    }

    return res.json({
      ...resume,
      extractedText: text,
      fileName: originalname,
      mimeType: mimetype,
    });
  } catch (err) {
    console.error("Local parse error:", err);
    const fallback: ResumeData = {
      name: "Imported Resume",
      contact: "",
      summary:
        "Imported resume, but parsing failed. Please fill in your information manually.",
      skills: [],
      experience: [],
      education: [],
      projects: [],
    };

    return res.json({
      ...fallback,
      extractedText: "",
      fileName: "Uploaded Resume",
      mimeType: "application/octet-stream",
    });
  }
});

export default router;


