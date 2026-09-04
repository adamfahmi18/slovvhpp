import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { TableRowsSkeleton } from "@/components/ui/skeleton-card";

export default function OverheadLoading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>
      <Skeleton className="mb-6 h-40 w-full" />
      <div className="mb-4 flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <TableRowsSkeleton rows={4} cols={3} />
      </Card>
    </div>
  );
}
