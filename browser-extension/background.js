/**
 * background.js — Jobify Tracker service worker (MV3).
 *
 * Handles token storage so the popup can send/read auth tokens securely.
 * chrome.storage.local persists across extension reloads.
 */

'use strict';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SAVE_TOKEN') {
    chrome.storage.local.set({ jobify_token: message.token }, () => {
      sendResponse({ ok: true });
    });
    return true; // Keep channel open for async sendResponse
  }

  if (message.type === 'GET_TOKEN') {
    chrome.storage.local.get('jobify_token', (result) => {
      sendResponse({ token: result.jobify_token || null });
    });
    return true;
  }

  if (message.type === 'CLEAR_TOKEN') {
    chrome.storage.local.remove('jobify_token', () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});
