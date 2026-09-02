"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive-soft">
        <TriangleAlert className="h-5 w-5 text-destructive" />
      </div>
      <h1 className="font-heading text-lg font-semibold text-foreground">Terjadi kesalahan</h1>
      <p className="mt-1.5 max-w-sm text-sm text-secondary">
        Maaf, ada yang tidak berjalan sebagaimana mestinya. Coba muat ulang halaman.
      </p>
      <Button className="mt-6" onClick={reset}>
        Coba Lagi
      </Button>
    </div>
  );
}
