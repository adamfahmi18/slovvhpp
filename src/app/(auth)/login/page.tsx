import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary font-heading text-lg font-semibold text-primary-foreground">
            S
          </div>
          <h1 className="font-heading text-xl font-semibold text-foreground">Masuk ke Slovv HPP</h1>
          <p className="mt-1.5 text-sm text-secondary">
            Kelola harga pokok produksi dan profitabilitas bisnis Anda.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          Akun dikelola oleh administrator sistem.
        </p>
      </div>
    </div>
  );
}
