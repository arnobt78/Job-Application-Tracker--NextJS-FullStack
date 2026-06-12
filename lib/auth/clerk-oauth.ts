/** Shared Clerk OAuth redirect targets — sign-in + sign-up */
export const CLERK_OAUTH_REDIRECT = {
  redirectUrl: '/sign-in/sso-callback',
  redirectUrlComplete: '/dashboard',
} as const;
