"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/actions/settings";
import { useSettingsForm, SubmitButton } from "./settings-form-shell";

export function PasswordForm() {
  const { state, formAction } = useSettingsForm(changePasswordAction, false);

  return (
    <Card>
      <form action={formAction} key={state?.success ? "submitted" : "form"}>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>Gunakan password yang kuat dan tidak dipakai di layanan lain.</CardDescription>
        </CardHeader>
        <CardContent className="grid max-w-sm gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Password Saat Ini</Label>
            <Input id="currentPassword" name="currentPassword" type="password" />
            {state?.errors?.currentPassword && (
              <p className="text-xs text-destructive">{state.errors.currentPassword[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input id="newPassword" name="newPassword" type="password" />
            {state?.errors?.newPassword && <p className="text-xs text-destructive">{state.errors.newPassword[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" />
            {state?.errors?.confirmPassword && (
              <p className="text-xs text-destructive">{state.errors.confirmPassword[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton>Simpan Password</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
