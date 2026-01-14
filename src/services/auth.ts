import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

/**
 * Authentication Service
 * Handles Google OAuth and JWT token management
 */
class AuthService {
  /**
   * Initiate Google OAuth login
   * Redirects user to Google OAuth consent screen
   */
  initiateGoogleLogin(): void {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'openid email profile';
    const responseType = 'code';

    // Build Google OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${responseType}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    // Redirect to Google OAuth
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback
   * Exchange authorization code for ID token
   */
  async handleCallback(code: string): Promise<AuthResponse> {
    try {
      // Exchange code for ID token via backend
      const response = await axios.post<AuthResponse>(
        `${API_URL}/api/auth/google/callback`,
        { code },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Store token in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Dispatch event to update auth context
      window.dispatchEvent(new Event('authUpdate'));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Authentication failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current user from token
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await axios.get<{ user: User }>(
        `${API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update stored user info
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      // Token invalid, clear storage
      this.logout();
      return null;
    }
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Get stored user
   */
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Register new user with email and password
   */
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/api/auth/register`,
        { email, password, name },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Store token in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Dispatch event to update auth context
      window.dispatchEvent(new Event('authUpdate'));

      return response.data;
    } catch (error: any) {
      // Check if it's a network error (backend not running)
      if (!error.response) {
        throw new Error('Cannot connect to server. Please make sure the backend is running.');
      }
      
      const errorMessage = error.response?.data?.error || 'Registration failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/api/auth/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Store token in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Dispatch event to update auth context
      window.dispatchEvent(new Event('authUpdate'));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

export default new AuthService();
