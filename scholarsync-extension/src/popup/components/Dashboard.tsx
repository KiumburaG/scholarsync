import React, { useState, useEffect } from 'react';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

interface Profile {
  firstName?: string;
  lastName?: string;
  profileStrengthScore?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPageStatus, setCurrentPageStatus] = useState<string>('');

  useEffect(() => {
    loadProfile();
    checkCurrentPage();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getProfile' });

      if (response.success) {
        setProfile(response.profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentPage = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'detectForm' });

        if (response?.success && response.form?.fields?.length > 0) {
          setCurrentPageStatus(`Detected ${response.form.fields.length} fillable fields`);
        } else {
          setCurrentPageStatus('No scholarship form detected on this page');
        }
      }
    } catch (error) {
      setCurrentPageStatus('Navigate to a scholarship page to use autofill');
    }
  };

  const handleAutofill = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { action: 'autofillForm' });
      }
    } catch (error) {
      console.error('Autofill failed:', error);
      alert('Failed to autofill. Make sure you\'re on a scholarship page.');
    }
  };

  const handleDetectEssays = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'detectEssays' });

        if (response?.success && response.essays?.length > 0) {
          alert(`Found ${response.essays.length} essay field(s):\n\n${response.essays.map((e: any) => e.prompt).join('\n\n')}`);
        } else {
          alert('No essay fields detected on this page.');
        }
      }
    } catch (error) {
      console.error('Essay detection failed:', error);
      alert('Failed to detect essays. Make sure you\'re on a scholarship page.');
    }
  };

  const openDashboard = () => {
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  };

  const openEssayGenerator = () => {
    chrome.tabs.create({ url: 'http://localhost:3000/essay-generator' });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ marginTop: '12px' }}>Loading profile...</p>
      </div>
    );
  }

  const profileStrength = profile?.profileStrengthScore || 0;
  const userName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : user?.email || 'User';

  return (
    <div className="dashboard">
      <div className="user-info">
        <div className="user-details">
          <h3>{userName}</h3>
          <p>{user?.email}</p>
        </div>
        <button className="btn btn-secondary" onClick={onLogout} style={{ fontSize: '12px', padding: '6px 12px' }}>
          Logout
        </button>
      </div>

      {profile && (
        <div className="profile-strength">
          <h4>Profile Strength</h4>
          <div className="strength-bar">
            <div className="strength-fill" style={{ width: `${profileStrength}%` }}></div>
          </div>
          <p className="strength-text">{profileStrength}% complete</p>
        </div>
      )}

      {currentPageStatus && (
        <div className="status">
          {currentPageStatus}
        </div>
      )}

      <div className="actions">
        <button className="action-btn" onClick={handleAutofill}>
          <span className="icon">⚡</span>
          <div className="text">
            <h5>Auto-Fill Form</h5>
            <p>Fill detected fields with your profile</p>
          </div>
        </button>

        <button className="action-btn" onClick={handleDetectEssays}>
          <span className="icon">📝</span>
          <div className="text">
            <h5>Detect Essays</h5>
            <p>Find essay prompts on this page</p>
          </div>
        </button>

        <button className="action-btn" onClick={openEssayGenerator}>
          <span className="icon">🤖</span>
          <div className="text">
            <h5>Generate Essay</h5>
            <p>Create AI-powered essay responses</p>
          </div>
        </button>

        <button className="action-btn" onClick={openDashboard}>
          <span className="icon">🏠</span>
          <div className="text">
            <h5>Open Dashboard</h5>
            <p>Manage profile and applications</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
