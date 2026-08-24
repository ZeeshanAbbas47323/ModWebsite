import { AccountPanel } from "@/components/auth/account-panel";

export const metadata = { title: "My Account | Modfirst Apparel" };

export default function AccountPage() {
  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <AccountPanel />
    </main>
  );
}
