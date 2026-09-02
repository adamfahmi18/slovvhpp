import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { UsernameForm } from "@/components/settings/username-form";
import { PasswordForm } from "@/components/settings/password-form";
import { SystemSettingsForm } from "@/components/settings/system-settings-form";
import { getSession } from "@/lib/auth";
import { getSystemSettings } from "@/actions/settings";

export const metadata: Metadata = { title: "Pengaturan" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const settings = await getSystemSettings();

  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader title="Pengaturan" description="Kelola profil, kredensial, dan preferensi sistem." />

      <ProfileForm fullName={session.fullName} username={session.username} />
      <UsernameForm currentUsername={session.username} />
      <PasswordForm />
      <SystemSettingsForm
        companyName={settings.company_name}
        defaultMarginPercent={Number(settings.default_margin_percent) || 30}
        currency={settings.currency}
      />
    </div>
  );
}
