import React, { useMemo, useRef, useState } from "react";
import Button from "./ui/Button";
import AutocompleteInput from "./ui/AutocompleteInput";
import type { ResumeData } from "../types";
import { normalizeSkills } from "../services/skills";

type UploadProps = {
  onParsed: (data: ResumeData) => void;
};

type UploadParseResponse = ResumeData & {
  extractedText?: string;
  fileName?: string;
  mimeType?: string;
};

type UploadedFileInfo = {
  name: string;
  size: number;
};

const Upload: React.FC<UploadProps> = ({ onParsed }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileInfo, setFileInfo] = useState<UploadedFileInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtractingProjects, setIsExtractingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<UploadParseResponse | null>(null);
  const [draftResume, setDraftResume] = useState<ResumeData | null>(null);

  const resetUpload = () => {
    setFileInfo(null);
    setError(null);
    setReviewData(null);
    setDraftResume(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const getExtractedText = () => (reviewData?.extractedText || "").toString();

  const extractEmail = (text: string): string => {
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const m = text.match(emailRegex);
    return m ? m[0] : "";
  };

  const extractPhone = (text: string): string => {
    const phoneRegex = /(?:\+?\d{1,3}[-\s.]*)?(?:\d{3}[-\s.]?\d{3}[-\s.]?\d{4})/;
    const m = text.match(phoneRegex);
    return m ? m[0] : "";
  };

  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s)\]]+|www\.[^\s)\]]+)/gi;
    const matches = text.match(urlRegex) || [];
    const cleaned = matches
      .map((u) => u.replace(/[.,;]+$/, ""))
      .map((u) => (u.toLowerCase().startsWith("http") ? u : `https://${u}`));
    return Array.from(new Set(cleaned)).slice(0, 4);
  };

  const detectSkillsFromText = (text: string): string[] => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

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
      "certifications",
      "websites",
      "activities",
    ];

    const startIndex = lines.findIndex((l) => {
      const lower = l.toLowerCase();
      return lower.startsWith("skills") || lower.startsWith("technical skills");
    });
    if (startIndex === -1) return [];

    const skillLines: string[] = [];
    for (let i = startIndex + 1; i < lines.length; i += 1) {
      const lower = lines[i].toLowerCase();
      if (sectionHeadings.some((h) => lower.startsWith(h))) break;
      skillLines.push(lines[i]);
      if (skillLines.length >= 8) break;
    }

    const joined = skillLines.join(", ");
    const parts = joined
      .split(/[,•;\u2022\-]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set(parts)).slice(0, 30);
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setFileInfo({ name: file.name, size: file.size });
    setReviewData(null);
    setDraftResume(null);

    try {
      // Read file as Base64 to bypass Vercel multipart/form-data streaming issues
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // The result is a data URL: "data:application/pdf;base64,JVBERi..."
          // We just send the whole thing and let the backend parse it.
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeBase64: fileBase64,
          filename: file.name,
          mimetype: file.type,
        }),
      });

      if (!response.ok) {
        let detail = "";
        try {
          const ct = response.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const body = await response.json();
            detail = body?.error ? String(body.error) : JSON.stringify(body);
          } else {
            detail = await response.text();
          }
        } catch {
          // ignore parsing error
        }
        const msg = detail
          ? `Upload failed (${response.status}): ${detail}`
          : `Upload failed (${response.status}).`;
        throw new Error(msg);
      }

      const data = await response.json();
      const parsed = data as UploadParseResponse;
      setReviewData(parsed);
      setDraftResume({
        name: parsed.name || "",
        contact: parsed.contact || "",
        summary: parsed.summary || "",
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload resume. Please try again.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const applyToEditor = () => {
    if (!draftResume) return;
    onParsed(draftResume);
  };

  const runQuickFixContact = () => {
    if (!draftResume) return;
    const text = getExtractedText();
    if (!text) return;
    const email = extractEmail(text);
    const phone = extractPhone(text);
    const urls = extractUrls(text);

    const parts = [email, phone, ...urls].filter(Boolean);
    if (!parts.length) return;
    setDraftResume({ ...draftResume, contact: parts.join(" | ") });
  };

  const runQuickFixName = () => {
    if (!draftResume) return;
    const text = getExtractedText();
    const firstLine = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l.length > 0);
    if (!firstLine) return;
    setDraftResume({ ...draftResume, name: firstLine });
  };

  const runQuickFixSkills = () => {
    if (!draftResume) return;
    const text = getExtractedText();
    if (!text) return;
    const skills = detectSkillsFromText(text);
    if (!skills.length) return;
    setDraftResume({ ...draftResume, skills });
  };

  const runQuickFixDedupeSkills = () => {
    if (!draftResume) return;
    const next = Array.from(
      new Set(draftResume.skills.map((s) => s.trim()).filter(Boolean))
    );
    setDraftResume({ ...draftResume, skills: next });
  };

  const runQuickFixCleanSkills = () => {
    if (!draftResume) return;
    const result = normalizeSkills(draftResume.skills);
    setDraftResume({ ...draftResume, skills: result.skills });
  };

  const runQuickFixProjects = async () => {
    if (!draftResume) return;
    const text = getExtractedText();
    if (!text) return;

    setIsExtractingProjects(true);
    setError(null);

    try {
      const response = await fetch("/api/projects-extractor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        let detail = "";
        try {
          const ct = response.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const body = await response.json();
            detail = body?.error ? String(body.error) : JSON.stringify(body);
          } else {
            detail = await response.text();
          }
        } catch {
          // ignore parsing error
        }
        const msg = detail
          ? `Projects conversion failed (${response.status}): ${detail}`
          : `Projects conversion failed (${response.status}).`;
        throw new Error(msg);
      }

      const data = await response.json();
      const projects = Array.isArray(data?.projects) ? data.projects : [];

      if (!projects.length) {
        setError("No projects section found in extracted text.");
        return;
      }

      setDraftResume((prev) => (prev ? { ...prev, projects } : prev));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to convert projects. Please try again.";
      setError(message);
    } finally {
      setIsExtractingProjects(false);
    }
  };

  if (reviewData && draftResume) {
    const extractedText = getExtractedText();
    const inputBaseClass =
      "w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">Review parsed result</h3>
            <p className="text-xs text-gray-300">
              Compare the extracted text with the structured fields. Fix anything that looks wrong, then apply.
            </p>
            <div className="text-[11px] text-gray-400">
              <span className="font-medium text-gray-200">{reviewData.fileName || fileInfo?.name}</span>
              {reviewData.mimeType ? <span> · {reviewData.mimeType}</span> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={resetUpload}>
              Re-upload
            </Button>
            <Button variant="primary" size="sm" onClick={applyToEditor}>
              Apply to editor
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Original extracted text</p>
              <p className="text-[11px] text-gray-400">Read-only</p>
            </div>
            <textarea
              readOnly
              value={extractedText}
              rows={18}
              className={`${inputBaseClass} font-mono text-xs resize-none`}
              style={{ backgroundColor: "#111111", color: "#fafafa" }}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Parsed result (editable)</p>
              <div className="text-[11px] text-gray-400">
                Exp: {draftResume.experience.length} · Edu: {draftResume.education.length} · Projects: {draftResume.projects.length}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300">Name</label>
              <input
                value={draftResume.name}
                onChange={(e) => setDraftResume({ ...draftResume, name: e.target.value })}
                className={inputBaseClass}
                style={{ backgroundColor: "#111111", color: "#fafafa" }}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300">Contact</label>
              <input
                value={draftResume.contact}
                onChange={(e) => setDraftResume({ ...draftResume, contact: e.target.value })}
                className={inputBaseClass}
                style={{ backgroundColor: "#111111", color: "#fafafa" }}
                placeholder="Email | Phone | Links"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300">Summary</label>
              <textarea
                value={draftResume.summary}
                onChange={(e) => setDraftResume({ ...draftResume, summary: e.target.value })}
                rows={4}
                className={`${inputBaseClass} resize-none`}
                style={{ backgroundColor: "#111111", color: "#fafafa" }}
                placeholder="Short summary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300">Skills</label>
              <AutocompleteInput
                value={draftResume.skills.join(", ")}
                onChange={(nextValue) => {
                  const skills = nextValue
                    .split(/[,•;\u2022]/)
                    .map((s) => s.trim())
                    .filter(Boolean);
                  setDraftResume({ ...draftResume, skills });
                }}
                className={inputBaseClass}
                style={{ backgroundColor: "#111111", color: "#fafafa" }}
                placeholder="React, Node.js, Python..."
              />
            </div>

            <div className="pt-1">
              <p className="text-xs font-semibold text-gray-300 mb-2">Quick fixes</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={runQuickFixName}>
                  Set name from text
                </Button>
                <Button variant="secondary" size="sm" onClick={runQuickFixContact}>
                  Auto-fill contact
                </Button>
                <Button variant="secondary" size="sm" onClick={runQuickFixSkills}>
                  Extract skills
                </Button>
                <Button variant="secondary" size="sm" onClick={runQuickFixDedupeSkills}>
                  Dedupe skills
                </Button>
                <Button variant="secondary" size="sm" onClick={runQuickFixCleanSkills}>
                  Clean skills
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={runQuickFixProjects}
                  disabled={isExtractingProjects}
                >
                  {isExtractingProjects
                    ? "Converting projects..."
                    : "Convert projects to structured list"}
                </Button>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Tip: You can do deeper edits (experience/education/projects) after you apply in the editor.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-white mb-1">
        Upload your resume
      </label>

      <div className="relative">
        <div className="border-2 border-dashed border-dark-border rounded-2xl bg-dark-surface/60 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-accent-purple to-accent-blue shadow-md">
              Upload
            </button>
            <p className="text-xs text-gray-300">
              We can read: <span className="font-semibold">DOC, DOCX, PDF, HTML, RTF, TXT</span>
            </p>
          </div>
          <div className="text-xs text-gray-300 text-left sm:text-right max-w-xs">
            <p>Drop to upload your resume or choose a file.</p>
            <p className="text-[11px] text-gray-400 mt-1">Max 5MB file size.</p>
          </div>
        </div>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt,.rtf,.html,.htm,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,text/html,text/rtf"
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          ref={inputRef}
        />
      </div>
      {fileInfo && (
        <div className="p-3 bg-dark-surface rounded-lg border border-dark-border">
          <p className="text-xs text-gray-300">
            Selected: <span className="font-medium text-white">{fileInfo.name}</span> (
            {(fileInfo.size / 1024).toFixed(1)} KB)
          </p>
        </div>
      )}
      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-accent-purple">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Parsing resume...</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Upload;


