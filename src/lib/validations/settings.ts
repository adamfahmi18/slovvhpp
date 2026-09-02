import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter").max(120),
});

export const changeUsernameSchema = z.object({
  newUsername: z.string().min(3, "Username minimal 3 karakter").max(50),
  currentPassword: z.string().min(1, "Masukkan password saat ini"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Masukkan password saat ini"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password baru"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const systemSettingsSchema = z.object({
  companyName: z.string().min(1, "Nama perusahaan wajib diisi").max(120),
  defaultMarginPercent: z.coerce.number().min(0).max(95),
  currency: z.string().min(1).default("IDR"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangeUsernameInput = z.infer<typeof changeUsernameSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>;
