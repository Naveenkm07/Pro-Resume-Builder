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
  private getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
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

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await axios.post<{ message: string }>(
        `${API_URL}/api/auth/change-password`,
        { currentPassword, newPassword },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      throw new Error(errorMessage);
    }
  }

  async deleteAccount(password?: string): Promise<{ message: string }> {
    try {
      const response = await axios.delete<{ message: string }>(
        `${API_URL}/api/auth/me`,
        {
          headers: this.getAuthHeaders(),
          data: password ? { password } : {},
        }
      );
      this.logout();
      window.dispatchEvent(new Event('authUpdate'));
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete account';
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
