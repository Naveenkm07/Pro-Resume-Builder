import React, { useState } from 'react';
import EmailSignUp from '../components/EmailSignUp';
import EmailSignIn from '../components/EmailSignIn';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUp 
              ? 'Sign up to start building your resume' 
              : 'Sign in to continue to your resume builder'}
          </p>
        </div>

        {/* Email/Password Auth */}
        <div className="mb-6">
          {isSignUp ? <EmailSignUp /> : <EmailSignIn />}
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
  );
};

export default AuthPage;

