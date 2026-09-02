"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeUsernameAction } from "@/actions/settings";
import { useSettingsForm, SubmitButton } from "./settings-form-shell";

export function UsernameForm({ currentUsername }: { currentUsername: string }) {
  const { state, formAction } = useSettingsForm(changeUsernameAction, true);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Ubah Username</CardTitle>
          <CardDescription>Username saat ini: <span className="font-medium text-foreground">@{currentUsername}</span></CardDescription>
        </CardHeader>
        <CardContent className="grid max-w-sm gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="newUsername">Username Baru</Label>
            <Input id="newUsername" name="newUsername" placeholder={currentUsername} />
            {state?.errors?.newUsername && <p className="text-xs text-destructive">{state.errors.newUsername[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currentPasswordForUsername">Password Saat Ini</Label>
            <Input id="currentPasswordForUsername" name="currentPassword" type="password" />
            {state?.errors?.currentPassword && (
              <p className="text-xs text-destructive">{state.errors.currentPassword[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton>Simpan Username</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
