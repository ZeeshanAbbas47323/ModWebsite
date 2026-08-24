"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

interface OtpFormProps {
  onVerified: () => void;
}

export function OtpForm({ onVerified }: OtpFormProps) {
  const { pendingEmail, verifyOtp, resendOtp, cancelOtp } = useAuth();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await verifyOtp(otp.trim());
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      await resendOtp();
      setNotice("We sent a new code to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the code");
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="container py-16 md:py-24 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Check your email</h1>
        <p className="text-gray-600 mb-8">
          We sent a 6-digit verification code to{" "}
          <span className="font-bold text-black">{pendingEmail}</span>. Enter it below to
          finish signing in.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              required
              className="h-14 rounded-xl text-center text-2xl tracking-[0.5em] font-bold"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {notice && <p className="text-sm text-green-700">{notice}</p>}

          <Button type="submit" size="xl" disabled={busy || otp.length !== 6} className="mt-2">
            {busy ? "Verifying…" : "Verify and sign in"}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-6 text-sm">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-black font-bold underline disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
          <button onClick={cancelOtp} className="text-gray-600 underline">
            Use a different account
          </button>
        </div>
      </div>
    </section>
  );
}
