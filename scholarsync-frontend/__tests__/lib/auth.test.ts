// Authentication utility tests (frontend)

import { setAuthTokens, getAuthToken, clearAuthTokens, isAuthenticated } from '@/lib/auth';

describe('Frontend Auth Utils', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('setAuthTokens', () => {
    it('should store tokens in localStorage', () => {
      const token = 'test-token';
      const refreshToken = 'test-refresh-token';

      setAuthTokens(token, refreshToken);

      expect(localStorage.getItem('token')).toBe(token);
      expect(localStorage.getItem('refreshToken')).toBe(refreshToken);
    });
  });

  describe('getAuthToken', () => {
    it('should retrieve token from localStorage', () => {
      const token = 'test-token';
      localStorage.setItem('token', token);

      const retrieved = getAuthToken();

      expect(retrieved).toBe(token);
    });

    it('should return null when no token exists', () => {
      const retrieved = getAuthToken();

      expect(retrieved).toBeNull();
    });
  });

  describe('clearAuthTokens', () => {
    it('should remove all auth tokens', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh');

      clearAuthTokens();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', 'test-token');

      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(isAuthenticated()).toBe(false);
    });
  });
});
