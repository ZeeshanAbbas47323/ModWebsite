"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { OtpForm } from "@/components/auth/otp-form";
import { PASSWORD_RULES, digitCount, isStrongPassword } from "@/lib/password-rules";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, pendingEmail } = useAuth();

  const redirectTo = searchParams.get("redirect") || "/account";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  /** Client-side mirror of the API's rules, so errors show before the request. */
  const validate = (): string | null => {
    if (!isRegister) return null;
    if (fullName.trim().length < 2) return "Please enter your full name.";
    if (digitCount(phone) < 10) return "Phone number must have at least 10 digits.";
    if (!isStrongPassword(password)) {
      return "Your password does not meet all the requirements below.";
    }
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    try {
      const step = isRegister
        ? await register({
            full_name: fullName,
            email,
            phone,
            password,
            confirmPassword,
          })
        : await login({ email, password, rememberMe: true });

      // Staff accounts (and any account the API gates) finish on the OTP screen.
      if (step === "authenticated") router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (pendingEmail) {
    return <OtpForm onVerified={() => router.push(redirectTo)} />;
  }

  return (
    <section className="container py-16 md:py-24 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
          {isRegister ? "Create an account" : "Welcome back"}
        </h1>
        <p className="text-gray-600 mb-8">
          {isRegister
            ? "Save your cart, track orders and check out faster."
            : "Sign in to see your cart and orders."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  minLength={2}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  minLength={10}
                  className="h-12 rounded-xl"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="h-12 rounded-xl"
            />
            {isRegister && password.length > 0 && (
              <ul className="flex flex-col gap-1 mt-1">
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-2 text-xs ${
                        met ? "text-green-700" : "text-gray-500"
                      }`}
                    >
                      <span aria-hidden className="w-3.5 shrink-0">{met ? "✓" : "•"}</span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {isRegister && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12 rounded-xl"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match.</p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" size="xl" disabled={busy} className="mt-2">
            {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-black font-bold underline">Sign in</Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/register" className="text-black font-bold underline">Create an account</Link>
            </>
          )}
        </p>
        <p className="text-sm text-gray-500 mt-3 text-center">
          You can also{" "}
          <Link href="/checkout" className="underline">check out as a guest</Link>.
        </p>
      </div>
    </section>
  );
}
