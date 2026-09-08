"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired once the last box is filled, so no submit button is needed. */
  onComplete: (value: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
}

/**
 * One box per digit, with the behaviour people expect from a code field:
 * typing advances, backspace retreats, arrows move, and pasting a whole code
 * fills every box at once.
 *
 * `onComplete` fires as soon as the last digit lands, so the caller can verify
 * immediately rather than making the user press a button.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  invalid = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * The digits as last written, read instead of the `value` prop inside
   * handlers. Typing quickly fires several key events before React re-renders,
   * so a handler closing over `value` would keep seeing the stale string and
   * every keystroke after the first would be lost.
   */
  const digitsRef = useRef<string[]>([]);
  digitsRef.current = value.padEnd(length, " ").slice(0, length).split("");

  // Guards against firing twice when the last digit is set and re-rendered.
  const completed = useRef(false);

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (value.length === length && !completed.current) {
      completed.current = true;
      onComplete(value);
    }
    if (value.length < length) completed.current = false;
  }, [value, length, onComplete]);

  /** Trailing blanks are trimmed; interior ones stay so boxes don't shift. */
  const commit = (digits: string[]) => {
    digitsRef.current = digits;
    onChange(digits.join("").replace(/\s+$/, ""));
  };

  const handleChange = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;

    const digits = [...digitsRef.current];

    // More than one character means a paste or the browser autofilling.
    if (typed.length > 1) {
      for (let i = 0; i < typed.length && index + i < length; i++) {
        digits[index + i] = typed[i];
      }
      commit(digits);
      inputs.current[Math.min(index + typed.length, length - 1)]?.focus();
      return;
    }

    digits[index] = typed;
    commit(digits);
    if (index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const digits = [...digitsRef.current];

    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index] !== " ") {
        digits[index] = " ";
        commit(digits);
      } else if (index > 0) {
        digits[index - 1] = " ";
        commit(digits);
        inputs.current[index - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    commit(pasted.padEnd(length, " ").split(""));
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => {
        const digit = value[i] ?? "";
        return (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            // Only the first box carries this, so iOS fills the whole code once.
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit.trim()}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={invalid}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            className={cn(
              "size-12 sm:size-14 rounded-xl border-2 bg-white text-center",
              "text-xl sm:text-2xl font-bold text-black caret-transparent",
              "outline-none transition-colors",
              "focus:border-black focus:ring-4 focus:ring-black/10",
              "disabled:cursor-not-allowed disabled:opacity-60",
              invalid ? "border-red-500" : "border-gray-300"
            )}
          />
        );
      })}
    </div>
  );
}
