import { Router } from "express";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import * as mammoth from "mammoth";
import { z } from "zod";

const PDFParser = require("pdf2json");

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

const parsePdfFile = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser(null, 1); // 1 = extract text
      pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });
      pdfParser.parseBuffer(buffer);
    } catch (err) {
      reject(err);
    }
  });
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
  // Check if Vercel has already consumed the stream into req.body
  if (req.body && Buffer.isBuffer(req.body)) {
    return res.status(400).json({ error: "req.body is a buffer! Vercel pre-parsed the stream." });
  } else if (req.body && Object.keys(req.body).length > 0) {
    return res.status(400).json({ error: "req.body is an object! Vercel pre-parsed the stream." });
  } else if (typeof req.body === 'string') {
    return res.status(400).json({ error: "req.body is a string! Vercel pre-parsed the stream." });
  }

  const form = formidable({});
  
  try {
    const [fields, files] = await form.parse(req);
    const resumeFile = Array.isArray(files.resume) ? files.resume[0] : files.resume;

    if (!resumeFile) {
      return res.status(400).json({ error: "File is required under key 'resume'." });
    }

    const originalname = resumeFile.originalFilename || "resume";
    const mimetype = resumeFile.mimetype || "application/octet-stream";
    const ext = path.extname(originalname).toLowerCase();

    // Formidable writes the file to a temporary location (/tmp in Vercel)
    const filepath = resumeFile.filepath;
    
    // Read the file from the temp path into a buffer so we can parse it
    const buffer = await fs.promises.readFile(filepath);

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
      // Clean up temp file asynchronously
      fs.promises.unlink(filepath).catch(console.error);
      return res.status(400).json({ error: "Invalid file type. Allowed types: PDF, DOC, DOCX, HTML, RTF, TXT." });
    }

  try {
    let text = "";
    if (isPdf) {
      text = await parsePdfFile(buffer);
    } else if (isDocx) {
      text = await parseDocxFile(buffer);
    } else if (isText) {
      text = await parseTextFile(buffer, ext);
    }

    // Clean up the formidable temp file immediately after reading it into memory
    fs.promises.unlink(filepath).catch(console.error);

    let resume: ResumeData;
    if (!text.trim()) {
      console.warn("No text extracted from resume; falling back to minimal ResumeData");
      const baseName = path.basename(file.originalname, path.extname(file.originalname));
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
    // Note: We cannot rely on resumeFile being defined here in the outer catch block if formidable parsing failed,
    // so we provide generic fallbacks.
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

    // Return fallback instead of HTTP 500 so the UI can still proceed
    return res.json({
      ...fallback,
      extractedText: "",
      fileName: "Uploaded Resume",
      mimeType: "application/octet-stream",
    });
  }
});

export default router;


