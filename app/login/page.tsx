import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
