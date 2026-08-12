import React from 'react';
import { Link } from 'react-router-dom';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';

const ConversionLandingPage: React.FC = () => {

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
              <SignInButton mode="modal">
                <button className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
                  Get Started
                </button>
              </SignUpButton>
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
              <SignUpButton mode="modal">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Build My Resume
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                  Upload Existing Resume
                </button>
              </SignInButton>
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

          <div className="relative mt-12 lg:mt-0" style={{ perspective: '1000px' }}>
            {/* Background glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 rounded-full blur-[100px] animate-glow-pulse pointer-events-none"></div>

            {/* Main 2D Illustration */}
            <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transform hover:scale-[1.02] transition-transform duration-500 bg-white">
              <img src="/hero_resume_2d.png" alt="Professional Resume Preview" className="w-full h-auto object-cover" />
            </div>

            {/* Floating Badges */}
            <div className="absolute -top-6 -left-8 bg-white/90 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-4 flex items-center gap-3 animate-float-delayed z-10">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">ATS Score</div>
                <div className="text-lg font-bold text-gray-900">98/100</div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 bg-white/90 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-4 flex items-center gap-3 animate-float z-10">
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">AI Optimized</div>
                <div className="text-sm font-bold text-gray-900">Perfect Match</div>
              </div>
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
      <section className="relative max-w-7xl mx-auto px-6 py-32">
        {/* Ambient background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -z-10 opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
        
        <div className="text-center mb-20 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-6">
            Choose Your Template
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Professional designs crafted to make you stand out from the crowd
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 relative z-10">
          {[
            {
              name: "Simple",
              description: "Clean and minimalist design perfect for any industry",
              color: "from-blue-500 to-cyan-400",
              shadow: "group-hover:shadow-cyan-500/25",
              border: "group-hover:border-cyan-200",
              image: "/simple_resume_3d.png"
            },
            {
              name: "Professional",
              description: "Traditional layout with modern touches for corporate roles",
              color: "from-indigo-600 to-blue-500",
              shadow: "group-hover:shadow-indigo-500/25",
              border: "group-hover:border-indigo-200",
              image: "/professional_resume_3d.png"
            },
            {
              name: "Creative",
              description: "Bold design for creative professionals and designers",
              color: "from-purple-600 to-pink-500",
              shadow: "group-hover:shadow-purple-500/25",
              border: "group-hover:border-purple-200",
              image: "/creative_resume_3d.png"
            },
          ].map((template, idx) => (
            <div
              key={idx}
              className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl ${template.shadow} ${template.border} flex flex-col`}
            >
              <div className="aspect-[210/297] bg-gray-50/50 p-6 relative overflow-hidden flex-shrink-0">
                {/* Decorative gradient blob inside template container */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${template.color} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                
                <div className="h-full relative z-10 flex flex-col transform transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                  <img 
                    src={template.image} 
                    alt={`${template.name} Template 3D`} 
                    className="w-full h-full object-cover rounded-xl shadow-lg border border-white/20"
                  />
                </div>
                
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-600 tracking-wider uppercase shadow-sm border border-white z-20">
                  A4 Format
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-grow bg-white relative z-20">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-colors duration-300">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
                  {template.description}
                </p>
                <SignUpButton mode="modal">
                  <button className={`w-full px-5 py-3.5 bg-gradient-to-r ${template.color} text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02] active:scale-95`}>
                    Use {template.name}
                  </button>
                </SignUpButton>
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
          <SignUpButton mode="modal">
            <button className="px-10 py-5 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105">
              Create My Resume Now
            </button>
          </SignUpButton>
          <p className="text-blue-100 text-sm mt-6">No credit card required • Free to start</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1120] text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-sm">RB</span>
                </div>
                <span className="text-white font-semibold text-lg tracking-tight">Resume Builder Pro</span>
              </div>
              <p className="text-sm leading-relaxed mb-6 text-gray-400 max-w-xs">
                Build a professional, ATS-friendly resume in minutes. Stand out from the crowd and land your dream job faster.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-4">
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-xs">Product</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/auth" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Features</Link></li>
                <li><Link to="/auth" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-xs">Resources</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/auth" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Resume Examples</Link></li>
                <li><Link to="/auth" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Career Advice</Link></li>
                <li><Link to="/auth" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">How to Write a Resume</Link></li>
                <li><Link to="/auth" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Interview Tips</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-xs">Legal & Support</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/auth" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Privacy Policy</Link></li>
                <li><Link to="/auth" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Terms of Service</Link></li>
                <li><Link to="/auth" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Cookie Policy</Link></li>
                <li><Link to="/auth" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800/80 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Resume Builder Pro. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-gray-300 cursor-pointer transition-colors">English (US)</span>
              <span className="hover:text-gray-300 cursor-pointer transition-colors">USD ($)</span>
            </div>
          </div>
        </div>
      </footer>


    </div>
  );
};

export default ConversionLandingPage;


