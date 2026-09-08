import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = { title: "Reset password | Modfirst Apparel" };

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </main>
  );
}
