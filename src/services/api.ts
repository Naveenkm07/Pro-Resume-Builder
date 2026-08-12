import axios from 'axios';
import { ResumeData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Add Clerk to window
declare global {
    interface Window {
        Clerk?: any;
    }
}

// Helper to get headers
const getAuthHeaders = async () => {
    let token = null;
    if (window.Clerk && window.Clerk.session) {
        token = await window.Clerk.session.getToken();
    } else {
        token = localStorage.getItem('authToken');
    }
    
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const ApiService = {
    saveResume: async (resumeData: ResumeData) => {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.post(`${API_URL}/api/resume`, resumeData, {
                headers,
            });
            return response.data;
        } catch (error) {
            console.error('Error saving resume:', error);
            throw error;
        }
    },

    getResume: async (versionName?: string) => {
        try {
            const url = versionName
                ? `${API_URL}/api/resume?versionName=${encodeURIComponent(versionName)}`
                : `${API_URL}/api/resume`;
            const headers = await getAuthHeaders();
            const response = await axios.get(url, {
                headers,
            });
            if (Array.isArray(response.data) && response.data.length > 0) {
                return response.data[0];
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching resume:', error);
            return null;
        }
    },

    getResumes: async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.get(`${API_URL}/api/resume`, {
                headers,
            });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error fetching resumes:', error);
            return [];
        }
    },

    deleteResumeVersion: async (versionName: string) => {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.delete(`${API_URL}/api/resume`, {
                params: { versionName },
                headers,
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting resume:', error);
            throw error;
        }
    },
};
