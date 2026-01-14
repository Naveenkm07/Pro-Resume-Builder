import React from "react";
import type { ResumeData } from "../types";
import A4Preview from "./A4Preview";

export type TemplateType = 
  | "simple" | "professional" | "creative"
  | "modern" | "minimal" | "executive" | "academic" | "technical" | "portfolio" | "bold" | "clean" | "compact" | "elegant" | "classic" | "stylish" | "fresh" | "sharp" | "zen" | "focus" | "vivid" | "sleek" | "smart" | "dynamic" | "elite";

type TemplateSwitcherProps = {
  selected: TemplateType;
  onChange: (template: TemplateType) => void;
  resume: ResumeData;
  previewOnly?: boolean;
};

const TemplateSwitcher: React.FC<TemplateSwitcherProps> = ({
  selected,
  onChange,
  resume,
  previewOnly = false,
}) => {
  const renderTemplate = () => {
    switch (selected) {
      case "professional":
      case "executive":
      case "academic":
        return <ProfessionalTemplate resume={resume} />;
      case "creative":
      case "portfolio":
      case "dynamic":
        return <CreativeTemplate resume={resume} />;
      case "modern":
      case "technical":
      case "bold":
      case "clean":
      case "sleek":
        return <ModernTemplate resume={resume} />;
      case "minimal":
      case "compact":
      case "elegant":
      case "classic":
      case "stylish":
      case "fresh":
      case "sharp":
      case "zen":
      case "focus":
      case "vivid":
      case "smart":
      case "elite":
        return <MinimalTemplate resume={resume} />;
      case "simple":
      default:
        return <SimpleTemplate resume={resume} />;
    }
  };

  if (previewOnly) {
    return <>{renderTemplate()}</>;
  }

  const getButtonStyle = (isSelected: boolean) => {
    if (!isSelected) return undefined;
    return {
      background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
      boxShadow: `0 0 20px ${getComputedStyle(document.documentElement).getPropertyValue('--color-primary')}40`
    };
  };

  const allTemplates: TemplateType[] = [
    "simple", "professional", "creative", "modern", "minimal", "executive", "academic", "technical",
    "portfolio", "bold", "clean", "compact", "elegant", "classic", "stylish", "fresh", "sharp",
    "zen", "focus", "vivid", "sleek", "smart", "dynamic", "elite"
  ];

  return (
    <div className="space-y-4">
      <div className={`grid gap-2 ${previewOnly ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6'} max-h-48 overflow-y-auto pr-1`}>
        {allTemplates.map((tpl) => (
          <button
            key={tpl}
            type="button"
            onClick={() => onChange(tpl)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              selected === tpl
                ? "text-white shadow-sm"
                : "bg-dark-card text-gray-300 border border-dark-border hover:bg-dark-surface hover:text-white"
            }`}
            style={getButtonStyle(selected === tpl)}
          >
            {tpl.charAt(0).toUpperCase() + tpl.slice(1)}
          </button>
        ))}
      </div>

      <div className="print-area">
        <A4Preview>{renderTemplate()}</A4Preview>
      </div>
    </div>
  );
};

// Simple Template Component
const SimpleTemplate: React.FC<{ resume: ResumeData }> = ({ resume }) => {
  return (
    <div className="h-full p-8 text-slate-900 text-sm">
      <header className="border-b border-slate-200 pb-4 mb-4">
        <h1 className="text-2xl font-bold">{resume.name}</h1>
        <p className="mt-1 text-xs text-slate-500">{resume.contact}</p>
      </header>

      {resume.summary && (
        <section className="mb-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Summary</h2>
          <p className="text-xs text-slate-600">{resume.summary}</p>
        </section>
      )}

      {resume.skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Skills</h2>
          <p className="text-xs text-slate-600">{resume.skills.join(", ")}</p>
        </section>
      )}

      {resume.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">
            Experience
          </h2>
          {resume.experience.map((exp, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-sm">{exp.title}</div>
                  <div className="text-xs text-slate-600">{exp.company}</div>
                </div>
                <div className="text-[10px] text-slate-500 mb-0.5">
                  {exp.from} - {exp.to || "Present"}
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-1">{exp.desc}</p>
            </div>
          ))}
        </section>
      )}

      {resume.education.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Education</h2>
          {resume.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="font-semibold text-sm">{edu.degree}</div>
              <div className="text-xs text-slate-600">{edu.college}</div>
              <div className="text-[10px] text-slate-500">{edu.year}</div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

// Professional Template Component
const ProfessionalTemplate: React.FC<{ resume: ResumeData }> = ({ resume }) => {
  return (
    <div className="h-full flex">
      <aside className="bg-slate-900 text-white p-6 text-xs w-1/3">
        <h1 className="text-lg font-bold mb-2">{resume.name}</h1>
        <p className="text-[11px] text-slate-200 mb-4">{resume.contact}</p>

        {resume.summary && (
          <section className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-1">
              Summary
            </h2>
            <p className="text-[11px] text-slate-100">{resume.summary}</p>
          </section>
        )}

        {resume.skills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1">
              {resume.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </aside>

      <main className="p-8 text-slate-900 text-sm flex-1">
        {resume.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-600 mb-2">
              Experience
            </h2>
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <div className="font-semibold">{exp.title}</div>
                    <div className="text-xs text-slate-600">{exp.company}</div>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {exp.from} - {exp.to || "Present"}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{exp.desc}</p>
              </div>
            ))}
          </section>
        )}

        {resume.education.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-600 mb-2">
              Education
            </h2>
            {resume.education.map((edu, idx) => (
              <div key={idx} className="mb-3">
                <div className="font-semibold">{edu.degree}</div>
                <div className="text-xs text-slate-600">{edu.college}</div>
                <span className="text-[10px] text-slate-500">{edu.year}</span>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

// Creative Template Component
const CreativeTemplate: React.FC<{ resume: ResumeData }> = ({ resume }) => {
  return (
    <div className="relative h-full p-8 text-slate-900 text-sm">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>

      <header className="mt-4 mb-6">
        <h1 className="text-3xl font-bold mb-2">{resume.name}</h1>
        <p className="mt-1 text-xs text-slate-500">{resume.contact}</p>
      </header>

      {resume.summary && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">About</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{resume.summary}</p>
        </section>
      )}

      <div className="grid grid-cols-2 gap-6">
        {resume.experience.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 border-b-2 border-purple-500 pb-1">
              Experience
            </h2>
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="mb-4">
                <div className="font-semibold text-slate-800">
                  {exp.title} at {exp.company}
                </div>
                <div className="text-[10px] text-slate-500">
                  {exp.from} - {exp.to || "Present"}
                </div>
                <p className="text-xs text-slate-600 mt-1">{exp.desc}</p>
              </div>
            ))}
          </section>
        )}

        {resume.education.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 border-b-2 border-pink-500 pb-1">
              Education
            </h2>
            {resume.education.map((edu, idx) => (
              <div key={idx} className="mb-3">
                <div className="font-semibold text-slate-800">
                  {edu.degree}
                </div>
                <div className="text-[11px] text-slate-600">{edu.college}</div>
                <div className="text-[10px] text-slate-500">{edu.year}</div>
              </div>
            ))}
          </section>
        )}
      </div>

      {resume.skills.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-xs text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// Modern Template - two-column with strong accent bar
const ModernTemplate: React.FC<{ resume: ResumeData }> = ({ resume }) => {
  return (
    <div className="relative h-full text-slate-900 text-sm bg-slate-50">
      <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
      <div className="pl-6 pr-8 py-6 h-full flex flex-col">
        <header className="mb-4 pb-3 border-b border-slate-200 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{resume.name}</h1>
            <p className="mt-1 text-xs text-slate-500">{resume.contact}</p>
          </div>
          {resume.skills.length > 0 && (
            <div className="hidden md:flex flex-wrap gap-1 max-w-xs justify-end">
              {resume.skills.slice(0, 6).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-indigo-50 text-[10px] text-indigo-700 border border-indigo-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="grid grid-cols-3 gap-6 flex-1">
          <aside className="col-span-1 space-y-4">
            {resume.summary && (
              <section>
                <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">Profile</h2>
                <p className="text-[11px] text-slate-700 leading-relaxed line-clamp-6">{resume.summary}</p>
              </section>
            )}

            {resume.skills.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">Key Skills</h2>
                <ul className="text-[11px] text-slate-700 space-y-0.5 list-disc list-inside">
                  {resume.skills.slice(0, 10).map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  ))}
                </ul>
              </section>
            )}

            {resume.education.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">Education</h2>
                {resume.education.map((edu, idx) => (
                  <div key={idx} className="mb-1.5">
                    <div className="text-[11px] font-semibold text-slate-800">{edu.degree}</div>
                    <div className="text-[10px] text-slate-600">{edu.college}</div>
                    <div className="text-[10px] text-slate-500">{edu.year}</div>
                  </div>
                ))}
              </section>
            )}
          </aside>

          <main className="col-span-2 space-y-4">
            {resume.experience.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-2">Experience</h2>
                {resume.experience.map((exp, idx) => (
                  <div key={idx} className="mb-3 pb-2 border-b border-slate-200 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{exp.title}</div>
                        <div className="text-[11px] text-slate-600">{exp.company}</div>
                      </div>
                      <div className="text-[10px] text-slate-500 whitespace-nowrap">
                        {exp.from} - {exp.to || "Present"}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">{exp.desc}</p>
                  </div>
                ))}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// Minimal Template - ultra-clean single-column
const MinimalTemplate: React.FC<{ resume: ResumeData }> = ({ resume }) => {
  return (
    <div className="h-full bg-white text-slate-900">
      <div className="px-10 py-8 h-full flex flex-col">
        <header className="mb-6">
          <h1 className="text-[26px] font-semibold tracking-tight">{resume.name}</h1>
          <p className="mt-1 text-[11px] text-slate-500">{resume.contact}</p>
        </header>

        <div className="space-y-5 flex-1">
          {resume.summary && (
            <section>
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">Summary</h2>
              <p className="text-[11px] text-slate-700 leading-relaxed">{resume.summary}</p>
            </section>
          )}

          {resume.experience.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-2">Experience</h2>
              <div className="space-y-3">
                {resume.experience.map((exp, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium">{exp.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {exp.from} - {exp.to || "Present"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600">{exp.company}</span>
                    <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {resume.education.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-2">Education</h2>
              <div className="space-y-2">
                {resume.education.map((edu, idx) => (
                  <div key={idx} className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[11px] font-medium text-slate-800">{edu.degree}</div>
                      <div className="text-[11px] text-slate-600">{edu.college}</div>
                    </div>
                    <div className="text-[10px] text-slate-500">{edu.year}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {resume.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">Skills</h2>
              <p className="text-[11px] text-slate-700">{resume.skills.join(", ")}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateSwitcher;
