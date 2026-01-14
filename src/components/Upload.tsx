import React, { useState } from "react";
import type { ResumeData } from "../types";

type UploadProps = {
  onParsed: (data: ResumeData) => void;
};

type UploadedFileInfo = {
  name: string;
  size: number;
};

const MOCK_DELAY_MS = 600;

const Upload: React.FC<UploadProps> = ({ onParsed }) => {
  const [fileInfo, setFileInfo] = useState<UploadedFileInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setFileInfo({ name: file.name, size: file.size });

    const formData = new FormData();
    formData.append("resume", file);

    // Try to POST to /api/upload as required; fall back to mocked JSON.
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          // No Content-Type header needed for FormData
        }
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onParsed(data);
    } catch (err) {
      setError("Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-white">
        Upload resume (PDF or DOCX)
      </label>
      <div className="relative">
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
          onChange={handleChange}
          className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-accent-purple file:to-accent-blue file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:from-accent-purple-light hover:file:to-accent-blue-light file:transition-all file:cursor-pointer"
        />
      </div>
      {fileInfo && (
        <div className="p-3 bg-dark-surface rounded-lg border border-dark-border">
          <p className="text-xs text-gray-300">
            Selected: <span className="font-medium text-white">{fileInfo.name}</span> (
            {(fileInfo.size / 1024).toFixed(1)} KB)
          </p>
        </div>
      )}
      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-accent-purple">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Parsing resume...</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Upload;


