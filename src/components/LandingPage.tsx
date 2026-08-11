import React from "react";
import { useTheme } from "../contexts/ThemeContext";

type LandingPageProps = {
  onGetStarted: () => void;
  onUploadResume: () => void;
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onUploadResume }) => {
  const { colorTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Resume Builder Pro
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded">
              AI POWERED
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onUploadResume}
              className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`
              }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Build ATS-Friendly Resumes with{" "}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Power
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Create professional resumes that pass ATS screening, get optimized by AI, 
                and export as perfect A4 PDFs—all in minutes.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`
                }}
              >
                Build My Resume
              </button>
              <button
                onClick={onUploadResume}
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:border-gray-400 transition-all duration-200"
              >
                Upload Existing Resume
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free to start</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-lg shadow-lg p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-3">
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 w-32">
              <div className="text-xs text-gray-500 mb-1">A4 Format</div>
              <div className="text-sm font-semibold text-gray-900">Print Ready</div>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Get your perfect resume in three simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Upload Your Resume",
              description: "Upload your existing resume in PDF or DOCX format. Our AI will extract and parse all your information automatically.",
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              ),
            },
            {
              step: "2",
              title: "AI Optimizes Content",
              description: "Our AI analyzes your resume and suggests improvements for better ATS compatibility and stronger impact.",
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
            },
            {
              step: "3",
              title: "Download A4 PDF",
              description: "Export your polished resume as a perfect A4 PDF, ready to print or share with employers.",
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
          ].map((item, idx) => (
            <div key={idx} className="text-center p-8 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-6" style={{
                background: `linear-gradient(135deg, var(--color-primary)20 0%, var(--color-secondary)20 100%)`
              }}>
                {item.icon}
              </div>
              <div className="text-sm font-semibold text-purple-600 mb-2" style={{ color: 'var(--color-primary)' }}>
                STEP {item.step}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Powerful features to create the perfect resume</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "ATS-Friendly Resumes",
                description: "Structured to pass through Applicant Tracking Systems used by 98% of companies.",
              },
              {
                title: "AI-Written Bullet Points",
                description: "Get optimized, impactful bullet points that highlight your achievements effectively.",
              },
              {
                title: "Professional Templates",
                description: "Choose from modern, clean templates designed by professional resume writers.",
              },
              {
                title: "A4 Print-Ready PDFs",
                description: "Perfect formatting for printing and sharing. No formatting issues, guaranteed.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 mb-4 flex items-center justify-center" style={{
                  background: `linear-gradient(135deg, var(--color-primary)20 0%, var(--color-secondary)20 100%)`
                }}>
                  <svg className="w-6 h-6" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Template</h2>
          <p className="text-xl text-gray-600">Professional designs that make you stand out</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {["Simple", "Professional", "Creative"].map((template, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-[210/297] bg-gradient-to-br from-gray-50 to-gray-100 p-6 relative">
                <div className="bg-white rounded shadow-sm h-full p-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4 mt-4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                  A4 Format
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{template}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {template === "Simple" && "Clean and minimalist design perfect for any industry"}
                  {template === "Professional" && "Traditional layout with modern touches"}
                  {template === "Creative" && "Bold design for creative professionals"}
                </p>
                <button
                  onClick={onGetStarted}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`
                  }}
                >
                  Use This Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20" style={{
        background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`
      }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Build Your Perfect Resume?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of professionals who have landed their dream jobs with our AI-powered resume builder.
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-5 bg-white text-purple-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            style={{
              color: 'var(--color-primary)'
            }}
          >
            Create My Resume Now
          </button>
          <p className="text-white/80 text-sm mt-4">No credit card required • Free to start</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Resume Builder Pro</h3>
              <p className="text-sm">AI-powered resume builder for modern job seekers.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Resume Builder Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

