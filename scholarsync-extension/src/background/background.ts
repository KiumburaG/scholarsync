// Background service worker

import { apiClient } from '../lib/api';

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getProfile') {
    handleGetProfile(sendResponse);
    return true; // Keep channel open for async response
  } else if (message.action === 'login') {
    handleLogin(message.email, message.password, sendResponse);
    return true;
  } else if (message.action === 'logout') {
    handleLogout(sendResponse);
    return true;
  } else if (message.action === 'checkAuth') {
    handleCheckAuth(sendResponse);
    return true;
  } else if (message.action === 'generateEssay') {
    handleGenerateEssay(message.input, sendResponse);
    return true;
  }
});

// Get user profile
async function handleGetProfile(sendResponse: (response: any) => void) {
  try {
    const isAuth = await apiClient.isAuthenticated();
    if (!isAuth) {
      sendResponse({ success: false, error: 'Not authenticated' });
      return;
    }

    const profile = await apiClient.getProfile();
    sendResponse({ success: true, profile });
  } catch (error: any) {
    sendResponse({ success: false, error: error.message });
  }
}

// Handle login
async function handleLogin(email: string, password: string, sendResponse: (response: any) => void) {
  try {
    const result = await apiClient.login(email, password);
    sendResponse({ success: true, user: result.user });
  } catch (error: any) {
    sendResponse({ success: false, error: error.message });
  }
}

// Handle logout
async function handleLogout(sendResponse: (response: any) => void) {
  try {
    await apiClient.clearToken();
    sendResponse({ success: true });
  } catch (error: any) {
    sendResponse({ success: false, error: error.message });
  }
}

// Check auth status
async function handleCheckAuth(sendResponse: (response: any) => void) {
  try {
    const isAuth = await apiClient.isAuthenticated();

    if (isAuth) {
      const user = await chrome.storage.local.get(['user']);
      sendResponse({ success: true, isAuthenticated: true, user: user.user });
    } else {
      sendResponse({ success: true, isAuthenticated: false });
    }
  } catch (error: any) {
    sendResponse({ success: false, error: error.message });
  }
}

// Generate essay
async function handleGenerateEssay(input: any, sendResponse: (response: any) => void) {
  try {
    const result = await apiClient.generateEssay(input);
    sendResponse({ success: true, essay: result });
  } catch (error: any) {
    sendResponse({ success: false, error: error.message });
  }
}

// Show notification on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('ScholarSync extension installed!');
});
