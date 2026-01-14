import React, { useEffect, useRef, useState } from "react";
import { SAMPLE_RESUME, type ResumeData } from "../types";
import { TemplateType } from "../components/TemplateSwitcher";
import Upload from "./Upload";
import Card from "./ui/Card";
import Button from "./ui/Button";
import ThemePicker from "./ThemePicker";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAuth } from "../contexts/AuthContext";
import { ApiService } from "../services/api";
import AuthService from "../services/auth";

type EditorPanelProps = {
  resume: ResumeData;
  onResumeChange: (resume: ResumeData) => void;
  onUploadParsed: (data: ResumeData) => void;
  activeSection: string;
};

const EditorPanel: React.FC<EditorPanelProps> = ({
  resume,
  onResumeChange,
  onUploadParsed,
  activeSection,
}) => {
  const { user, signOut } = useAuth();
  const allTemplateNames: TemplateType[] = [
    "simple", "professional", "creative", "modern", "minimal", "executive", "academic", "technical",
    "portfolio", "bold", "clean", "compact", "elegant", "classic", "stylish", "fresh", "sharp",
    "zen", "focus", "vivid", "sleek", "smart", "dynamic", "elite"
  ];
  const latestResumeRef = useRef(resume);
  const saveMutexRef = useRef(false);
  const saveOnEditTimeoutRef = useRef<number | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [pageSize, setPageSize] = useState<"A4" | "Letter">(() => {
    const raw = localStorage.getItem("pdfPageSize");
    return raw === "Letter" ? "Letter" : "A4";
  });
  const [marginMm, setMarginMm] = useState(() => {
    const raw = localStorage.getItem("pdfMarginMm");
    const parsed = raw ? Number(raw) : 15;
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 50 ? parsed : 15;
  });
  const [scalePercent, setScalePercent] = useState(() => {
    const raw = localStorage.getItem("pdfScalePercent");
    const parsed = raw ? Number(raw) : 100;
    return Number.isFinite(parsed) && parsed >= 50 && parsed <= 150 ? parsed : 100;
  });
  const [defaultTemplate, setDefaultTemplate] = useState<TemplateType>(() => {
    const raw = localStorage.getItem("defaultTemplate");
    return (raw === "simple" || raw === "professional" || raw === "creative") ? raw : "simple";
  });
  const [rememberLastTemplate, setRememberLastTemplate] = useState(() => {
    const raw = localStorage.getItem("rememberLastTemplate");
    return raw === "true";
  });
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(() => {
    const raw = localStorage.getItem("editorSpellcheck");
    return raw ? raw === "true" : true;
  });
  const [compactMode, setCompactMode] = useState(() => {
    const raw = localStorage.getItem("editorCompactMode");
    return raw === "true";
  });
  const [autoSaveOnEdit, setAutoSaveOnEdit] = useState(() => {
    const raw = localStorage.getItem("autoSaveOnEdit");
    return raw === "true";
  });
  const [autoSaveOnEditDelayMs, setAutoSaveOnEditDelayMs] = useState(() => {
    const raw = localStorage.getItem("autoSaveOnEditDelayMs");
    const parsed = raw ? Number(raw) : 1500;
    return Number.isFinite(parsed) && parsed >= 300 && parsed <= 10000 ? parsed : 1500;
  });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    const raw = localStorage.getItem("autoSaveEnabled");
    return raw ? raw === "true" : false;
  });
  const [autoSaveIntervalSec, setAutoSaveIntervalSec] = useState(() => {
    const raw = localStorage.getItem("autoSaveIntervalSec");
    const parsed = raw ? Number(raw) : 30;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["profile", "summary"])
  );
  const [developerMode, setDeveloperMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [accountActionStatus, setAccountActionStatus] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobMatchLoading, setJobMatchLoading] = useState(false);
  const [jobMatchError, setJobMatchError] = useState<string>('');
  const [jobMatchResult, setJobMatchResult] = useState<{
    score: number;
    matched: string[];
    missing: string[];
  } | null>(null);

  useEffect(() => {
    latestResumeRef.current = resume;
  }, [resume]);

  useEffect(() => {
    localStorage.setItem("pdfPageSize", pageSize);
  }, [pageSize]);

  useEffect(() => {
    localStorage.setItem("pdfMarginMm", String(marginMm));
  }, [marginMm]);

  useEffect(() => {
    localStorage.setItem("pdfScalePercent", String(scalePercent));
  }, [scalePercent]);

  useEffect(() => {
    localStorage.setItem("defaultTemplate", defaultTemplate);
  }, [defaultTemplate]);

  useEffect(() => {
    localStorage.setItem("rememberLastTemplate", String(rememberLastTemplate));
  }, [rememberLastTemplate]);

  useEffect(() => {
    localStorage.setItem("editorSpellcheck", String(spellCheckEnabled));
  }, [spellCheckEnabled]);

  useEffect(() => {
    localStorage.setItem("editorCompactMode", String(compactMode));
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem("autoSaveOnEdit", String(autoSaveOnEdit));
  }, [autoSaveOnEdit]);

  useEffect(() => {
    localStorage.setItem("autoSaveOnEditDelayMs", String(autoSaveOnEditDelayMs));
  }, [autoSaveOnEditDelayMs]);

  useEffect(() => {
    localStorage.setItem("autoSaveEnabled", String(autoSaveEnabled));
  }, [autoSaveEnabled]);

  useEffect(() => {
    localStorage.setItem("autoSaveIntervalSec", String(autoSaveIntervalSec));
  }, [autoSaveIntervalSec]);

  useEffect(() => {
    if (!autoSaveEnabled || !user) {
      return;
    }

    const id = window.setInterval(async () => {
      if (saveMutexRef.current) return;
      saveMutexRef.current = true;
      try {
        setAutoSaveStatus("Saving...");
        await ApiService.saveResume(latestResumeRef.current);
        const t = new Date();
        const hh = String(t.getHours()).padStart(2, "0");
        const mm = String(t.getMinutes()).padStart(2, "0");
        const ss = String(t.getSeconds()).padStart(2, "0");
        setAutoSaveStatus(`Saved at ${hh}:${mm}:${ss}`);
      } catch {
        setAutoSaveStatus("Auto-save failed");
      } finally {
        saveMutexRef.current = false;
      }
    }, Math.max(5, autoSaveIntervalSec) * 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [autoSaveEnabled, autoSaveIntervalSec, user]);

  useEffect(() => {
    if (!autoSaveOnEdit || !user) {
      return;
    }

    if (saveOnEditTimeoutRef.current) {
      window.clearTimeout(saveOnEditTimeoutRef.current);
    }

    const id = window.setTimeout(async () => {
      if (saveMutexRef.current) return;
      saveMutexRef.current = true;
      try {
        setAutoSaveStatus("Saving...");
        await ApiService.saveResume(latestResumeRef.current);
        const t = new Date();
        const hh = String(t.getHours()).padStart(2, "0");
        const mm = String(t.getMinutes()).padStart(2, "0");
        const ss = String(t.getSeconds()).padStart(2, "0");
        setAutoSaveStatus(`Saved at ${hh}:${mm}:${ss}`);
      } catch {
        setAutoSaveStatus("Auto-save failed");
      } finally {
        saveMutexRef.current = false;
      }
    }, autoSaveOnEditDelayMs);

    saveOnEditTimeoutRef.current = id;

    return () => {
      window.clearTimeout(id);
    };
  }, [autoSaveOnEdit, autoSaveOnEditDelayMs, resume, user]);

  useEffect(() => {
    const styleId = "pdf-export-styles";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    const mmToInch = 0.0393701;
    const marginInch = marginMm * mmToInch;
    const sizeInch = pageSize === "A4" ? "210mm 297mm" : "8.5in 11in";
    styleEl.textContent = `
      @media print {
        @page {
          size: ${sizeInch};
          margin: ${marginInch}in;
        }
        body {
          transform: scale(${scalePercent / 100});
          transform-origin: top left;
        }
      }
    `;
    return () => {
      styleEl.remove();
    };
  }, [pageSize, marginMm, scalePercent]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const analyzeJobMatch = async () => {
    setJobMatchError('');
    setJobMatchResult(null);

    const text = jobDescription.trim();
    if (!text) {
      setJobMatchError('Paste a job description first');
      return;
    }

    setJobMatchLoading(true);
    try {
      const stop = new Set([
        'the',
        'a',
        'an',
        'and',
        'or',
        'to',
        'of',
        'in',
        'for',
        'with',
        'on',
        'at',
        'by',
        'from',
        'as',
        'is',
        'are',
        'be',
        'will',
        'you',
        'we',
        'our',
        'your',
        'this',
        'that',
        'these',
        'those',
        'must',
        'should',
        'can',
        'able',
        'experience',
        'years',
        'year',
        'work',
        'working',
        'team',
        'teams',
        'role',
        'skills',
        'responsibilities',
        'requirements',
      ]);

      const known = [
        'javascript',
        'typescript',
        'react',
        'vite',
        'nextjs',
        'node',
        'nodejs',
        'express',
        'mongodb',
        'mongoose',
        'sql',
        'postgres',
        'mysql',
        'redis',
        'rest',
        'api',
        'graphql',
        'jwt',
        'oauth',
        'docker',
        'kubernetes',
        'aws',
        'gcp',
        'azure',
        'git',
        'ci',
        'cd',
        'testing',
        'jest',
        'cypress',
        'tailwind',
      ];

      const jdLower = text.toLowerCase();
      const tokens = jdLower
        .replace(/[^a-z0-9+#.\s]/g, ' ')
        .split(/\s+/)
        .map((t) => t.trim())
        .filter(Boolean);

      const freq = new Map<string, number>();
      for (const t of tokens) {
        if (t.length < 3) continue;
        if (stop.has(t)) continue;
        freq.set(t, (freq.get(t) ?? 0) + 1);
      }

      const topFromFreq = Array.from(freq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 25)
        .map(([k]) => k);

      const fromKnown = known.filter((k) => jdLower.includes(k));
      const keywords = Array.from(new Set([...fromKnown, ...topFromFreq])).slice(0, 30);

      const resumeText = JSON.stringify(resume).toLowerCase();
      const matched: string[] = [];
      const missing: string[] = [];

      for (const k of keywords) {
        if (resumeText.includes(k)) matched.push(k);
        else missing.push(k);
      }

      const score = keywords.length === 0 ? 0 : Math.round((matched.length / keywords.length) * 100);

      setJobMatchResult({
        score,
        matched: matched.slice(0, 30),
        missing: missing.slice(0, 30),
      });
    } finally {
      setJobMatchLoading(false);
    }
  };

  if (activeSection === "upload") {
    return (
      <div className={`h-full overflow-y-auto ${compactMode ? 'p-4' : 'p-8'} bg-dark-bg`}>
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Upload Resume</h2>
            <p className="text-gray-300">Upload your existing resume to get started</p>
          </div>
          <Card glow="purple">
            <Upload onParsed={onUploadParsed} />
          </Card>
        </div>
      </div>
    );
  }

  if (activeSection === "templates") {
    return (
      <div className={`h-full overflow-y-auto ${compactMode ? 'p-4' : 'p-8'} bg-dark-bg`}>
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Templates</h2>
            <p className="text-gray-300">Choose a template that matches your style</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {["Simple", "Professional", "Creative", "Modern", "Minimal", "Executive", "Academic", "Technical", "Portfolio", "Bold", "Clean", "Compact", "Elegant", "Classic", "Stylish", "Fresh", "Sharp", "Zen", "Focus", "Vivid", "Sleek", "Smart", "Dynamic", "Elite"].map((template) => (
              <Card key={template} glow="blue" className="cursor-pointer group">
                <div className="aspect-[210/297] bg-white rounded border border-dark-border mb-4 group-hover:scale-105 transition-transform"></div>
                <h3 className="font-semibold text-white">{template}</h3>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "job-match") {
    return (
      <div className={`h-full overflow-y-auto ${compactMode ? 'p-4' : 'p-8'} bg-dark-bg`}>
        <div className={`max-w-3xl mx-auto animate-fade-in ${compactMode ? 'space-y-4' : 'space-y-6'}`}>
          <div className="mb-2">
            <h2 className="text-3xl font-bold text-white mb-2">Job Match</h2>
            <p className="text-gray-300">Match your resume to a job description</p>
          </div>
          <Card glow="purple">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Job Description
                </label>
                <textarea
                  rows={10}
                  spellCheck={spellCheckEnabled}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                  placeholder="Paste the job description here..."
                />
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={analyzeJobMatch}>
                  {jobMatchLoading ? 'Analyzing…' : 'Analyze'}
                </Button>
              </div>

              {jobMatchError && (
                <div className="text-sm text-red-300">{jobMatchError}</div>
              )}

              {jobMatchResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">ATS Match Score</div>
                    <div className="text-sm text-gray-200">{jobMatchResult.score}%</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-dark-border bg-dark-surface/50">
                      <div className="text-sm font-semibold text-white mb-2">Matched keywords</div>
                      <div className="flex flex-wrap gap-2">
                        {jobMatchResult.matched.length === 0 ? (
                          <span className="text-xs text-gray-400">None detected</span>
                        ) : (
                          jobMatchResult.matched.map((k) => (
                            <span
                              key={k}
                              className="px-2 py-1 rounded-full text-xs border"
                              style={{
                                background: `linear-gradient(135deg, var(--color-primary)20 0%, var(--color-secondary)20 100%)`,
                                borderColor: `var(--color-primary)50`,
                              }}
                            >
                              {k}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-dark-border bg-dark-surface/50">
                      <div className="text-sm font-semibold text-white mb-2">Missing keywords</div>
                      <div className="flex flex-wrap gap-2">
                        {jobMatchResult.missing.length === 0 ? (
                          <span className="text-xs text-gray-400">Looks good</span>
                        ) : (
                          jobMatchResult.missing.map((k) => (
                            <span
                              key={k}
                              className="px-2 py-1 rounded-full text-xs border border-dark-border text-gray-200"
                              style={{ backgroundColor: '#111111' }}
                            >
                              {k}
                            </span>
                          ))
                        )}
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            if (!jobMatchResult.missing.length) return;
                            const existing = new Set((resume.skills ?? []).map((s) => s.toLowerCase()));
                            const toAdd = jobMatchResult.missing
                              .slice(0, 12)
                              .filter((k) => !existing.has(k.toLowerCase()));
                            if (toAdd.length === 0) return;
                            onResumeChange({
                              ...resume,
                              skills: [...(resume.skills ?? []), ...toAdd],
                            });
                          }}
                        >
                          Add missing to Skills
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    Tip: use matched keywords naturally in Summary/Experience. Don’t keyword-stuff.
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (activeSection === "settings") {
    return (
      <div className={`h-full overflow-y-auto ${compactMode ? 'p-4' : 'p-8'} bg-dark-bg`}>
        <div className={`max-w-3xl mx-auto animate-fade-in ${compactMode ? 'space-y-4' : 'space-y-6'}`}>
          <div className="mb-2">
            <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
            <p className="text-gray-300">Appearance and account</p>
          </div>

          <Card glow="blue">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-white">Appearance</div>
                <div className="text-sm text-gray-300">Theme and colors</div>
              </div>
              <div className="flex items-center gap-3">
                <ThemePicker />
                <ThemeSwitcher />
              </div>
            </div>
          </Card>

          <Card glow="gold">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-white">Auto-save</div>
                  <div className="text-sm text-gray-300 truncate">
                    {user ? autoSaveStatus || "Idle" : "Sign in to enable auto-save"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSaveEnabled((v) => !v)}
                  disabled={!user}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSaveEnabled ? "" : "bg-gray-400"
                  }`}
                  style={autoSaveEnabled ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoSaveEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Interval (seconds)</div>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={autoSaveIntervalSec}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n) && n > 0) setAutoSaveIntervalSec(n);
                  }}
                  disabled={!user}
                  className="w-28 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!user}
                  onClick={async () => {
                    try {
                      setAutoSaveStatus("Saving...");
                      await ApiService.saveResume(latestResumeRef.current);
                      const t = new Date();
                      const hh = String(t.getHours()).padStart(2, "0");
                      const mm = String(t.getMinutes()).padStart(2, "0");
                      const ss = String(t.getSeconds()).padStart(2, "0");
                      setAutoSaveStatus(`Saved at ${hh}:${mm}:${ss}`);
                    } catch {
                      setAutoSaveStatus("Save failed");
                    }
                  }}
                >
                  Save now
                </Button>
              </div>
            </div>
          </Card>

          <Card glow="blue">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-white">Resume data</div>
                <div className="text-sm text-gray-300">Import/export and reset</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onResumeChange(SAMPLE_RESUME);
                  }}
                >
                  Reset to sample
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(resume, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "resume.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export JSON
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => importInputRef.current?.click()}
                >
                  Import JSON
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.print()}
                >
                  Export / Print
                </Button>
              </div>

              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const parsed = JSON.parse(String(reader.result)) as ResumeData;
                      onResumeChange(parsed);
                    } catch {
                      alert("Invalid JSON file");
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = "";
                }}
              />
            </div>
          </Card>

          <Card glow="purple">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-white">PDF export options</div>
                <div className="text-sm text-gray-300">Page size, margins, scale</div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Page size</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSize("A4")}
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      pageSize === "A4"
                        ? "bg-white text-dark-bg border-white"
                        : "bg-dark-surface border-dark-border text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    A4
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSize("Letter")}
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      pageSize === "Letter"
                        ? "bg-white text-dark-bg border-white"
                        : "bg-dark-surface border-dark-border text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    Letter
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Margins (mm)</div>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={1}
                  value={marginMm}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n) && n >= 0 && n <= 50) setMarginMm(n);
                  }}
                  className="w-28 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Scale (%)</div>
                <input
                  type="number"
                  min={50}
                  max={150}
                  step={5}
                  value={scalePercent}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n) && n >= 50 && n <= 150) setScalePercent(n);
                  }}
                  className="w-28 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>
            </div>
          </Card>

          <Card glow="blue">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-white">Template defaults</div>
                <div className="text-sm font-semibold text-white">Default template</div>
                <div className={`grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 max-h-48 overflow-y-auto pr-1`}>
                {allTemplateNames.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => setDefaultTemplate(tpl)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      defaultTemplate === tpl
                        ? "text-white shadow-sm"
                        : "bg-dark-card text-gray-300 border border-dark-border hover:bg-dark-surface hover:text-white"
                    }`}
                    style={defaultTemplate === tpl ? {
                      background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
                      boxShadow: `0 0 20px ${getComputedStyle(document.documentElement).getPropertyValue('--color-primary')}40`
                    } : undefined}
                  >
                    {tpl.charAt(0).toUpperCase() + tpl.slice(1)}
                  </button>
                ))}
              </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">Remember last template</div>
                  <div className="text-xs text-gray-400">Always use the last selected template on reload</div>
                </div>
                <button
                  type="button"
                  onClick={() => setRememberLastTemplate((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    rememberLastTemplate ? "" : "bg-gray-400"
                  }`}
                  style={rememberLastTemplate ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      rememberLastTemplate ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          <Card glow="gold">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-white">Editor preferences</div>
                <div className="text-sm text-gray-300">Spellcheck, compact mode, and auto-save on edit</div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">Auto-save on edit</div>
                  <div className="text-xs text-gray-400">Save shortly after you stop typing</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSaveOnEdit((v) => !v)}
                  disabled={!user}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSaveOnEdit ? "" : "bg-gray-400"
                  }`}
                  style={autoSaveOnEdit ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoSaveOnEdit ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Auto-save delay (ms)</div>
                <input
                  type="number"
                  min={300}
                  max={10000}
                  step={100}
                  value={autoSaveOnEditDelayMs}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n) && n >= 300 && n <= 10000) setAutoSaveOnEditDelayMs(n);
                  }}
                  disabled={!user}
                  className="w-28 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">Spellcheck</div>
                  <div className="text-xs text-gray-400">Browser spellcheck in text fields</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSpellCheckEnabled((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    spellCheckEnabled ? "" : "bg-gray-400"
                  }`}
                  style={spellCheckEnabled ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      spellCheckEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Compact mode</div>
                <button
                  type="button"
                  onClick={() => setCompactMode((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    compactMode ? "" : "bg-gray-400"
                  }`}
                  style={compactMode ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      compactMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Autosave on edit</div>
                <button
                  type="button"
                  onClick={() => setAutoSaveOnEdit((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSaveOnEdit ? "" : "bg-gray-400"
                  }`}
                  style={autoSaveOnEdit ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoSaveOnEdit ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          <Card glow="gold">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-white">Privacy</div>
                <div className="text-sm text-gray-300">Clear local data and reset app settings</div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const ok = window.confirm('Sign out and clear local auth?');
                    if (!ok) return;
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    signOut();
                    window.dispatchEvent(new Event('authUpdate'));
                  }}
                >
                  Sign out & clear auth
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const ok = window.confirm('Reset settings (PDF export, templates, autosave, theme)?');
                    if (!ok) return;

                    const keys = [
                      'pdfPageSize',
                      'pdfMarginMm',
                      'pdfScalePercent',
                      'defaultTemplate',
                      'rememberLastTemplate',
                      'lastTemplate',
                      'editorSpellcheck',
                      'editorCompactMode',
                      'autoSaveOnEdit',
                      'autoSaveOnEditDelayMs',
                      'autoSaveEnabled',
                      'autoSaveIntervalSec',
                      'theme',
                      'colorTheme',
                    ];
                    keys.forEach((k) => localStorage.removeItem(k));

                    setPageSize('A4');
                    setMarginMm(15);
                    setScalePercent(100);
                    setDefaultTemplate('simple');
                    setRememberLastTemplate(false);
                    setSpellCheckEnabled(true);
                    setCompactMode(false);
                    setAutoSaveOnEdit(false);
                    setAutoSaveOnEditDelayMs(1500);
                    setAutoSaveEnabled(false);
                    setAutoSaveIntervalSec(30);
                    setAutoSaveStatus('');

                    window.location.reload();
                  }}
                >
                  Reset settings
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const ok = window.confirm('Clear all local app data (this will sign you out) and reload?');
                    if (!ok) return;
                    localStorage.clear();
                    try {
                      sessionStorage.clear();
                    } catch {
                      // ignore
                    }
                    window.location.reload();
                  }}
                >
                  Clear local data
                </Button>
              </div>
            </div>
          </Card>

          <Card glow="purple">
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-white">Account security</div>
                <div className="text-sm text-gray-300">Change password or delete your account</div>
              </div>

              {accountActionStatus && (
                <div className="text-sm text-gray-300">{accountActionStatus}</div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  spellCheck={false}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                  placeholder="Current password"
                  disabled={!user}
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  spellCheck={false}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                  placeholder="New password (min 6 chars)"
                  disabled={!user}
                />
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  spellCheck={false}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                  placeholder="Confirm new password"
                  disabled={!user}
                />

                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!user}
                    onClick={async () => {
                      try {
                        setAccountActionStatus('');
                        if (newPassword !== confirmNewPassword) {
                          setAccountActionStatus('New passwords do not match');
                          return;
                        }
                        const res = await AuthService.changePassword(currentPassword, newPassword);
                        setAccountActionStatus(res.message);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmNewPassword('');
                      } catch (e: any) {
                        setAccountActionStatus(e.message || 'Failed to change password');
                      }
                    }}
                  >
                    Change password
                  </Button>
                </div>
              </div>

              <div className="border-t border-dark-border pt-4 space-y-3">
                <div className="text-sm font-semibold text-white">Delete account</div>
                <div className="text-xs text-gray-400">
                  This will permanently delete your account and saved resumes.
                </div>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  spellCheck={false}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                  placeholder="Password (required for email/password accounts)"
                  disabled={!user}
                />
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!user}
                    onClick={async () => {
                      const ok = window.confirm('Delete your account permanently?');
                      if (!ok) return;
                      try {
                        setAccountActionStatus('');
                        const res = await AuthService.deleteAccount(deletePassword || undefined);
                        setAccountActionStatus(res.message);
                        signOut();
                        setDeletePassword('');
                        window.location.reload();
                      } catch (e: any) {
                        setAccountActionStatus(e.message || 'Failed to delete account');
                      }
                    }}
                  >
                    Delete account
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card glow="purple">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-white">Account</div>
                <div className="text-sm text-gray-300 truncate">{user?.email ?? 'Not signed in'}</div>
              </div>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-dark-bg">
      <div className={`max-w-3xl mx-auto ${compactMode ? 'p-4 space-y-4' : 'p-8 space-y-6'}`}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Edit Content</h2>
            <p className="text-gray-300">Customize your resume sections</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeveloperMode(!developerMode)}
          >
            {developerMode ? "Hide" : "Developer Mode"}
          </Button>
        </div>

        {developerMode && (
          <Card glow="gold" className="mb-6 animate-slide-up">
            <label className="block text-sm font-semibold text-white mb-2">
              Resume JSON (Advanced)
            </label>
            <textarea
              value={JSON.stringify(resume, null, 2)}
              spellCheck={spellCheckEnabled}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value) as ResumeData;
                  onResumeChange(parsed);
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              rows={12}
              className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Edit JSON directly..."
            />
          </Card>
        )}

        {/* Profile Card */}
        <Card glow={expandedSections.has("profile") ? "purple" : false}>
          <button
            type="button"
            onClick={() => toggleSection("profile")}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-white">Profile</h3>
            <svg
              className={`w-5 h-5 text-gray-300 transition-transform ${
                expandedSections.has("profile") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has("profile") && (
            <div className="mt-6 pt-6 border-t border-dark-border animate-fade-in space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={resume.name}
                  spellCheck={spellCheckEnabled}
                  onChange={(e) => onResumeChange({ ...resume, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact</label>
                <input
                  type="text"
                  value={resume.contact}
                  spellCheck={spellCheckEnabled}
                  onChange={(e) => onResumeChange({ ...resume, contact: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Summary Card */}
        <Card glow={expandedSections.has("summary") ? "blue" : false}>
          <button
            type="button"
            onClick={() => toggleSection("summary")}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-white">Summary</h3>
            <svg
              className={`w-5 h-5 text-gray-300 transition-transform ${
                expandedSections.has("summary") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has("summary") && (
            <div className="mt-6 pt-6 border-t border-dark-border animate-fade-in">
              <textarea
                value={resume.summary}
                spellCheck={spellCheckEnabled}
                onChange={(e) => onResumeChange({ ...resume, summary: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
                placeholder="Write a brief professional summary..."
              />
            </div>
          )}
        </Card>

        {/* Skills Card */}
        <Card glow={expandedSections.has("skills") ? "gold" : false}>
          <button
            type="button"
            onClick={() => toggleSection("skills")}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-white">Skills</h3>
            <svg
              className={`w-5 h-5 text-gray-300 transition-transform ${
                expandedSections.has("skills") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has("skills") && (
            <div className="mt-6 pt-6 border-t border-dark-border animate-fade-in">
              <input
                type="text"
                value={resume.skills.join(", ")}
                spellCheck={spellCheckEnabled}
                onChange={(e) => {
                  const skills = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                  onResumeChange({ ...resume, skills });
                }}
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
                placeholder="React, Node.js, Python..."
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {resume.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 border rounded-full text-xs text-white"
                    style={{
                      background: `linear-gradient(135deg, var(--color-primary)20 0%, var(--color-secondary)20 100%)`,
                      borderColor: `var(--color-primary)50`
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Experience Card */}
        <Card glow={expandedSections.has("experience") ? "purple" : false}>
          <button
            type="button"
            onClick={() => toggleSection("experience")}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-white">Experience</h3>
            <svg
              className={`w-5 h-5 text-gray-300 transition-transform ${
                expandedSections.has("experience") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has("experience") && (
            <div className="mt-6 pt-6 border-t border-dark-border animate-fade-in space-y-4">
              {resume.experience.map((exp, idx) => (
                <div key={idx} className="p-4 bg-dark-surface rounded-lg border border-dark-border">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => {
                        const newExp = [...resume.experience];
                        newExp[idx] = { ...exp, title: e.target.value };
                        onResumeChange({ ...resume, experience: newExp });
                      }}
                      placeholder="Job Title"
                      className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...resume.experience];
                        newExp[idx] = { ...exp, company: e.target.value };
                        onResumeChange({ ...resume, experience: newExp });
                      }}
                      placeholder="Company"
                      className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
                    />
                  </div>
                  <textarea
                    value={exp.desc}
                    onChange={(e) => {
                      const newExp = [...resume.experience];
                      newExp[idx] = { ...exp, desc: e.target.value };
                      onResumeChange({ ...resume, experience: newExp });
                    }}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Education Card */}
        <Card glow={expandedSections.has("education") ? "blue" : false}>
          <button
            type="button"
            onClick={() => toggleSection("education")}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold text-white">Education</h3>
            <svg
              className={`w-5 h-5 text-gray-300 transition-transform ${
                expandedSections.has("education") ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has("education") && (
            <div className="mt-6 pt-6 border-t border-dark-border animate-fade-in space-y-4">
              {resume.education.map((edu, idx) => (
                <div key={idx} className="p-4 bg-dark-surface rounded-lg border border-dark-border">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...resume.education];
                      newEdu[idx] = { ...edu, degree: e.target.value };
                      onResumeChange({ ...resume, education: newEdu });
                    }}
                    placeholder="Degree"
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white mb-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={edu.college}
                      onChange={(e) => {
                        const newEdu = [...resume.education];
                        newEdu[idx] = { ...edu, college: e.target.value };
                        onResumeChange({ ...resume, education: newEdu });
                      }}
                      placeholder="College"
                      className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => {
                        const newEdu = [...resume.education];
                        newEdu[idx] = { ...edu, year: e.target.value };
                        onResumeChange({ ...resume, education: newEdu });
                      }}
                      placeholder="Year"
                      className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EditorPanel;
