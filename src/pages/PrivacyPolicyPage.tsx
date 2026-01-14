import React from "react";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col items-center justify-start pt-24 px-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-300 mb-3">
          This is a placeholder privacy policy for Pro Resume Builder. Replace this with your
          real policy when you are ready.
        </p>
        <p className="text-sm text-gray-400 mb-2">
          Your resume data is used inside this app to help you edit and optimize your resume.
          You are responsible for what you upload. Avoid sharing highly sensitive personal
          information.
        </p>
        <p className="text-sm text-gray-400">
          If you deploy this application publicly, make sure to update this page with accurate
          information about how you store, process, and delete user data.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
