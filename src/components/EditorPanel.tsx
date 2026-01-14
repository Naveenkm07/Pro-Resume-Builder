import React, { useState } from "react";
import { type ResumeData } from "../types";
import Upload from "./Upload";
import Card from "./ui/Card";
import Button from "./ui/Button";

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["profile", "summary"])
  );
  const [developerMode, setDeveloperMode] = useState(false);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (activeSection === "upload") {
    return (
      <div className="h-full overflow-y-auto p-8 bg-dark-bg">
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
      <div className="h-full overflow-y-auto p-8 bg-dark-bg">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Templates</h2>
            <p className="text-gray-300">Choose a template that matches your style</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {["Simple", "Professional", "Creative"].map((template) => (
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

  return (
    <div className="h-full overflow-y-auto bg-dark-bg">
      <div className="max-w-3xl mx-auto p-8 space-y-6">
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
                  onChange={(e) => onResumeChange({ ...resume, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
                  style={{ backgroundColor: '#111111', color: '#fafafa' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact</label>
                <input
                  type="text"
                  value={resume.contact}
                  onChange={(e) => onResumeChange({ ...resume, contact: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
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
