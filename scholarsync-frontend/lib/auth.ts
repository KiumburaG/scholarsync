// Auth utility functions

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  profileCompleted: boolean;
}

// Store tokens in localStorage
export function setAuthTokens(tokens: AuthTokens) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', tokens.token);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }
}

// Get token from localStorage
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Clear tokens (logout)
export function clearAuthTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Decode JWT to get user info (basic implementation)
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}
