import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { TableRowsSkeleton } from "@/components/ui/skeleton-card";

export default function ProductsLoading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <TableRowsSkeleton rows={6} cols={6} />
      </Card>
    </div>
  );
}
