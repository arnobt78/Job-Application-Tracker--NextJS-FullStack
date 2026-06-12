/** SessionStorage keys for auth toasts after full-page navigation */
export const AUTH_TOAST_KEYS = {
  welcomeName: 'jobify_auth_welcome_name',
  goodbyeName: 'jobify_auth_goodbye_name',
  /** Set before OAuth redirect — name resolved from Clerk on landing */
  welcomePending: 'jobify_auth_welcome_pending',
} as const;

export function setPendingWelcomeToast(firstName: string): void {
  try {
    sessionStorage.setItem(AUTH_TOAST_KEYS.welcomeName, firstName);
  } catch {
    // ignore quota / private mode
  }
}

export function setWelcomePending(): void {
  try {
    sessionStorage.setItem(AUTH_TOAST_KEYS.welcomePending, '1');
  } catch {
    // ignore
  }
}

export function consumeWelcomePending(): boolean {
  try {
    const v = sessionStorage.getItem(AUTH_TOAST_KEYS.welcomePending);
    if (v) sessionStorage.removeItem(AUTH_TOAST_KEYS.welcomePending);
    return v === '1';
  } catch {
    return false;
  }
}

export function setPendingGoodbyeToast(firstName: string): void {
  try {
    sessionStorage.setItem(AUTH_TOAST_KEYS.goodbyeName, firstName);
  } catch {
    // ignore
  }
}

export function consumePendingWelcomeName(): string | null {
  try {
    const name = sessionStorage.getItem(AUTH_TOAST_KEYS.welcomeName);
    if (name) sessionStorage.removeItem(AUTH_TOAST_KEYS.welcomeName);
    return name;
  } catch {
    return null;
  }
}

export function consumePendingGoodbyeName(): string | null {
  try {
    const name = sessionStorage.getItem(AUTH_TOAST_KEYS.goodbyeName);
    if (name) sessionStorage.removeItem(AUTH_TOAST_KEYS.goodbyeName);
    return name;
  } catch {
    return null;
  }
}

/** First token of display name for friendly toast titles */
export function firstNameFrom(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return 'there';
  return fullName.trim().split(/\s+/)[0] ?? 'there';
}
