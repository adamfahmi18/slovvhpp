"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OverheadFormDialog } from "./overhead-form-dialog";

export function OverheadToolbar() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-sm text-secondary">Daftar biaya tetap bulanan yang dialokasikan ke setiap unit produksi.</p>

      <Button onClick={() => setCreateOpen(true)} className="shrink-0">
        <Plus className="h-4 w-4" />
        Tambah Biaya
      </Button>

      <OverheadFormDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
