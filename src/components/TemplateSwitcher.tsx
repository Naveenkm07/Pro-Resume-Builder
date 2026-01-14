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
  sectionOrder?: string[];
};

const TemplateSwitcher: React.FC<TemplateSwitcherProps> = ({
  selected,
  onChange,
  resume,
  previewOnly = false,
  sectionOrder,
}) => {
  const renderTemplate = () => {
    switch (selected) {
      case "professional":
      case "executive":
      case "academic":
        return <ProfessionalTemplate resume={resume} sectionOrder={sectionOrder} />;
      case "creative":
      case "portfolio":
      case "dynamic":
        return <CreativeTemplate resume={resume} sectionOrder={sectionOrder} />;
      case "modern":
      case "technical":
      case "bold":
      case "clean":
      case "sleek":
        return <ModernTemplate resume={resume} sectionOrder={sectionOrder} />;
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
        return <MinimalTemplate resume={resume} sectionOrder={sectionOrder} />;
      case "simple":
      default:
        return <SimpleTemplate resume={resume} sectionOrder={sectionOrder} />;
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
const SimpleTemplate: React.FC<{ resume: ResumeData; sectionOrder?: string[] }> = ({ resume, sectionOrder }) => {
  const order = sectionOrder || ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'];
  const renderSection = (section: string) => {
    switch (section) {
      case 'summary':
        return resume.summary && (
          <section key="summary" className="mb-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Summary</h2>
            <p className="text-xs text-slate-600">{resume.summary}</p>
          </section>
        );
      case 'skills':
        return resume.skills.length > 0 && (
          <section key="skills" className="mb-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Skills</h2>
            <p className="text-xs text-slate-600">{resume.skills.join(", ")}</p>
          </section>
        );
      case 'experience':
        return resume.experience.length > 0 && (
          <section key="experience" className="mb-4">
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
        );
      case 'education':
        return resume.education.length > 0 && (
          <section key="education">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Education</h2>
            {resume.education.map((edu, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold text-sm">{edu.degree}</div>
                <div className="text-xs text-slate-600">{edu.college}</div>
                <div className="text-[10px] text-slate-500">{edu.year}</div>
              </div>
            ))}
          </section>
        );
      case 'projects':
        return resume.projects.length > 0 && (
          <section key="projects" className="mb-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Projects</h2>
            {resume.projects.map((proj, idx) => (
              <div key={idx} className="mb-3">
                <div className="font-semibold text-sm">{proj.name}</div>
                <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                {proj.techStack && (
                  <p className="text-[10px] text-slate-500 mt-1">Tech Stack: {proj.techStack}</p>
                )}
                {proj.link && (
                  <a href={proj.link} className="text-[10px] text-blue-600 hover:underline mt-1 block">
                    {proj.link}
                  </a>
                )}
              </div>
            ))}
          </section>
        );
      case 'certifications':
        return resume.certifications && resume.certifications.length > 0 && (
          <section key="certifications" className="mb-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Certifications</h2>
            {resume.certifications.map((cert, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold text-sm">{cert.name}</div>
                {cert.issuer && (
                  <div className="text-xs text-slate-600">{cert.issuer}</div>
                )}
                {(cert.date || cert.credentialId) && (
                  <div className="text-[10px] text-slate-500">
                    {cert.date && <span>{cert.date}</span>}
                    {cert.date && cert.credentialId && <span> • </span>}
                    {cert.credentialId && <span>ID: {cert.credentialId}</span>}
                  </div>
                )}
                {cert.url && (
                  <a href={cert.url} className="text-[10px] text-blue-600 hover:underline mt-1 block">
                    {cert.url}
                  </a>
                )}
              </div>
            ))}
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full p-8 text-slate-900 text-sm">
      <header className="border-b border-slate-200 pb-4 mb-4">
        <h1 className="text-2xl font-bold">{resume.name}</h1>
        <p className="mt-1 text-xs text-slate-500">{resume.contact}</p>
      </header>
      {order.map(renderSection)}
    </div>
  );
};

// Professional Template Component
const ProfessionalTemplate: React.FC<{ resume: ResumeData; sectionOrder?: string[] }> = ({ resume, sectionOrder }) => {
  const order = sectionOrder || ["summary", "skills", "experience", "education", "projects", "certifications"];

  const renderSidebarSection = (section: string) => {
    switch (section) {
      case "summary":
        return (
          resume.summary && (
            <section key="summary" className="mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-1">
                Summary
              </h2>
              <p className="text-[11px] text-slate-100">{resume.summary}</p>
            </section>
          )
        );
      case "skills":
        return (
          resume.skills.length > 0 && (
            <section key="skills" className="mb-4">
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
          )
        );
      default:
        return null;
    }
  };

  const renderMainSection = (section: string) => {
    switch (section) {
      case "experience":
        return (
          resume.experience.length > 0 && (
            <section key="experience" className="mb-6">
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
          )
        );
      case "projects":
        return (
          resume.projects.length > 0 && (
            <section key="projects" className="mb-6">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-600 mb-2">
                Projects
              </h2>
              {resume.projects.map((proj, idx) => (
                <div key={idx} className="mb-4">
                  <div className="font-semibold">{proj.name}</div>
                  <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                  {proj.techStack && (
                    <p className="text-[10px] text-slate-500 mt-1">Tech Stack: {proj.techStack}</p>
                  )}
                  {proj.link && (
                    <a href={proj.link} className="text-[10px] text-blue-600 hover:underline mt-1 block">
                      {proj.link}
                    </a>
                  )}
                </div>
              ))}
            </section>
          )
        );
      case "education":
        return (
          resume.education.length > 0 && (
            <section key="education">
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
          )
        );
      case "certifications":
        return (
          resume.certifications && resume.certifications.length > 0 && (
            <section key="certifications">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-600 mb-2">
                Certifications
              </h2>
              {resume.certifications.map((cert, idx) => (
                <div key={idx} className="mb-3">
                  <div className="font-semibold">{cert.name}</div>
                  {cert.issuer && (
                    <div className="text-xs text-slate-600">{cert.issuer}</div>
                  )}
                  {(cert.date || cert.credentialId) && (
                    <div className="text-[10px] text-slate-500">
                      {cert.date && <span>{cert.date}</span>}
                      {cert.date && cert.credentialId && <span> • </span>}
                      {cert.credentialId && <span>ID: {cert.credentialId}</span>}
                    </div>
                  )}
                  {cert.url && (
                    <a href={cert.url} className="text-[10px] text-blue-600 hover:underline mt-1 block">
                      {cert.url}
                    </a>
                  )}
                </div>
              ))}
            </section>
          )
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex">
      <aside className="bg-slate-900 text-white p-6 text-xs w-1/3">
        <h1 className="text-lg font-bold mb-2">{resume.name}</h1>
        <p className="text-[11px] text-slate-200 mb-4">{resume.contact}</p>

        {order.map(renderSidebarSection)}
      </aside>

      <main className="p-8 text-slate-900 text-sm flex-1">
        {order.map(renderMainSection)}
      </main>
    </div>
  );
};

// Creative Template Component
const CreativeTemplate: React.FC<{ resume: ResumeData; sectionOrder?: string[] }> = ({ resume, sectionOrder }) => {
  const order = sectionOrder || ["summary", "skills", "experience", "education", "projects", "certifications"];

  const renderFullWidthSection = (section: string) => {
    switch (section) {
      case "summary":
        return (
          resume.summary && (
            <section key="summary" className="mb-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">About</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{resume.summary}</p>
            </section>
          )
        );
      case "skills":
        return (
          resume.skills.length > 0 && (
            <section key="skills" className="mt-6">
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
          )
        );
      default:
        return null;
    }
  };

  const gridSections = order.filter((s) => s === "experience" || s === "projects" || s === "education" || s === "certifications");
  const renderGridSection = (section: string) => {
    switch (section) {
      case "experience":
        return (
          resume.experience.length > 0 && (
            <section key="experience">
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
          )
        );
      case "projects":
        return (
          resume.projects.length > 0 && (
            <section key="projects">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 border-b-2 border-pink-500 pb-1">
                Projects
              </h2>
              {resume.projects.map((proj, idx) => (
                <div key={idx} className="mb-4">
                  <div className="font-semibold text-slate-800">{proj.name}</div>
                  <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                  {proj.techStack && (
                    <p className="text-[10px] text-slate-500 mt-1">Tech Stack: {proj.techStack}</p>
                  )}
                  {proj.link && (
                    <a href={proj.link} className="text-[10px] text-blue-600 hover:underline mt-1 block">
                      {proj.link}
                    </a>
                  )}
                </div>
              ))}
            </section>
          )
        );
      case "education":
        return (
          resume.education.length > 0 && (
            <section key="education">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 border-b-2 border-pink-500 pb-1">
                Education
              </h2>
              {resume.education.map((edu, idx) => (
                <div key={idx} className="mb-3">
                  <div className="font-semibold text-slate-800">{edu.degree}</div>
                  <div className="text-[11px] text-slate-600">{edu.college}</div>
                  <div className="text-[10px] text-slate-500">{edu.year}</div>
                </div>
              ))}
            </section>
          )
        );
      case "certifications":
        return (
          resume.certifications && resume.certifications.length > 0 && (
            <section key="certifications">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 border-b-2 border-pink-500 pb-1">
                Certifications
              </h2>
              {resume.certifications.map((cert, idx) => (
                <div key={idx} className="mb-3">
                  <div className="font-semibold text-slate-800">{cert.name}</div>
                  {cert.issuer && (
                    <div className="text-[11px] text-slate-600">{cert.issuer}</div>
                  )}
                  {(cert.date || cert.credentialId) && (
                    <div className="text-[10px] text-slate-500">
                      {cert.date && <span>{cert.date}</span>}
                      {cert.date && cert.credentialId && <span> • </span>}
                      {cert.credentialId && <span>ID: {cert.credentialId}</span>}
                    </div>
                  )}
                  {cert.url && (
                    <a href={cert.url} className="text-[10px] text-blue-600 hover:underline mt-1 block">
                      {cert.url}
                    </a>
                  )}
                </div>
              ))}
            </section>
          )
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative h-full p-8 text-slate-900 text-sm">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>

      <header className="mt-4 mb-6">
        <h1 className="text-3xl font-bold mb-2">{resume.name}</h1>
        <p className="mt-1 text-xs text-slate-500">{resume.contact}</p>
      </header>

      {order.map(renderFullWidthSection)}

      <div className="grid grid-cols-2 gap-6">
        {gridSections.map(renderGridSection)}
      </div>
    </div>
  );
};

// Modern Template - two-column with strong accent bar
const ModernTemplate: React.FC<{ resume: ResumeData; sectionOrder?: string[] }> = ({ resume, sectionOrder }) => {
  const order = sectionOrder || ["summary", "skills", "experience", "education", "projects", "certifications"];

  const renderAsideSection = (section: string) => {
    switch (section) {
      case "summary":
        return (
          resume.summary && (
            <section key="summary">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">Profile</h2>
              <p className="text-[11px] text-slate-700 leading-relaxed line-clamp-6">{resume.summary}</p>
            </section>
          )
        );
      case "skills":
        return (
          resume.skills.length > 0 && (
            <section key="skills">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">Key Skills</h2>
              <ul className="text-[11px] text-slate-700 space-y-0.5 list-disc list-inside">
                {resume.skills.slice(0, 10).map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </section>
          )
        );
      case "education":
        return (
          resume.education.length > 0 && (
            <section key="education">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">Education</h2>
              {resume.education.map((edu, idx) => (
                <div key={idx} className="mb-1.5">
                  <div className="text-[11px] font-semibold text-slate-800">{edu.degree}</div>
                  <div className="text-[10px] text-slate-600">{edu.college}</div>
                  <div className="text-[10px] text-slate-500">{edu.year}</div>
                </div>
              ))}
            </section>
          )
        );
      case "certifications":
        return (
          resume.certifications && resume.certifications.length > 0 && (
            <section key="certifications">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">Certifications</h2>
              {resume.certifications.map((cert, idx) => (
                <div key={idx} className="mb-1.5">
                  <div className="text-[11px] font-semibold text-slate-800">{cert.name}</div>
                  {cert.issuer && (
                    <div className="text-[10px] text-slate-600">{cert.issuer}</div>
                  )}
                  {(cert.date || cert.credentialId) && (
                    <div className="text-[10px] text-slate-500">
                      {cert.date && <span>{cert.date}</span>}
                      {cert.date && cert.credentialId && <span> • </span>}
                      {cert.credentialId && <span>ID: {cert.credentialId}</span>}
                    </div>
                  )}
                  {cert.url && (
                    <a href={cert.url} className="text-[10px] text-blue-600 hover:underline mt-1 block">
                      {cert.url}
                    </a>
                  )}
                </div>
              ))}
            </section>
          )
        );
      default:
        return null;
    }
  };

  const renderMainSection = (section: string) => {
    switch (section) {
      case "experience":
        return (
          resume.experience.length > 0 && (
            <section key="experience">
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
          )
        );
      case "projects":
        return (
          resume.projects.length > 0 && (
            <section key="projects">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-2">Projects</h2>
              {resume.projects.map((proj, idx) => (
                <div key={idx} className="mb-3 pb-2 border-b border-slate-200 last:border-0 last:pb-0">
                  <div className="text-sm font-semibold text-slate-900">{proj.name}</div>
                  <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">{proj.description}</p>
                  {proj.techStack && (
                    <p className="text-[10px] text-slate-500 mt-1">Tech Stack: {proj.techStack}</p>
                  )}
                  {proj.link && (
                    <a href={proj.link} className="text-[10px] text-blue-600 hover:underline mt-1 block">
                      {proj.link}
                    </a>
                  )}
                </div>
              ))}
            </section>
          )
        );
      default:
        return null;
    }
  };

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
            {order.map(renderAsideSection)}
          </aside>

          <main className="col-span-2 space-y-4">
            {order.map(renderMainSection)}
          </main>
        </div>
      </div>
    </div>
  );
};

// Minimal Template - ultra-clean single-column
const MinimalTemplate: React.FC<{ resume: ResumeData; sectionOrder?: string[] }> = ({ resume, sectionOrder }) => {
  const order = sectionOrder || ["summary", "skills", "experience", "education", "projects", "certifications"];
  const renderSection = (section: string) => {
    switch (section) {
      case "summary":
        return (
          resume.summary && (
            <section key="summary">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">Summary</h2>
              <p className="text-[11px] text-slate-700 leading-relaxed">{resume.summary}</p>
            </section>
          )
        );
      case "experience":
        return (
          resume.experience.length > 0 && (
            <section key="experience">
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
          )
        );
      case "projects":
        return (
          resume.projects.length > 0 && (
            <section key="projects">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-2">Projects</h2>
              <div className="space-y-3">
                {resume.projects.map((proj, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{proj.name}</span>
                    <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">{proj.description}</p>
                    {proj.techStack && (
                      <p className="text-[10px] text-slate-500">Tech Stack: {proj.techStack}</p>
                    )}
                    {proj.link && (
                      <a href={proj.link} className="text-[10px] text-blue-600 hover:underline">
                        {proj.link}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )
        );
      case "education":
        return (
          resume.education.length > 0 && (
            <section key="education">
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
          )
        );
      case "skills":
        return (
          resume.skills.length > 0 && (
            <section key="skills">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">Skills</h2>
              <p className="text-[11px] text-slate-700">{resume.skills.join(", ")}</p>
            </section>
          )
        );
      case "certifications":
        return (
          resume.certifications && resume.certifications.length > 0 && (
            <section key="certifications">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">Certifications</h2>
              <div className="space-y-2">
                {resume.certifications.map((cert, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{cert.name}</span>
                    {cert.issuer && (
                      <span className="text-[11px] text-slate-600">{cert.issuer}</span>
                    )}
                    {(cert.date || cert.credentialId) && (
                      <span className="text-[10px] text-slate-500">
                        {cert.date && <span>{cert.date}</span>}
                        {cert.date && cert.credentialId && <span> • </span>}
                        {cert.credentialId && <span>ID: {cert.credentialId}</span>}
                      </span>
                    )}
                    {cert.url && (
                      <a href={cert.url} className="text-[10px] text-blue-600 hover:underline">
                        {cert.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-white text-slate-900">
      <div className="px-10 py-8 h-full flex flex-col">
        <header className="mb-6">
          <h1 className="text-[26px] font-semibold tracking-tight">{resume.name}</h1>
          <p className="mt-1 text-[11px] text-slate-500">{resume.contact}</p>
        </header>

        <div className="space-y-5 flex-1">
          {order.map(renderSection)}
        </div>
      </div>
    </div>
  );
};

export default TemplateSwitcher;
