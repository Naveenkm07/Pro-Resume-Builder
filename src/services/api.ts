import axios from 'axios';
import { ResumeData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

// Helper to get headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const ApiService = {
    // Save or Update resume
    saveResume: async (resumeData: ResumeData) => {
        try {
            const response = await axios.post(`${API_URL}/api/resume`, resumeData, {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            console.error('Error saving resume:', error);
            throw error;
        }
    },

    // Get most recent resume
    getResume: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/resume`, {
                headers: getAuthHeaders(),
            });
            // Assuming backend returns array, pick first (latest)
            if (Array.isArray(response.data) && response.data.length > 0) {
                return response.data[0];
            }
            return null;
        } catch (error) {
            console.error('Error fetching name:', error);
            // Return null if not found or error, to allow App to use default/sample
            return null;
        }
    },
};
