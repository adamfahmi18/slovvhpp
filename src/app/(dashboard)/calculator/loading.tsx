import { Skeleton } from "@/components/ui/skeleton";

export default function CalculatorLoading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-[560px] lg:col-span-3" />
        <Skeleton className="h-[560px] lg:col-span-2" />
      </div>
    </div>
  );
}
