import React from "react";
import { Link } from "react-router-dom";

type StartupLandingPageProps = {
  onGetStarted: () => void;
};

const StartupLandingPage: React.FC<StartupLandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">Resume Builder</div>
            <Link
              to="/auth"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Resumes That Pass ATS
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            AI-optimized resumes that get past screening systems and into the hands of hiring managers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors text-center"
            >
              Get Started
            </Link>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Resumes Get Rejected</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                75% of resumes never reach a human. Applicant Tracking Systems (ATS) reject them for 
                formatting issues, missing keywords, or poor structure.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Your qualifications don't matter if your resume can't pass the initial screening.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Fix It</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                AI analyzes your resume and optimizes it for ATS compatibility. We ensure proper 
                formatting, keyword placement, and structure that screening systems expect.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Upload your resume, get AI-powered improvements, and download a perfect A4 PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <div className="aspect-[210/297] bg-gradient-to-br from-gray-50 to-gray-100 rounded border-2 border-gray-200 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-5/6 mx-auto"></div>
                  <div className="h-2 bg-gray-200 rounded w-4/6 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-6 text-sm">
            Live A4 PDF preview • Print-ready formatting • Perfect margins and spacing
          </p>
        </div>
      </section>

      {/* Feature List */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: "Upload Resume",
              description: "Upload your existing resume in PDF or DOCX. We extract and parse everything automatically.",
            },
            {
              title: "AI Rewrite",
              description: "Get AI-powered suggestions to improve your bullet points, optimize keywords, and enhance impact.",
            },
            {
              title: "ATS Score",
              description: "See how ATS-friendly your resume is with real-time scoring and improvement suggestions.",
            },
            {
              title: "Download A4 PDF",
              description: "Export a perfectly formatted A4 PDF ready for printing or digital submission.",
            },
          ].map((feature, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
                {idx + 1}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Your resume decides your interview
          </h2>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Fix My Resume
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              &copy; 2024 Resume Builder. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StartupLandingPage;

