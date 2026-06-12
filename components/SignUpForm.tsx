"use client";

import { AuthFormDivider } from "@/components/auth/AuthFormDivider";
import { AuthOAuthButtons } from "@/components/auth/AuthOAuthButtons";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import Link from "next/link";
import { useState } from "react";

/** Custom sign-up card — same sky GlassCard + layout as SignInForm (no Clerk footer) */
export default function SignUpForm() {
  const { register, verifyEmail, isLoading, isReady, pendingVerification } =
    useSignUpForm();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady) return;

    if (pendingVerification) {
      await verifyEmail(code.trim());
      return;
    }

    await register({ firstName, lastName, email, password });
  };

  if (!isReady) {
    return (
      <div className="w-full max-w-md">
        <GlassCard variant="sky">
          <div className="mb-6 space-y-2">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
          <AuthFormDivider />
          <div className="space-y-4 mb-4">
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
          <Skeleton className="mx-auto h-4 w-56" />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <GlassCard variant="sky">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {pendingVerification ? "Verify your email" : "Create your account"}
          </h1>
          <p className="text-muted-foreground">
            {pendingVerification
              ? "Enter the code sent to your inbox to finish signing up."
              : "Fill in your details to get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {pendingVerification ? (
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification code</Label>
              <Input
                id="verification-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    autoComplete="given-name"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    autoComplete="family-name"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="cta-shine-wrap w-full rounded-2xl">
            <Button
              type="submit"
              className="cta-shine-button w-full"
              disabled={isLoading}
            >
              {isLoading
                ? "Please wait..."
                : pendingVerification
                  ? "Verify & continue"
                  : "Create account"}
            </Button>
          </div>
        </form>

        {!pendingVerification && (
          <>
            <AuthFormDivider />
            <AuthOAuthButtons mode="sign-up" disabled={isLoading} />
          </>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
