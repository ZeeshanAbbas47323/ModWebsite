import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Create account | Modfirst Apparel" };

export default function RegisterPage() {
  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </main>
  );
}
