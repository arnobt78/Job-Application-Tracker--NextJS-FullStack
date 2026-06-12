"use client";

import { AuthFormDivider } from "@/components/auth/AuthFormDivider";
import { AuthOAuthButtons } from "@/components/auth/AuthOAuthButtons";
import Link from "next/link";
import { useState } from "react";
import { useGuestSignIn } from "@/hooks/useGuestSignIn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import {
  TEST_ACCOUNTS,
  type TestAccountRole,
} from "@/lib/auth/test-credentials";

interface SignInFormProps {
  isGuest?: boolean;
}

export default function SignInForm({ isGuest = false }: SignInFormProps) {
  const { signInWithCredentials, isLoading, isReady } = useGuestSignIn();
  const guestAccount = TEST_ACCOUNTS["guest-user"];
  const [selectedRole, setSelectedRole] = useState(isGuest ? "guest-user" : "");
  const [email, setEmail] = useState(isGuest ? guestAccount.email : "");
  const [password, setPassword] = useState(
    isGuest ? guestAccount.password : "",
  );

  const handleRoleSelect = (value: string) => {
    if (value === "clear") {
      setSelectedRole("");
      setEmail("");
      setPassword("");
    } else {
      setSelectedRole(value);
      const account = TEST_ACCOUNTS[value as TestAccountRole];
      if (account) {
        setEmail(account.email);
        setPassword(account.password);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady) return;
    await signInWithCredentials(email, password);
  };

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
            <Select
              key={`select-${selectedRole || "empty"}`}
              value={selectedRole || undefined}
              onValueChange={handleRoleSelect}
            >
              <SelectTrigger id="guest-select" className="glass-input">
                <SelectValue placeholder="Select Role Based Test Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guest-user">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Test User</span>
                    <span className="text-xs text-muted-foreground">
                      test@user.com
                    </span>
                  </div>
                </SelectItem>
                {selectedRole && (
                  <SelectItem
                    value="clear"
                    className="opacity-60 focus:opacity-100"
                  >
                    Clear Selection
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
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
            />
          </div>

          <div className="cta-shine-wrap w-full rounded-2xl">
            <Button
              type="submit"
              className="cta-shine-button w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
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
