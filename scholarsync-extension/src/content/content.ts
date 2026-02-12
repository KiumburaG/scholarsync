// Content script - runs on scholarship pages

import { formDetector } from '../lib/formDetector';

// Inject styles
const injectStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .scholarsync-highlight {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px;
      animation: scholarsync-pulse 2s infinite;
    }

    @keyframes scholarsync-pulse {
      0%, 100% { outline-color: #3b82f6; }
      50% { outline-color: #60a5fa; }
    }

    .scholarsync-banner {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 320px;
      animation: scholarsync-slidein 0.3s ease-out;
    }

    @keyframes scholarsync-slidein {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .scholarsync-banner-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 14px;
    }

    .scholarsync-banner-text {
      font-size: 13px;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .scholarsync-banner-buttons {
      display: flex;
      gap: 8px;
    }

    .scholarsync-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .scholarsync-btn-primary {
      background: white;
      color: #667eea;
    }

    .scholarsync-btn-primary:hover {
      background: #f3f4f6;
    }

    .scholarsync-btn-secondary {
      background: rgba(255,255,255,0.2);
      color: white;
    }

    .scholarsync-btn-secondary:hover {
      background: rgba(255,255,255,0.3);
    }

    .scholarsync-close {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    }

    .scholarsync-close:hover {
      background: rgba(255,255,255,0.3);
    }
  `;
  document.head.appendChild(style);
};

// Show banner notification
const showBanner = (fieldsCount: number) => {
  // Remove existing banner
  const existing = document.querySelector('.scholarsync-banner');
  if (existing) existing.remove();

  const banner = document.createElement('div');
  banner.className = 'scholarsync-banner';
  banner.innerHTML = `
    <button class="scholarsync-close" id="scholarsync-close">×</button>
    <div class="scholarsync-banner-header">
      ⚡ ScholarSync Detected
    </div>
    <div class="scholarsync-banner-text">
      Found ${fieldsCount} fields that can be auto-filled
    </div>
    <div class="scholarsync-banner-buttons">
      <button class="scholarsync-btn scholarsync-btn-primary" id="scholarsync-autofill">
        Auto-Fill Form
      </button>
      <button class="scholarsync-btn scholarsync-btn-secondary" id="scholarsync-dismiss">
        Dismiss
      </button>
    </div>
  `;

  document.body.appendChild(banner);

  // Event listeners
  document.getElementById('scholarsync-close')?.addEventListener('click', () => {
    banner.remove();
  });

  document.getElementById('scholarsync-dismiss')?.addEventListener('click', () => {
    banner.remove();
  });

  document.getElementById('scholarsync-autofill')?.addEventListener('click', async () => {
    banner.remove();
    await autofillForm();
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(banner)) {
      banner.remove();
    }
  }, 10000);
};

// Autofill form with profile data
const autofillForm = async () => {
  try {
    // Get profile data from background script
    const response = await chrome.runtime.sendMessage({ action: 'getProfile' });

    if (!response.success) {
      alert('Please log in to ScholarSync to use autofill');
      return;
    }

    const profile = response.profile;
    const form = formDetector.detectFields();

    let filledCount = 0;

    form.fields.forEach(field => {
      const value = getProfileValue(profile, field.type);
      if (value && field.element) {
        field.element.value = value;
        field.element.dispatchEvent(new Event('input', { bubbles: true }));
        field.element.dispatchEvent(new Event('change', { bubbles: true }));

        // Highlight filled field
        field.element.classList.add('scholarsync-highlight');
        setTimeout(() => {
          field.element.classList.remove('scholarsync-highlight');
        }, 2000);

        filledCount++;
      }
    });

    // Show success message
    const successBanner = document.createElement('div');
    successBanner.className = 'scholarsync-banner';
    successBanner.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    successBanner.innerHTML = `
      <button class="scholarsync-close" onclick="this.parentElement.remove()">×</button>
      <div class="scholarsync-banner-header">
        ✓ Auto-fill Complete
      </div>
      <div class="scholarsync-banner-text">
        Filled ${filledCount} fields. Please review and submit.
      </div>
    `;
    document.body.appendChild(successBanner);

    setTimeout(() => {
      if (document.body.contains(successBanner)) {
        successBanner.remove();
      }
    }, 5000);
  } catch (error) {
    console.error('ScholarSync autofill error:', error);
    alert('Failed to autofill form. Please try again.');
  }
};

// Map profile data to field types
const getProfileValue = (profile: any, fieldType: string): string | null => {
  const mapping: { [key: string]: any } = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: null, // Don't autofill email for security
    phone: profile.phone,
    address: profile.streetAddress,
    city: profile.city,
    state: profile.state,
    zip: profile.zip,
    school: profile.currentSchool,
    major: profile.major,
    gpa: profile.gpa?.toString(),
  };

  return mapping[fieldType] || null;
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'detectForm') {
    const form = formDetector.detectFields();
    sendResponse({ success: true, form });
  } else if (message.action === 'autofillForm') {
    autofillForm().then(() => {
      sendResponse({ success: true });
    });
    return true; // Keep channel open for async response
  } else if (message.action === 'detectEssays') {
    const essays = formDetector.detectEssayPrompts();
    sendResponse({ success: true, essays: essays.map(e => ({ prompt: e.prompt })) });
  }
});

// Initialize when page loads
const init = () => {
  injectStyles();

  // Check if scholarship page
  if (formDetector.detectScholarshipPage()) {
    const form = formDetector.detectFields();

    if (form.fields.length >= 5) {
      // Show banner after a short delay
      setTimeout(() => {
        showBanner(form.fields.length);
      }, 1000);
    }
  }
};

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
