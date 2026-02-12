import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

interface User {
  id: string;
  email: string;
  profileCompleted?: boolean;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'checkAuth' });

      if (response.success && response.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(response.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await chrome.runtime.sendMessage({ action: 'logout' });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <h1>ScholarSync</h1>
          <p>AI-Powered Scholarship Assistant</p>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ marginTop: '12px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1>ScholarSync</h1>
        <p>AI-Powered Scholarship Assistant</p>
      </div>
      <div className="popup-content">
        {isAuthenticated ? (
          <Dashboard user={user} onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </div>
  );
};

export default App;
