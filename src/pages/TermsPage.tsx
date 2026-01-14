import React from "react";

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col items-center justify-start pt-24 px-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Terms &amp; Conditions</h1>
        <p className="text-sm text-gray-300 mb-3">
          These are placeholder terms for Pro Resume Builder. Update this content with your
          actual legal terms when you have them.
        </p>
        <p className="text-sm text-gray-400">
          By using this application, you agree that this is a personal project / portfolio
          tool and that no guarantees are provided regarding job outcomes. Do not paste
          confidential or highly sensitive information here.
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
