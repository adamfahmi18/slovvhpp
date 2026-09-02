"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { updateProfileAction } from "@/actions/settings";
import { useSettingsForm, SubmitButton } from "./settings-form-shell";
import { initials } from "@/lib/utils";

export function ProfileForm({ fullName, username }: { fullName: string; username: string }) {
  const { state, formAction } = useSettingsForm(updateProfileAction, true);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Informasi ini ditampilkan di navigasi atas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-base">{initials(fullName)}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-foreground">{fullName}</p>
              <p className="text-secondary">@{username}</p>
            </div>
          </div>
          <div className="max-w-sm space-y-1.5">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input id="fullName" name="fullName" defaultValue={fullName} />
            {state?.errors?.fullName && <p className="text-xs text-destructive">{state.errors.fullName[0]}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton>Simpan Profil</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
