"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSystemSettingsAction } from "@/actions/settings";
import { useSettingsForm, SubmitButton } from "./settings-form-shell";

interface SystemSettingsFormProps {
  companyName: string;
  defaultMarginPercent: number;
  currency: string;
}

export function SystemSettingsForm({ companyName, defaultMarginPercent, currency }: SystemSettingsFormProps) {
  const { state, formAction } = useSettingsForm(updateSystemSettingsAction, true);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Pengaturan Sistem</CardTitle>
          <CardDescription>Nilai default yang digunakan di seluruh aplikasi.</CardDescription>
        </CardHeader>
        <CardContent className="grid max-w-sm gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Nama Perusahaan</Label>
            <Input id="companyName" name="companyName" defaultValue={companyName} />
            {state?.errors?.companyName && <p className="text-xs text-destructive">{state.errors.companyName[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="defaultMarginPercent">Margin Default (%)</Label>
            <Input
              id="defaultMarginPercent"
              name="defaultMarginPercent"
              type="number"
              min={0}
              max={95}
              defaultValue={defaultMarginPercent}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Mata Uang</Label>
            <Input id="currency" name="currency" defaultValue={currency} />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton>Simpan Pengaturan</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
