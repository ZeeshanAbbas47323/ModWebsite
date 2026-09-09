"use client";

/**
 * Shared frame for /login, /register, /forgot-password and the OTP step —
 * card and a subtle background wash. Previously each screen was a bare form
 * straight on white with no visual weight; this matches the storefront's own
 * look instead of reading like an unstyled placeholder.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-[#FAFAFA] px-4 py-12 md:py-20">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
        {children}
      </div>
    </main>
  );
}
