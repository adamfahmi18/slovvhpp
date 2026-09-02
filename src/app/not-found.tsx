import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-5 w-5 text-secondary" />
      </div>
      <h1 className="font-heading text-lg font-semibold text-foreground">Halaman tidak ditemukan</h1>
      <p className="mt-1.5 max-w-sm text-sm text-secondary">
        Halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
}
