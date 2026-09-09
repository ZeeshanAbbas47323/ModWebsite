"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpInput } from "@/components/auth/otp-input";
import { authService } from "@/services/auth.service";
import { PASSWORD_RULES, isStrongPassword } from "@/lib/password-rules";

type Step = "email" | "otp" | "password";

export function ForgotPasswordForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fail = (err: unknown, fallback: string) =>
    setError(err instanceof Error ? err.message : fallback);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      setNotice(await authService.forgotPassword(email.trim()));
      setStep("otp");
    } catch (err) {
      fail(err, "Couldn't send the reset code. Please try again.");
    } finally {
      setBusy(false);
    }
  };


  const confirmCode = useCallback(
    async (code: string) => {
      setError(null);
      setBusy(true);
      try {


        await authService.verifyResetOtp(email.trim(), code);
        setNotice(null);
        setStep("password");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "That code isn't valid. Check your email and try again."
        );
        setOtp("");
      } finally {
        setBusy(false);
      }
    },
    [email]
  );

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isStrongPassword(password)) {
      setError("Your password does not meet all the requirements below.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: password,
        confirmPassword,
      });
      router.push("/login?reset=1");
    } catch (err) {
      fail(err, "Couldn't reset your password. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
          Reset your password
        </h1>
        <p className="text-gray-600 mb-8">
          {step === "email" && "We'll email you a 6-digit code."}
          {step === "otp" && `Enter the code we sent to ${email}.`}
          {step === "password" && "Choose a new password."}
        </p>

        {step === "email" && (
          <form onSubmit={requestCode} className="flex flex-col gap-4">
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

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" size="xl" disabled={busy} className="mt-2">
              {busy ? "Please wait…" : "Send reset code"}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <div className="flex flex-col gap-4">
            {notice && <p className="text-center text-sm text-gray-600">{notice}</p>}


            <OtpInput
              value={otp}
              onChange={setOtp}
              onComplete={confirmCode}
              disabled={busy}
              invalid={!!error}
            />

            <div className="min-h-6 text-center text-sm" aria-live="polite">
              {busy && (
                <span className="inline-flex items-center gap-2 text-gray-600">
                  <Loader2 className="size-4 animate-spin" />
                  Checking…
                </span>
              )}
              {!busy && error && <span className="text-red-600">{error}</span>}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError(null);
              }}
              className="text-sm text-gray-600 underline"
            >
              Use a different email
            </button>
          </div>
        )}

        {step === "password" && (
          <form onSubmit={savePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl"
              />
              {password.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const met = rule.test(password);
                    return (
                      <li
                        key={rule.label}
                        className={`text-xs ${met ? "text-green-600" : "text-gray-500"}`}
                      >
                        {met ? "✓" : "•"} {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
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

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" size="xl" disabled={busy} className="mt-2">
              {busy ? "Please wait…" : "Reset password"}
            </Button>
          </form>
        )}

        <p className="text-sm text-gray-600 mt-6 text-center">
          Remembered it?{" "}
          <Link href="/login" className="text-black font-bold underline">
            Sign in
          </Link>
        </p>
    </AuthShell>
  );
}
