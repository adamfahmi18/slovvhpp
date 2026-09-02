"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/types";

type ActionFn = (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export function useSettingsForm(action: ActionFn, refreshOnSuccess = false) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, null);
  const lastHandled = useRef<ActionResult | null>(null);

  useEffect(() => {
    if (state && state !== lastHandled.current) {
      lastHandled.current = state;
      if (state.success) {
        toast.success(state.message);
        if (refreshOnSuccess) router.refresh();
      } else if (state.message && !state.errors) {
        toast.error(state.message);
      }
    }
  }, [state, refreshOnSuccess, router]);

  return { state, formAction };
}

export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
