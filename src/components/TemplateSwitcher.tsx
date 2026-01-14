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
        return <ProfessionalTemplate resume={resume} />;
      case "creative":
        return <CreativeTemplate resume={resume} />;
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

export default TemplateSwitcher;
