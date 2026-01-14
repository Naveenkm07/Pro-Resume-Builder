import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { SAMPLE_RESUME, type ResumeData } from "./types";
import { TemplateType } from "./components/TemplateSwitcher";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import EditorPanel from "./components/EditorPanel";
import PreviewPanel from "./components/PreviewPanel";
import About from "./components/About";
import StartupLandingPage from "./components/StartupLandingPage";
import ConversionLandingPage from "./components/ConversionLandingPage";
import AuthCallback from "./pages/AuthCallback";
import AuthPage from "./pages/AuthPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ContactPage from "./pages/ContactPage";
import { useAuth } from "./contexts/AuthContext";
import { ApiService } from "./services/api";
import { tailorResumeForRole, ROLE_TEMPLATES, type RoleTemplateId } from "./services/tailoring";
import ExportWizard from "./components/ExportWizard";

const AppContent: React.FC = () => {
  const [resume, setResume] = useState<ResumeData>(SAMPLE_RESUME);
  const [resumeVersions, setResumeVersions] = useState<ResumeData[]>([]);
  const [activeVersionName, setActiveVersionName] = useState<string>('Base');
  const [showExportWizard, setShowExportWizard] = useState(false);
  const [optimizeLayoutOrder, setOptimizeLayoutOrder] = useState(() => {
    const raw = localStorage.getItem("optimizeLayoutOrder");
    return raw ? raw === "true" : false;
  });
  const [template, setTemplate] = useState<TemplateType>(() => {
    const rememberLast = localStorage.getItem("rememberLastTemplate") === "true";
    if (rememberLast) {
      const last = localStorage.getItem("lastTemplate");
      if (last === "simple" || last === "professional" || last === "creative") {
        return last;
      }
    }
    const defaultT = localStorage.getItem("defaultTemplate");
    return (defaultT === "simple" || defaultT === "professional" || defaultT === "creative") ? defaultT : "simple";
  });
  const [showAbout, setShowAbout] = useState(false);
  const [activeSection, setActiveSection] = useState("edit");
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const [showLanding, setShowLanding] = useState(!user);
  
  // PDF export options state
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

  const handleResumeChange = (updatedResume: ResumeData) => {
    setResume(updatedResume);
    setResumeVersions(prev => prev.map(v => 
      v.versionName === activeVersionName ? { ...updatedResume, versionName: activeVersionName } : v
    ));
  };

  const handleOptimizeLayoutOrderChange = (enabled: boolean) => {
    setOptimizeLayoutOrder(enabled);
    localStorage.setItem("optimizeLayoutOrder", String(enabled));
  };

  const handleVersionSwitch = (versionName: string) => {
    const version = resumeVersions.find(v => v.versionName === versionName);
    if (version) {
      setActiveVersionName(versionName);
      setResume(version);
    }
  };

  const handleCreateVersion = () => {
    const roleOptions = Object.entries(ROLE_TEMPLATES).map(([id, template]) => ({
      id,
      label: template.label,
    }));
    
    const roleChoice = prompt(
      `Select a role to tailor for:\n${roleOptions.map((r, i) => `${i + 1}. ${r.label}`).join('\n')}\n\nEnter number (1-${roleOptions.length}):`
    );
    
    const roleIndex = parseInt(roleChoice || '', 10) - 1;
    if (isNaN(roleIndex) || roleIndex < 0 || roleIndex >= roleOptions.length) {
      alert('Invalid selection');
      return;
    }
    
    const selectedRole = roleOptions[roleIndex].id as RoleTemplateId;
    const versionName = prompt(`Enter version name for ${ROLE_TEMPLATES[selectedRole].label} resume:`);
    
    if (versionName && versionName.trim()) {
      const tailoredResume = tailorResumeForRole(resume, selectedRole);
      const newVersion = {
        ...tailoredResume,
        versionName: versionName.trim(),
        _id: undefined,
      };
      setResumeVersions(prev => [...prev, newVersion]);
      setActiveVersionName(versionName.trim());
      setResume(newVersion);
    }
  };

  // Load resume when user logs in
  useEffect(() => {
    if (user) {
      setShowLanding(false);

      const loadResume = async () => {
        const allVersions = await ApiService.getResumes();
        if (allVersions && allVersions.length > 0) {
          setResumeVersions(allVersions);
          const baseVersion = allVersions.find(v => v.versionName === 'Base');
          if (baseVersion) {
            setActiveVersionName('Base');
            setResume(baseVersion);
          } else {
            setActiveVersionName(allVersions[0].versionName || 'Base');
            setResume(allVersions[0]);
          }
        }
      };
      loadResume();
    } else {
      setShowLanding(true);
    }
  }, [user]);

  useEffect(() => {
    if (localStorage.getItem("rememberLastTemplate") === "true") {
      localStorage.setItem("lastTemplate", template);
    }
  }, [template]);

  const handleUploadParsed = (data: ResumeData) => {
    const updatedResume = { ...data, versionName: activeVersionName };
    setResume(updatedResume);
    setResumeVersions(prev => prev.map(v => 
      v.versionName === activeVersionName ? updatedResume : v
    ));
    setActiveSection("edit");
  };

  const handleExport = () => {
    setShowExportWizard(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await ApiService.saveResume(resume);
      // Optional: Add toast notification here
      alert("Resume saved successfully!");
    } catch (error) {
      alert("Failed to save resume.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetStarted = () => {
    setShowLanding(false);
    setActiveSection("upload");
  };

  if (showLanding && !user) {
    return <ConversionLandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Header
        onExport={handleExport}
        onAbout={() => setShowAbout(!showAbout)}
        showAbout={showAbout}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {showAbout ? (
        <main className="flex-1">
          <About />
        </main>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <div className="flex-1 flex flex-col overflow-hidden ml-16">
            {resumeVersions.length > 0 && (
              <div className="border-b border-dark-border bg-dark-surface px-4 py-2 flex items-center gap-2 overflow-x-auto">
                {resumeVersions.map((v) => (
                  <button
                    key={v.versionName || 'Base'}
                    type="button"
                    onClick={() => handleVersionSwitch(v.versionName || 'Base')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                      activeVersionName === (v.versionName || 'Base')
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-dark-card text-gray-300 hover:bg-dark-border hover:text-white'
                    }`}
                  >
                    {v.versionName || 'Base'}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleCreateVersion}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-dark-card text-gray-300 hover:bg-dark-border hover:text-white transition-all whitespace-nowrap"
                >
                  + New Version
                </button>
              </div>
            )}
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/2 border-r border-dark-border overflow-hidden">
                <EditorPanel
                  resume={resume}
                  onResumeChange={handleResumeChange}
                  onUploadParsed={handleUploadParsed}
                  activeSection={activeSection}
                  template={template}
                  onTemplateChange={setTemplate}
                  optimizeLayoutOrder={optimizeLayoutOrder}
                  onOptimizeLayoutOrderChange={handleOptimizeLayoutOrderChange}
                />
              </div>

              <div className="w-1/2 overflow-hidden">
                <PreviewPanel
                  resume={resume}
                  template={template}
                  onTemplateChange={setTemplate}
                  optimizeLayoutOrder={optimizeLayoutOrder}
                  onOptimizeLayoutOrderChange={handleOptimizeLayoutOrderChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Wizard */}
      <ExportWizard
        isOpen={showExportWizard}
        onClose={() => setShowExportWizard(false)}
        resume={resume}
        pageSize={pageSize}
        marginMm={marginMm}
        scalePercent={scalePercent}
        onPageSizeChange={setPageSize}
        onMarginChange={setMarginMm}
        onScaleChange={setScalePercent}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/" element={<AppContent />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

