import React from "react";

const About: React.FC = () => {
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
            <ul className="list-disc pl-6 space-y-3 text-gray-300">
              <li>
                <strong className="text-white">Instagram:</strong> Follow <strong className="text-accent-purple">naveen.techie</strong> for quick tips, 
                career advice, and behind-the-scenes content.
              </li>
              <li>
                <strong className="text-white">LinkedIn:</strong> Connect with <strong className="text-accent-blue">Naveen</strong> for professional 
                networking, industry insights, and career discussions.
              </li>
              <li>
                <strong className="text-white">YouTube:</strong> Subscribe to Naveen's tech-focused channel for in-depth 
                tutorials on resume building, coding tutorials, and career guidance.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
