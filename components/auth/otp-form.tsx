"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { OtpInput } from "@/components/auth/otp-input";

interface OtpFormProps {
  onVerified: () => void;
}

/** Seconds before "Resend code" becomes available again. */
const RESEND_COOLDOWN = 30;

export function OtpForm({ onVerified }: OtpFormProps) {
  const { pendingEmail, verifyOtp, resendOtp, cancelOtp } = useAuth();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  // Verification is fired from an effect-driven callback, so guard against a
  // second run while the first request is still in flight.
  const verifying = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = useCallback(
    async (code: string) => {
      if (verifying.current) return;
      verifying.current = true;
      setError(null);
      setNotice(null);
      setBusy(true);
      try {
        await verifyOtp(code);
        onVerified();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid or expired code");
        // Clear the boxes so the next attempt starts from an empty field.
        setOtp("");
      } finally {
        verifying.current = false;
        setBusy(false);
      }
    },
    [verifyOtp, onVerified]
  );

  const handleResend = async () => {
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      await resendOtp();
      setNotice("We sent a new code to your email.");
      setOtp("");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the code");
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="container flex justify-center py-16 md:py-24">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-3xl font-bold text-black md:text-4xl">
          Enter Verification Code
        </h1>
        <p className="mb-8 text-gray-600">
          A 6-digit code has been sent to{" "}
          <span className="font-semibold text-black">{pendingEmail}</span>
        </p>

        <OtpInput
          value={otp}
          onChange={setOtp}
          onComplete={submit}
          disabled={busy}
          invalid={!!error}
        />

        {/* Reserved height so the layout doesn't jump as messages swap. */}
        <div className="mt-5 min-h-6 text-sm" aria-live="polite">
          {busy && (
            <span className="inline-flex items-center gap-2 text-gray-600">
              <Loader2 className="size-4 animate-spin" />
              Verifying…
            </span>
          )}
          {!busy && error && <span className="text-red-600">{error}</span>}
          {!busy && !error && notice && (
            <span className="text-green-700">{notice}</span>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          <div className="text-gray-600">
            Didn&apos;t get the code?{" "}
            {cooldown > 0 ? (
              <span className="text-gray-400">Resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || busy}
                className="font-bold text-black underline disabled:opacity-50"
              >
                {resending ? "Sending…" : "Resend code"}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={cancelOtp}
            className="text-gray-500 underline"
          >
            Use a different account
          </button>
        </div>
      </div>
    </section>
  );
}
