import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmailSignIn from './EmailSignIn';
import EmailSignUp from './EmailSignUp';

const ConversionLandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Resume Builder Pro</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setShowAuthModal(true);
                }}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setShowAuthModal(true);
                }}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Build Resumes That Get You Hired
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
                AI-powered resume optimization, ATS-friendly formatting, and perfect A4 PDF exports. 
                Create professional resumes that pass screening systems and impress hiring managers.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setShowAuthModal(true);
                }}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Build My Resume
              </button>
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setShowAuthModal(true);
                }}
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Upload Existing Resume
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500 pt-4">
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
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-lg shadow-xl p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-100 rounded w-2/3 mt-6"></div>
                  <div className="h-2 bg-gray-100 rounded w-full"></div>
                  <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-gray-100 rounded"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 w-36 border-2 border-blue-100">
              <div className="text-xs text-gray-500 mb-1 font-medium">A4 Format</div>
              <div className="text-sm font-bold text-gray-900">Print Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-gray-600 font-medium text-lg mb-8">
              Trusted by students & professionals worldwide
            </p>
            
            <div className="flex items-center justify-center gap-8 mb-10 flex-wrap opacity-60">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500 font-medium">Company {i}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-800 font-bold text-lg ml-2">4.8</span>
              <span className="text-gray-500 text-sm ml-1">from 2,500+ reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get your perfect resume in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Upload Your Resume",
              description: "Upload your existing resume in PDF or DOCX format. Our system automatically extracts and parses all your information.",
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              ),
            },
            {
              step: "2",
              title: "AI Improves Content",
              description: "Our AI analyzes your resume and suggests improvements for better ATS compatibility, stronger impact, and optimized keywords.",
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
            },
            {
              step: "3",
              title: "Download A4 PDF",
              description: "Export your polished resume as a perfect A4 PDF with proper formatting, margins, and spacing. Ready to print or share digitally.",
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
          ].map((item, idx) => (
            <div key={idx} className="text-center p-8 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-6">
                <div className="text-blue-600">
                  {item.icon}
                </div>
              </div>
              <div className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">
                Step {item.step}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features to create the perfect resume
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "ATS-Friendly Resumes",
                description: "Structured to pass through Applicant Tracking Systems used by 98% of Fortune 500 companies. Proper formatting ensures your resume reaches hiring managers.",
              },
              {
                title: "AI-Written Bullet Points",
                description: "Get optimized, impactful bullet points that highlight your achievements effectively. AI suggests improvements for better impact and keyword optimization.",
              },
              {
                title: "Professional Templates",
                description: "Choose from modern, clean templates designed by professional resume writers. Each template is optimized for both ATS and human reviewers.",
              },
              {
                title: "A4 Print-Ready PDFs",
                description: "Perfect formatting for printing and sharing. No formatting issues, guaranteed. Every resume exports as a properly formatted A4 PDF.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Template
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional designs that make you stand out
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Simple",
              description: "Clean and minimalist design perfect for any industry",
              color: "from-blue-500 to-blue-600",
            },
            {
              name: "Professional",
              description: "Traditional layout with modern touches for corporate roles",
              color: "from-indigo-500 to-indigo-600",
            },
            {
              name: "Creative",
              description: "Bold design for creative professionals and designers",
              color: "from-purple-500 to-purple-600",
            },
          ].map((template, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-[210/297] bg-gradient-to-br from-gray-50 to-gray-100 p-6 relative">
                <div className="bg-white rounded shadow-sm h-full p-4">
                  <div className="space-y-2">
                    <div className={`h-3 bg-gradient-to-r ${template.color} rounded w-2/3`}></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4 mt-4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-gray-200">
                  A4 Format
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {template.description}
                </p>
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setShowAuthModal(true);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Use This Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Build Your Perfect Resume?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who have landed their dream jobs with our AI-powered resume builder.
          </p>
          <button
            onClick={() => {
              setIsSignUp(true);
              setShowAuthModal(true);
            }}
            className="px-10 py-5 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            Create My Resume Now
          </button>
          <p className="text-blue-100 text-sm mt-6">No credit card required • Free to start</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RB</span>
                </div>
                <span className="text-white font-semibold">Resume Builder Pro</span>
              </div>
              <p className="text-sm leading-relaxed">
                AI-powered resume builder for modern job seekers.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Resume Builder Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAuthModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </h2>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Email/Password Auth */}
              <div className="mb-6">
                {isSignUp ? (
                  <EmailSignUp onSuccess={() => setShowAuthModal(false)} />
                ) : (
                  <EmailSignIn onSuccess={() => setShowAuthModal(false)} />
                )}
              </div>

              {/* Toggle Sign Up/Sign In */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversionLandingPage;

