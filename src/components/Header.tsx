import React from "react";
import Button from "./ui/Button";
import ThemePicker from "./ThemePicker";

type HeaderProps = {
  onExport: () => void;
  onAbout: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  showAbout: boolean;
};

import { useAuth } from "../contexts/AuthContext";

const Header: React.FC<HeaderProps> = ({ onExport, onAbout, onSave, isSaving, showAbout }) => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-lg border-b border-dark-border-light">
      <div className="mx-auto flex max-w-[1920px] items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold gradient-text font-display">
                Resume Builder
              </h1>
              <span
                className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white rounded"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`
                }}
              >
                PRO
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-dark-card text-accent-gold border border-accent-gold/30 rounded">
                AI POWERED
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Create ATS-friendly resumes with AI optimization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemePicker />
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300 hidden md:inline">
                {user.name}
              </span>
              {onSave && (
                <Button variant="ghost" size="sm" onClick={onSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => {
                signOut();
                window.location.reload();
              }}>
                Sign Out
              </Button>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={onAbout}>
            {showAbout ? "Back to Builder" : "About"}
          </Button>
          <Button variant="primary" size="md" glow="purple" onClick={onExport}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export A4 PDF
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
