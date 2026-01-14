import React from "react";

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col items-center justify-start pt-24 px-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Contact us</h1>
        <p className="text-sm text-gray-300 mb-3">
          This is a simple contact page placeholder. You can customize it with your own
          contact details or form.
        </p>
        <p className="text-sm text-gray-400 mb-1">Email: your-email@example.com</p>
        <p className="text-sm text-gray-400">LinkedIn / Portfolio: Add your links here.</p>
      </div>
    </div>
  );
};

export default ContactPage;
