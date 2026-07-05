import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign in — AutoSell Ghana",
  description: "Sign in or create your AutoSell Ghana account to manage listings, track your cars, and save favourites.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-5 py-16">
      <Suspense>
        <AuthForm />
      </Suspense>
    </main>
  );
}
