/**
 * content.js — Job page detector for Jobify Tracker extension.
 *
 * Detects job details from major ATS platforms and sends them to the popup.
 * Supported: LinkedIn, Greenhouse, Lever, Ashby, Workday (generic fallback).
 * Vanilla JS, no build step, MV3 compatible.
 */

(function () {
  'use strict';

  /** Safely read text from the first matching selector */
  function getText(selectors) {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim()) return el.textContent.trim();
      } catch {
        // Skip invalid selectors
      }
    }
    return null;
  }

  /** Get meta tag content */
  function getMeta(property) {
    const el =
      document.querySelector(`meta[property="${property}"]`) ||
      document.querySelector(`meta[name="${property}"]`);
    return el ? el.getAttribute('content')?.trim() || null : null;
  }

  /** Detect current ATS platform from URL */
  function detectPlatform() {
    const host = location.hostname;
    if (host.includes('linkedin.com')) return 'linkedin';
    if (host.includes('greenhouse.io') || host.includes('greenhouse.com')) return 'greenhouse';
    if (host.includes('lever.co')) return 'lever';
    if (host.includes('ashbyhq.com') || host.includes('ashby.io')) return 'ashby';
    if (host.includes('myworkdayjobs.com')) return 'workday';
    return 'generic';
  }

  /** Extract position + company for each ATS */
  function extractJobData() {
    const platform = detectPlatform();

    switch (platform) {
      case 'linkedin':
        return {
          position: getText([
            '.job-details-jobs-unified-top-card__job-title h1',
            'h1.t-24',
            '.jobs-unified-top-card__job-title',
          ]),
          company: getText([
            '.job-details-jobs-unified-top-card__company-name a',
            '.jobs-unified-top-card__company-name',
            '.topcard__flavor--black-link',
          ]),
        };

      case 'greenhouse':
        return {
          position: getText(['h1.app-title', 'h1.job__title', '#header h1', 'h1']),
          company: getText([
            '.company-name',
            '.header__company-name',
            'meta[property="og:site_name"]',
          ]) || getMeta('og:site_name'),
        };

      case 'lever':
        return {
          position: getText([
            'h2.posting-headline',
            '.posting-headline',
            'h2[data-qa="posting-name"]',
          ]),
          company: getText([
            '.main-header-text .location',
            '.posting-company',
            '.company-name',
          ]) || getMeta('og:site_name'),
        };

      case 'ashby':
        return {
          position: getText(['h1[data-testid]', 'h1.ashby-job-posting-heading', 'h1']),
          company: getText(['[class*="company"]', '[class*="org"]']) || getMeta('og:site_name'),
        };

      case 'workday':
        return {
          position: getText([
            '[data-automation-id="jobPostingHeader"]',
            'h1[data-automation-id]',
          ]),
          company: getMeta('og:site_name') || document.title.split(' - ')[1]?.trim() || null,
        };

      default: {
        // Generic fallback — try title + og tags
        const titleParts = document.title.split(/[|\-–—]/);
        return {
          position:
            getMeta('og:title') ||
            (titleParts[0]?.trim() !== '' ? titleParts[0].trim() : null),
          company:
            getMeta('og:site_name') ||
            (titleParts[1]?.trim() !== '' ? titleParts[1]?.trim() || null : null),
        };
      }
    }
  }

  function detectAndNotify() {
    const { position, company } = extractJobData();

    // Only send if we detected at least a position
    if (position) {
      chrome.runtime.sendMessage({
        type: 'JOB_DETECTED',
        data: {
          position: position || '',
          company: company || '',
          url: location.href,
        },
      });
    }
  }

  // Run on load; also re-run on SPA navigation (LinkedIn uses pushState)
  detectAndNotify();

  // MutationObserver for SPA route changes
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(detectAndNotify, 1000); // Wait for new page to render
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
