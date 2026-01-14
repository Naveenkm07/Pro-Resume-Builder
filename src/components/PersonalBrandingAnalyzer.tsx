import React, { useState } from "react";
import { TargetRole, BrandAnalysisResult, ResumeData } from "../types";
import Card from "./ui/Card";
import Button from "./ui/Button";

type PersonalBrandingAnalyzerProps = {
  resume: ResumeData;
};

const PersonalBrandingAnalyzer: React.FC<PersonalBrandingAnalyzerProps> = ({ resume }) => {
  const [targetRole, setTargetRole] = useState<TargetRole>({
    title: "",
    jobDescription: "",
    jobKeywords: []
  });
  const [analysis, setAnalysis] = useState<BrandAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAnalyze = async () => {
    if (!targetRole.title.trim()) {
      setError("Please enter a target role title");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/brand-analyzer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetRole,
          resume: {
            summary: resume.summary,
            skills: resume.skills,
            projects: resume.projects
          }
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze brand alignment. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Personal Branding Analyzer
          </h3>
          <p className="text-sm text-gray-600">
            Check if your summary, skills, and projects align with your target role.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Role Title *
            </label>
            <input
              type="text"
              value={targetRole.title}
              onChange={(e) => setTargetRole(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Frontend Developer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description (optional)
                </label>
                <textarea
                  value={targetRole.jobDescription || ''}
                  onChange={(e) => setTargetRole(prev => ({ ...prev, jobDescription: e.target.value }))}
                  placeholder="Paste the full job description here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Keywords (optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={targetRole.jobKeywords?.join(', ') || ''}
                  onChange={(e) => setTargetRole(prev => ({ 
                    ...prev, 
                    jobKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                  }))}
                  placeholder="e.g. React, TypeScript, Node.js, AWS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={loading || !targetRole.title.trim()}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Analyze Brand Alignment'}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(analysis.score)}`}>
                <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </span>
              </div>
              <p className={`mt-2 text-lg font-medium ${getScoreColor(analysis.score)}`}>
                {analysis.label}
              </p>
              <p className="text-sm text-gray-600">
                for {targetRole.title}
              </p>
            </div>

            {/* Section Coverage */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Section Coverage</h4>
              <div className="space-y-2">
                {Object.entries(analysis.sectionCoverage).map(([section, coverage]) => (
                  <div key={section} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{section}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressBarColor(coverage)}`}
                          style={{ width: `${coverage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-10 text-right">{coverage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm text-gray-600">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Keywords */}
            {analysis.missingKeywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Missing Key Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Underemphasized in Summary */}
            {analysis.underEmphasizedInSummary.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Highlight in Summary</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.underEmphasizedInSummary.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PersonalBrandingAnalyzer;
