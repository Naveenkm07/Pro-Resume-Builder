import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ResumeData } from '../types';
import Button from './ui/Button';

type ExportWizardProps = {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  pageSize: 'A4' | 'Letter';
  marginMm: number;
  scalePercent: number;
  onPageSizeChange: (size: 'A4' | 'Letter') => void;
  onMarginChange: (margin: number) => void;
  onScaleChange: (scale: number) => void;
};

const ExportWizard: React.FC<ExportWizardProps> = ({
  isOpen,
  onClose,
  resume,
  pageSize,
  marginMm,
  scalePercent,
  onPageSizeChange,
  onMarginChange,
  onScaleChange,
}) => {
  const [atsSafeMode, setAtsSafeMode] = useState(false);
  const [filename, setFilename] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Generate filename based on resume data
  useEffect(() => {
    const generateFilename = () => {
      const currentYear = new Date().getFullYear();
      const name = resume.name
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
      
      // Try to extract role from experience or education
      let role = 'professional';
      if (resume.experience.length > 0) {
        role = resume.experience[0].title
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase();
      } else if (resume.education.length > 0) {
        role = resume.education[0].degree
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase();
      }
      
      // Limit role length and clean it up
      role = role.substring(0, 30).replace(/-$/, '');
      
      const generated = `${name}_${role}_${currentYear}.pdf`;
      setFilename(generated);
    };

    if (isOpen) {
      generateFilename();
    }
  }, [resume, isOpen]);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Set document title for PDF metadata
      const originalTitle = document.title;
      document.title = filename.replace('.pdf', '');
      
      // Add ATS-safe class to body if enabled
      if (atsSafeMode) {
        document.body.classList.add('ats-safe-export');
      }
      
      // Trigger print dialog
      window.print();
      
      // Restore original state after a short delay
      setTimeout(() => {
        document.title = originalTitle;
        document.body.classList.remove('ats-safe-export');
        setIsExporting(false);
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="glass rounded-xl p-6 w-full max-w-md mx-auto shadow-glass-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Export Resume</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ATS Safe Mode Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">ATS-Safe Mode</div>
                <div className="text-xs text-gray-400">Optimized for applicant tracking systems</div>
              </div>
              <button
                onClick={() => setAtsSafeMode(!atsSafeMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  atsSafeMode ? '' : 'bg-gray-600'
                }`}
                style={atsSafeMode ? {
                  backgroundColor: 'var(--color-primary)'
                } : undefined}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    atsSafeMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {atsSafeMode && (
              <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-green-300">
                  ✓ Removes styling that may confuse ATS parsers
                  ✓ Ensures proper text extraction
                  ✓ Optimizes formatting for readability
                </p>
              </div>
            )}
          </div>

          {/* Filename Preview */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-white mb-2">Filename</div>
            <div className="p-3 rounded-lg bg-dark-surface border border-dark-border">
              <div className="text-sm text-white font-mono">{filename}</div>
              <div className="text-xs text-gray-400 mt-1">
                Format: Name_Role_Year.pdf
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="mb-6 space-y-4">
            <div className="text-sm font-semibold text-white mb-3">Export Options</div>
            
            {/* Page Size */}
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-gray-300">Page size</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPageSizeChange('A4')}
                  className={`px-3 py-1.5 rounded-lg border transition-all text-sm ${
                    pageSize === 'A4'
                      ? 'bg-white text-dark-bg border-white'
                      : 'bg-dark-surface border-dark-border text-gray-300 hover:border-gray-500'
                  }`}
                >
                  A4
                </button>
                <button
                  type="button"
                  onClick={() => onPageSizeChange('Letter')}
                  className={`px-3 py-1.5 rounded-lg border transition-all text-sm ${
                    pageSize === 'Letter'
                      ? 'bg-white text-dark-bg border-white'
                      : 'bg-dark-surface border-dark-border text-gray-300 hover:border-gray-500'
                  }`}
                >
                  Letter
                </button>
              </div>
            </div>

            {/* Margins */}
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-gray-300">Margins (mm)</div>
              <input
                type="number"
                min={0}
                max={50}
                step={1}
                value={marginMm}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n) && n >= 0 && n <= 50) onMarginChange(n);
                }}
                className="w-24 px-2 py-1.5 bg-dark-surface border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
              />
            </div>

            {/* Scale */}
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-gray-300">Scale (%)</div>
              <input
                type="number"
                min={50}
                max={150}
                step={5}
                value={scalePercent}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n) && n >= 50 && n <= 150) onScaleChange(n);
                }}
                className="w-24 px-2 py-1.5 bg-dark-surface border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                style={{ backgroundColor: '#111111', color: '#fafafa' }}
              />
            </div>
          </div>

          {/* Export Button */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-dark-surface border border-dark-border text-gray-300 rounded-lg font-medium hover:bg-dark-card transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ExportWizard;
