import React, { useMemo, useState } from "react";
import type { ResumeData } from "../types";
import Card from "./ui/Card";
import Button from "./ui/Button";
import {
  scoreResumeAgainstJobDescription,
  type JobMatchResult,
} from "../services/jobMatch";

type JobEntry = {
  id: string;
  title: string;
  description: string;
};

type ScoredJob = JobEntry & {
  result: JobMatchResult;
};

type MultiJobMatchDashboardProps = {
  resume: ResumeData;
  onResumeChange: (resume: ResumeData) => void;
  spellCheckEnabled?: boolean;
};

const makeId = () =>
  `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const MultiJobMatchDashboard: React.FC<MultiJobMatchDashboardProps> = ({
  resume,
  onResumeChange,
  spellCheckEnabled = true,
}) => {
  const [jobs, setJobs] = useState<JobEntry[]>(() => [
    { id: makeId(), title: "Job 1", description: "" },
  ]);
  const [results, setResults] = useState<Record<string, JobMatchResult>>({});
  const [error, setError] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const scoredJobs: ScoredJob[] = useMemo(() => {
    const out: ScoredJob[] = [];
    for (const j of jobs) {
      const r = results[j.id];
      if (!r) continue;
      out.push({ ...j, result: r });
    }

    out.sort((a, b) => b.result.score - a.result.score);
    return out;
  }, [jobs, results]);

  const bestJobId = useMemo(() => {
    if (scoredJobs.length === 0) return null;
    return scoredJobs[0].id;
  }, [scoredJobs]);

  const selected = useMemo(() => {
    if (!selectedJobId) return null;
    return scoredJobs.find((j) => j.id === selectedJobId) ?? null;
  }, [scoredJobs, selectedJobId]);

  const heatmapRows = useMemo(() => {
    if (scoredJobs.length === 0) return [] as { keyword: string; missingCount: number }[];

    const all = new Set<string>();
    for (const job of scoredJobs) {
      for (const k of job.result.keywords) all.add(k);
    }

    const rows = Array.from(all).map((keyword) => {
      const missingCount = scoredJobs.filter((j) => j.result.missing.includes(keyword)).length;
      return { keyword, missingCount };
    });

    rows.sort((a, b) => {
      if (b.missingCount !== a.missingCount) return b.missingCount - a.missingCount;
      return a.keyword.localeCompare(b.keyword);
    });

    return rows.slice(0, 25);
  }, [scoredJobs]);

  const analyzeAll = () => {
    setError("");

    const withText = jobs.filter((j) => j.description.trim());
    if (withText.length === 0) {
      setError("Add at least one job description");
      setResults({});
      setSelectedJobId(null);
      return;
    }

    const next: Record<string, JobMatchResult> = {};
    for (const j of withText) {
      next[j.id] = scoreResumeAgainstJobDescription(resume, j.description);
    }

    setResults(next);

    const sorted = withText
      .map((j) => ({ id: j.id, score: next[j.id]?.score ?? 0 }))
      .sort((a, b) => b.score - a.score);

    setSelectedJobId(sorted[0]?.id ?? null);
  };

  const addJob = () => {
    setJobs((prev) => [...prev, { id: makeId(), title: `Job ${prev.length + 1}`, description: "" }]);
  };

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSelectedJobId((prev) => (prev === id ? null : prev));
  };

  const updateJob = (id: string, patch: Partial<JobEntry>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  };

  const addMissingToSkills = (missing: string[]) => {
    const existing = new Set((resume.skills ?? []).map((s) => s.toLowerCase()));
    const toAdd = missing
      .slice(0, 12)
      .filter((k) => !existing.has(k.toLowerCase()));

    if (toAdd.length === 0) return;

    onResumeChange({
      ...resume,
      skills: [...(resume.skills ?? []), ...toAdd],
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-3xl font-bold text-white mb-2">Multi Job Match</h2>
        <p className="text-gray-300">Compare your resume against multiple job descriptions</p>
      </div>

      <Card glow="purple">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-white">Job list</div>
              <div className="text-xs text-gray-400">
                Add job descriptions, then run batch analysis.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={addJob}>
                + Add job
              </Button>
              <Button variant="secondary" size="sm" onClick={analyzeAll}>
                Analyze all
              </Button>
            </div>
          </div>

          {error && <div className="text-sm text-red-300">{error}</div>}

          <div className="space-y-4">
            {jobs.map((j, idx) => (
              <div
                key={j.id}
                className="p-4 rounded-lg border border-dark-border bg-dark-surface/40 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Job title</label>
                    <input
                      value={j.title}
                      onChange={(e) => updateJob(j.id, { title: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      style={{ backgroundColor: "#111111", color: "#fafafa" }}
                      placeholder={`Job ${idx + 1}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeJob(j.id)}
                      disabled={jobs.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Job description</label>
                  <textarea
                    rows={6}
                    spellCheck={spellCheckEnabled}
                    value={j.description}
                    onChange={(e) => updateJob(j.id, { description: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    style={{ backgroundColor: "#111111", color: "#fafafa" }}
                    placeholder="Paste the job description here..."
                  />
                </div>

                {results[j.id] && (
                  <div className="text-xs text-gray-300">
                    Last score: <span className="text-white font-semibold">{results[j.id].score}%</span>
                    {results[j.id].roleHint ? (
                      <span className="text-gray-400"> — {results[j.id].roleHint}</span>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {scoredJobs.length > 0 && (
        <Card glow="blue">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-white">Job comparison</div>
                <div className="text-xs text-gray-400">
                  Best match is highlighted. Click a row to view details.
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Compared: {scoredJobs.length} job(s)
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-300">
                    <th className="py-2 pr-3 font-semibold">Job</th>
                    <th className="py-2 pr-3 font-semibold">Score</th>
                    <th className="py-2 pr-3 font-semibold">Matched</th>
                    <th className="py-2 pr-3 font-semibold">Missing</th>
                    <th className="py-2 pr-3 font-semibold">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {scoredJobs.map((j) => {
                    const isBest = j.id === bestJobId;
                    const isSelected = j.id === selectedJobId;
                    return (
                      <tr
                        key={j.id}
                        onClick={() => setSelectedJobId(j.id)}
                        className={`border-t border-dark-border cursor-pointer transition-colors ${
                          isSelected ? "bg-dark-surface/60" : "hover:bg-dark-surface/40"
                        }`}
                        style={
                          isBest
                            ? {
                                boxShadow: "0 0 0 1px rgba(16,185,129,0.35) inset",
                              }
                            : undefined
                        }
                      >
                        <td className="py-3 pr-3 text-white font-semibold">
                          {j.title || "(Untitled)"}
                        </td>
                        <td className="py-3 pr-3 text-gray-200">{j.result.score}%</td>
                        <td className="py-3 pr-3 text-gray-200">{j.result.matched.length}</td>
                        <td className="py-3 pr-3 text-gray-200">{j.result.missing.length}</td>
                        <td className="py-3 pr-3">
                          {isBest ? (
                            <span className="text-xs px-2 py-1 rounded-full border border-green-500/40 text-green-300" style={{ backgroundColor: "#064e3b" }}>
                              Best match
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {scoredJobs.length > 0 && heatmapRows.length > 0 && (
        <Card glow="gold">
          <div className="space-y-3">
            <div>
              <div className="text-lg font-semibold text-white">Missing skills heatmap</div>
              <div className="text-xs text-gray-400">
                Red = missing, green = matched, gray = not requested by that job.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-300">
                    <th className="py-2 pr-3 font-semibold">Keyword</th>
                    <th className="py-2 pr-3 font-semibold">Missing in</th>
                    <th className="py-2 pr-3 font-semibold">
                      <div className="flex items-center gap-1">
                        {scoredJobs.map((j, idx) => (
                          <div
                            key={j.id}
                            className="w-6 text-center text-[10px] text-gray-400"
                            title={j.title || `Job ${idx + 1}`}
                          >
                            {idx + 1}
                          </div>
                        ))}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapRows.map((row) => {
                    const total = scoredJobs.length;
                    const ratio = total === 0 ? 0 : row.missingCount / total;
                    const hue = (1 - ratio) * 120;
                    return (
                      <tr key={row.keyword} className="border-t border-dark-border">
                        <td className="py-2 pr-3 text-white font-semibold">{row.keyword}</td>
                        <td className="py-2 pr-3">
                          <span
                            className="px-2 py-1 rounded-md text-xs text-white"
                            style={{ backgroundColor: `hsl(${hue}, 70%, 35%)` }}
                          >
                            {row.missingCount}/{total}
                          </span>
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-1">
                            {scoredJobs.map((job, idx) => {
                              const inKeywords = job.result.keywords.includes(row.keyword);
                              const isMissing = job.result.missing.includes(row.keyword);
                              const isMatched = job.result.matched.includes(row.keyword);

                              let bg = "#374151";
                              if (inKeywords && isMissing) bg = "#dc2626";
                              else if (inKeywords && isMatched) bg = "#16a34a";

                              return (
                                <div
                                  key={job.id}
                                  className="w-6 h-4 rounded-sm border border-black/20"
                                  style={{ backgroundColor: bg }}
                                  title={`${job.title || `Job ${idx + 1}`}: ${
                                    !inKeywords ? "not requested" : isMissing ? "missing" : "matched"
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {selected && (
        <Card glow={false}>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-white">Details</div>
                <div className="text-sm text-gray-300">
                  {selected.title || "(Untitled)"} — {selected.result.score}%
                </div>
                {selected.result.roleHint ? (
                  <div className="text-xs text-gray-400 mt-1">{selected.result.roleHint}</div>
                ) : null}
              </div>
              {selected.result.missing.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addMissingToSkills(selected.result.missing)}
                >
                  Add missing to Skills
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-dark-border bg-dark-surface/50">
                <div className="text-sm font-semibold text-white mb-2">Matched keywords</div>
                <div className="flex flex-wrap gap-2">
                  {selected.result.matched.length === 0 ? (
                    <span className="text-xs text-gray-400">None detected</span>
                  ) : (
                    selected.result.matched.map((k) => (
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
                  {selected.result.missing.length === 0 ? (
                    <span className="text-xs text-gray-400">Looks good</span>
                  ) : (
                    selected.result.missing.map((k) => (
                      <span
                        key={k}
                        className="px-2 py-1 rounded-full text-xs border border-orange-500/40 text-orange-300"
                        style={{ backgroundColor: "#7c2d12" }}
                      >
                        {k}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400">
              Tip: prioritize skills that are missing across many jobs (see heatmap).
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MultiJobMatchDashboard;
