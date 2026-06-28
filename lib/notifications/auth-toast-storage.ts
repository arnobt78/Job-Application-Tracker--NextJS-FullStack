/** localStorage keys for auth toasts after full-page navigation (survives sign-out) */
export const AUTH_TOAST_KEYS = {
  welcomeName: 'jobify_auth_welcome_name',
  goodbyeName: 'jobify_auth_goodbye_name',
  /** Set before OAuth redirect — name resolved from NextAuth session on dashboard */
  welcomePending: 'jobify_auth_welcome_pending',
} as const;

function storage(): Storage | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

export function setPendingWelcomeToast(firstName: string): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(AUTH_TOAST_KEYS.welcomeName, firstName);
  } catch {
    // ignore quota / private mode
  }
}

export function setWelcomePending(): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(AUTH_TOAST_KEYS.welcomePending, '1');
  } catch {
    // ignore
  }
}

export function hasWelcomePending(): boolean {
  const s = storage();
  if (!s) return false;
  try {
    return s.getItem(AUTH_TOAST_KEYS.welcomePending) === '1';
  } catch {
    return false;
  }
}

export function consumeWelcomePending(): boolean {
  const s = storage();
  if (!s) return false;
  try {
    const v = s.getItem(AUTH_TOAST_KEYS.welcomePending);
    if (v) s.removeItem(AUTH_TOAST_KEYS.welcomePending);
    return v === '1';
  } catch {
    return false;
  }
}

export function hasPendingWelcomeName(): boolean {
  const s = storage();
  if (!s) return false;
  try {
    return s.getItem(AUTH_TOAST_KEYS.welcomeName) != null;
  } catch {
    return false;
  }
}

export function setPendingGoodbyeToast(firstName: string): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(AUTH_TOAST_KEYS.goodbyeName, firstName);
  } catch {
    // ignore
  }
}

export function hasPendingGoodbyeName(): boolean {
  const s = storage();
  if (!s) return false;
  try {
    return s.getItem(AUTH_TOAST_KEYS.goodbyeName) != null;
  } catch {
    return false;
  }
}

export function consumePendingWelcomeName(): string | null {
  const s = storage();
  if (!s) return null;
  try {
    const name = s.getItem(AUTH_TOAST_KEYS.welcomeName);
    if (name) s.removeItem(AUTH_TOAST_KEYS.welcomeName);
    return name;
  } catch {
    return null;
  }
}

export function consumePendingGoodbyeName(): string | null {
  const s = storage();
  if (!s) return null;
  try {
    const name = s.getItem(AUTH_TOAST_KEYS.goodbyeName);
    if (name) s.removeItem(AUTH_TOAST_KEYS.goodbyeName);
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
