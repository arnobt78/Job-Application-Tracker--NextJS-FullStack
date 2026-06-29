/**
 * popup.js — Jobify Tracker extension popup logic.
 *
 * Flow:
 *   1. Load token from background.js storage
 *   2. Verify token against /api/extension/verify
 *   3. Show connected UI + pre-fill detected job data from content.js
 *   4. On "Track" button: POST /api/extension/jobs with Bearer token
 *   5. Show success state with link to dashboard
 */

'use strict';

const APP_URL = 'https://app.jobify-tracker.app'; // Overridden at deploy time

// ── DOM refs ──────────────────────────────────────────────────────────────────
const viewConnect = document.getElementById('view-connect');
const viewTrack   = document.getElementById('view-track');
const viewSuccess = document.getElementById('view-success');
const statusDot   = document.getElementById('status-dot');
const userNameEl  = document.getElementById('user-name');
const inpPosition = document.getElementById('inp-position');
const inpCompany  = document.getElementById('inp-company');
const inpLocation = document.getElementById('inp-location');
const btnConnect  = document.getElementById('btn-connect');
const btnTrack    = document.getElementById('btn-track');
const trackError  = document.getElementById('track-error');
const linkDash    = document.getElementById('link-dashboard');
const btnAnother  = document.getElementById('btn-track-another');

// Detected job data from content.js
let detectedJob = { position: '', company: '', url: '' };
let authToken   = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function showView(id) {
  [viewConnect, viewTrack, viewSuccess].forEach((v) => v.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function setConnected(name) {
  statusDot.classList.remove('disconnected');
  statusDot.classList.add('connected');
  statusDot.title = `Connected as ${name}`;
  userNameEl.textContent = name;
}

function showError(msg) {
  trackError.textContent = msg;
  trackError.classList.remove('hidden');
}

function clearError() {
  trackError.textContent = '';
  trackError.classList.add('hidden');
}

// ── Token management ──────────────────────────────────────────────────────────

function getStoredToken() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_TOKEN' }, (res) => {
      resolve(res?.token || null);
    });
  });
}

function saveToken(token) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'SAVE_TOKEN', token }, resolve);
  });
}

// ── Verify token with Jobify API ──────────────────────────────────────────────

async function verifyToken(token) {
  try {
    const res = await fetch(`${APP_URL}/api/extension/verify`, {
      headers: { 'X-Extension-Token': token },
    });
    if (!res.ok) return null;
    return await res.json(); // { valid, userId, name }
  } catch {
    return null;
  }
}

// ── Track job ─────────────────────────────────────────────────────────────────

async function trackJob() {
  clearError();

  const position = inpPosition.value.trim();
  const company  = inpCompany.value.trim();
  const location = inpLocation.value.trim();

  if (!position || !company) {
    showError('Role and Company are required.');
    return;
  }

  btnTrack.disabled = true;
  btnTrack.textContent = 'Tracking…';

  try {
    const res = await fetch(`${APP_URL}/api/extension/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        position,
        company,
        location: location || 'Remote',
        applyUrl: detectedJob.url || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    const job = await res.json();
    linkDash.href = `${APP_URL}/dashboard/${job.id}`;
    showView('view-success');
  } catch (err) {
    showError(err.message || 'Failed to track job. Please try again.');
  } finally {
    btnTrack.disabled = false;
    btnTrack.textContent = 'Track This Job';
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  // Get detected job from active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.__jobifyDetected || null,
      });
      if (results?.[0]?.result) {
        detectedJob = results[0].result;
      }
    } catch {
      // Content script may not have run yet on this page
    }
  }

  // Also listen for JOB_DETECTED message from content script
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'JOB_DETECTED' && msg.data) {
      detectedJob = msg.data;
      inpPosition.value = msg.data.position || '';
      inpCompany.value  = msg.data.company  || '';
    }
  });

  // Verify stored token
  const token = await getStoredToken();

  if (token) {
    const info = await verifyToken(token);
    if (info?.valid) {
      authToken = token;
      setConnected(info.name);
      inpPosition.value = detectedJob.position || '';
      inpCompany.value  = detectedJob.company  || '';
      showView('view-track');
      return;
    }
  }

  // Not connected or token expired
  showView('view-connect');
}

// ── Event listeners ───────────────────────────────────────────────────────────

btnConnect.addEventListener('click', () => {
  // Open /profile?extension=1 so user can generate + copy their token
  chrome.tabs.create({ url: `${APP_URL}/profile?extension=1` });
});

btnTrack.addEventListener('click', trackJob);

btnAnother.addEventListener('click', () => {
  inpPosition.value = '';
  inpCompany.value  = '';
  inpLocation.value = '';
  clearError();
  showView('view-track');
});

// ── Token intake from profile page (postMessage relay) ───────────────────────
// When the user copies their token and the profile page sends it, auto-save it.
chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === 'JOBIFY_TOKEN' && msg.token) {
    await saveToken(msg.token);
    authToken = msg.token;
    const info = await verifyToken(msg.token);
    if (info?.valid) {
      setConnected(info.name);
      showView('view-track');
    }
  }
});

// Run
init();
