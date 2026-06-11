import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function SSOCallbackPage() {
  return (
    <>
      <AuthenticateWithRedirectCallback />
      <div id="clerk-captcha" />
    </>
  );
}
