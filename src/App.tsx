import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SAMPLE_RESUME, type ResumeData } from "./types";
import { TemplateType } from "./components/TemplateSwitcher";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import EditorPanel from "./components/EditorPanel";
import PreviewPanel from "./components/PreviewPanel";
import About from "./components/About";
import StartupLandingPage from "./components/StartupLandingPage";
import ConversionLandingPage from "./components/ConversionLandingPage";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./contexts/AuthContext";
import { ApiService } from "./services/api";

const AppContent: React.FC = () => {
  const [resume, setResume] = useState<ResumeData>(SAMPLE_RESUME);
  const [template, setTemplate] = useState<TemplateType>("simple");
  const [showAbout, setShowAbout] = useState(false);
  const [activeSection, setActiveSection] = useState("edit");
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const [showLanding, setShowLanding] = useState(!user);

  // Load resume when user logs in
  React.useEffect(() => {
    if (user) {
      setShowLanding(false);

      const loadResume = async () => {
        const savedResume = await ApiService.getResume();
        if (savedResume) {
          // Merge with sample to ensure all fields exist if partial save
          setResume(savedResume);
        }
      };
      loadResume();
    } else {
      setShowLanding(true);
    }
  }, [user]);

  const handleUploadParsed = (data: ResumeData) => {
    setResume(data);
    setActiveSection("edit");
  };

  const handleExport = () => {
    window.print();
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

          <div className="flex-1 flex overflow-hidden ml-16">
            <div className="w-1/2 border-r border-dark-border overflow-hidden">
              <EditorPanel
                resume={resume}
                onResumeChange={setResume}
                onUploadParsed={handleUploadParsed}
                activeSection={activeSection}
              />
            </div>

            <div className="w-1/2 overflow-hidden">
              <PreviewPanel
                resume={resume}
                template={template}
                onTemplateChange={setTemplate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<AppContent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
