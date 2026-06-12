import { SignInPageShell } from '@/components/pages/SignInPageShell';

type SignInPageContentProps = {
  isGuest?: boolean;
};

/** Auth page layout — server wrapper; interactive shell is client-only */
export function SignInPageContent({ isGuest = false }: SignInPageContentProps) {
  return <SignInPageShell isGuest={isGuest} />;
}
