import React from "react";
import { Link } from "react-router-dom";

const About: React.FC = () => {
  const githubUrl = "https://github.com/Naveenkm07";
  const linkedinUrl = "https://www.linkedin.com/in/naveenkm07";
  const instagramUrl = "https://www.instagram.com/naveen.techie";

  return (
    <section className="max-w-4xl mx-auto px-6 py-12 bg-dark-bg">
      <div className="prose prose-slate max-w-none">
        <h2 className="text-3xl font-bold gradient-text mb-8">About Resume Builder Pro</h2>
        
        <div className="space-y-8 text-gray-300">
          <div className="glass rounded-xl p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Why We Built This</h3>
            <p className="text-gray-300 leading-relaxed">
              Resume Builder Pro was created to solve a real problem that students and job seekers face every day: 
              creating resumes that both look professional and pass through Applicant Tracking Systems (ATS). 
              Many talented candidates miss opportunities because their resumes aren't formatted correctly or 
              optimized for the modern hiring process.
            </p>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">What Makes This Different</h3>
            <p className="text-gray-300 mb-4">
              This application combines three essential features that job seekers need:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-gray-300">
              <li>
                <strong className="text-white">ATS-Friendly Formatting:</strong> Resumes are structured to pass through 
                automated screening systems used by most companies today.
              </li>
              <li>
                <strong className="text-white">AI-Powered Optimization:</strong> Our AI helps enhance your resume content 
                with better action verbs, quantifiable achievements, and job-specific tailoring.
              </li>
              <li>
                <strong className="text-white">Perfect A4 Export:</strong> Every resume exports as a properly formatted A4 PDF, 
                ensuring it prints correctly and looks professional when shared.
              </li>
            </ul>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">How It Works</h3>
            <p className="text-gray-300 leading-relaxed">
              Simply upload your existing resume (PDF or DOCX), and our system extracts and parses your 
              information. You can then edit, optimize, and customize your resume using our templates. 
              The AI optimization feature helps strengthen your experience descriptions and tailor your 
              resume to specific job descriptions. Finally, export your polished resume as a perfect A4 PDF 
              ready for applications.
            </p>
          </div>

          <div className="glass rounded-xl p-6 border-l-4 border-accent-purple bg-gradient-to-r from-accent-purple/10 to-transparent">
            <p className="text-white italic text-lg mb-0">
              Your resume is often your first impression. Make it count by building one that stands out 
              to both humans and hiring systems.
            </p>
          </div>

          <div className="glass rounded-xl p-6 border-t border-dark-border">
            <h3 className="text-2xl font-semibold text-white mb-4">About the Creator</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Resume Builder Pro was built by <strong className="text-white">Naveen</strong>, a software engineer passionate 
              about helping students and professionals advance their careers through better tools and 
              resources.
            </p>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Naveen creates content focused on resume building, coding, and career development. 
              You can connect and learn more through:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 not-prose">
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-dark-border bg-dark-surface hover:bg-dark-card transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-dark-border bg-dark-bg">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 .5C5.73.5.75 5.6.75 12c0 5.1 3.2 9.42 7.65 10.95.56.1.77-.25.77-.55v-2.1c-3.12.7-3.78-1.55-3.78-1.55-.5-1.33-1.22-1.68-1.22-1.68-.99-.7.07-.69.07-.69 1.1.08 1.67 1.17 1.67 1.17.98 1.73 2.57 1.23 3.2.94.1-.73.38-1.23.69-1.52-2.49-.29-5.1-1.28-5.1-5.7 0-1.26.43-2.3 1.13-3.1-.11-.29-.49-1.48.11-3.08 0 0 .93-.3 3.05 1.18a10.3 10.3 0 0 1 2.78-.39c.94 0 1.89.14 2.78.39 2.12-1.48 3.05-1.18 3.05-1.18.6 1.6.22 2.79.11 3.08.7.8 1.13 1.84 1.13 3.1 0 4.43-2.61 5.41-5.11 5.7.39.35.73 1.05.73 2.12v3.14c0 .31.2.66.78.55 4.45-1.53 7.64-5.85 7.64-10.95C23.25 5.6 18.27.5 12 .5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">GitHub</div>
                    <div className="text-xs text-gray-400">@Naveenkm07</div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-dark-border bg-dark-surface hover:bg-dark-card transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-dark-border bg-dark-bg">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.05c.53-1.02 1.82-2.1 3.75-2.1 4.02 0 4.76 2.65 4.76 6.1V23h-4v-6.98c0-1.67-.03-3.82-2.33-3.82-2.33 0-2.69 1.82-2.69 3.7V23h-4V8.5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">LinkedIn</div>
                    <div className="text-xs text-gray-400">Connect professionally</div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-dark-border bg-dark-surface hover:bg-dark-card transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-dark-border bg-dark-bg">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.5-.9a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Instagram</div>
                    <div className="text-xs text-gray-400">@naveen.techie</div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-dark-border flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="text-xs text-gray-500">
             a9 {new Date().getFullYear()} Pro Resume Builder. All rights reserved.
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-xs">
            <Link to="/terms" className="font-semibold text-gray-200 hover:underline">
              Terms
            </Link>
            <span className="text-gray-500">|</span>
            <Link to="/privacy" className="font-semibold text-gray-200 hover:underline">
              Privacy policy
            </Link>
            <span className="text-gray-500">|</span>
            <Link to="/contact" className="font-semibold text-gray-200 hover:underline">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
