import React from "react";
import { type ResumeData } from "../types";
import { TemplateType } from "./TemplateSwitcher";
import A4Preview from "./A4Preview";
import TemplateSwitcher from "./TemplateSwitcher";
import Button from "./ui/Button";
import { getOptimizedSectionOrder } from "../services/sectionOrderOptimizer";

type PreviewPanelProps = {
  resume: ResumeData;
  template: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
  optimizeLayoutOrder: boolean;
  onOptimizeLayoutOrderChange: (enabled: boolean) => void;
};

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  resume,
  template,
  onTemplateChange,
  optimizeLayoutOrder,
  onOptimizeLayoutOrderChange,
}) => {
  const effectiveSectionOrder = optimizeLayoutOrder
    ? getOptimizedSectionOrder(resume)
    : resume.sectionOrder;

  return (
    <div className="h-full overflow-y-auto bg-dark-bg relative">
      {/* Spotlight effect background */}
      <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="sticky top-0 z-10 glass-lg border-b border-dark-border-light px-8 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Live Preview</h2>
            <p className="text-xs text-gray-300">A4 format • Print-ready</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {(["simple", "professional", "creative"] as TemplateType[]).map((t) => (
                <Button
                  key={t}
                  variant={template === t ? "primary" : "secondary"}
                  size="sm"
                  glow={template === t ? "purple" : undefined}
                  onClick={() => onTemplateChange(t)}
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={optimizeLayoutOrder}
                onChange={(e) => onOptimizeLayoutOrderChange(e.target.checked)}
                className="rounded border-dark-border bg-dark-card text-primary focus:ring-primary"
              />
              Optimize layout order
            </label>
          </div>
        </div>
      </div>
      
      <div className="p-12 spotlight">
        <div className="max-w-4xl mx-auto flex justify-center animate-float">
          <div className="w-full max-w-[210mm] relative z-10">
            <A4Preview>
              <div className="p-4">
                <TemplateSwitcher
                  selected={template}
                  onChange={onTemplateChange}
                  resume={resume}
                  previewOnly
                  sectionOrder={effectiveSectionOrder}
                />
              </div>
            </A4Preview>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
