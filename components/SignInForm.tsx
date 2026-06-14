"use client";

import { AuthFormDivider } from "@/components/auth/AuthFormDivider";
import { AuthOAuthButtons } from "@/components/auth/AuthOAuthButtons";
import { TestAccountSelectRow } from "@/components/auth/test-account-select-row";
import Link from "next/link";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GlassDropdownActionItem,
  GlassDropdownContent,
  GlassDropdownRadioItem,
  GlassDropdownSeparator,
  GlassDropdownTrigger,
} from "@/components/ui/glass-dropdown-menu";
import {
  TEST_ACCOUNTS,
  type TestAccount,
  type TestAccountRole,
} from "@/lib/auth/test-credentials";
import { Eraser, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export type SignInFormProps = {
  isGuest?: boolean;
  isReady: boolean;
  isLoading: boolean;
  selectedRole: TestAccountRole | "";
  onAccountChange: (role: TestAccountRole | "") => void;
  signInWithCredentials: (email: string, password: string) => Promise<boolean>;
  guestAccount: TestAccount;
};

export default function SignInForm({
  isGuest = false,
  isReady,
  isLoading,
  selectedRole,
  onAccountChange,
  signInWithCredentials,
  guestAccount,
}: SignInFormProps) {
  const [email, setEmail] = useState(() =>
    isGuest ? guestAccount.email : ""
  );
  const [password, setPassword] = useState(() =>
    isGuest ? guestAccount.password : ""
  );

  const handleRoleSelect = (value: string) => {
    const role = value as TestAccountRole;
    onAccountChange(role);
    const account = TEST_ACCOUNTS[role];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  };

  const handleClearSelection = () => {
    onAccountChange("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady || isLoading) return;
    await signInWithCredentials(email, password);
  };

  const guestUserAccount = TEST_ACCOUNTS["guest-user"];

  if (!isReady) {
    return (
      <div className="w-full max-w-md">
        <GlassCard variant="sky">
          <div className="space-y-2 mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <Skeleton className="h-4 w-6 rounded" />
            </div>
          </div>
          <div className="space-y-4 mb-4">
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-4 w-48" />
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <GlassCard variant="sky">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guest-select">Login with Test Account</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={isLoading}>
                <GlassDropdownTrigger id="guest-select">
                  {selectedRole ? (
                    <TestAccountSelectRow
                      name={guestUserAccount.name}
                      email={guestUserAccount.email}
                      imageUrl={guestUserAccount.imageUrl}
                    />
                  ) : (
                    <span className="text-muted-foreground">
                      Select Role Based Test Account
                    </span>
                  )}
                </GlassDropdownTrigger>
              </DropdownMenuTrigger>
              <GlassDropdownContent
                align="start"
                collisionPadding={8}
                sideOffset={8}
                className="w-[var(--radix-dropdown-menu-trigger-width)]"
              >
                <DropdownMenuRadioGroup
                  value={selectedRole || undefined}
                  onValueChange={handleRoleSelect}
                >
                  <GlassDropdownRadioItem value="guest-user">
                    <TestAccountSelectRow
                      name={guestUserAccount.name}
                      email={guestUserAccount.email}
                      imageUrl={guestUserAccount.imageUrl}
                    />
                  </GlassDropdownRadioItem>
                </DropdownMenuRadioGroup>
                {selectedRole ? (
                  <>
                    <GlassDropdownSeparator />
                    <GlassDropdownActionItem
                      label="Clear Selection"
                      icon={<Eraser className="h-4 w-4" />}
                      onSelect={handleClearSelection}
                      className="opacity-60 focus:opacity-100"
                    />
                  </>
                ) : null}
              </GlassDropdownContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="cta-shine-wrap w-full rounded-2xl">
            <Button
              type="submit"
              className="cta-shine-button w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Signing in...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden />
                  Sign In
                </>
              )}
            </Button>
          </div>
        </form>

        <AuthFormDivider />
        <AuthOAuthButtons mode="sign-in" disabled={isLoading} />

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
