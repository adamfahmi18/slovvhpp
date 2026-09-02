import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { TableRowsSkeleton } from "@/components/ui/skeleton-card";

export default function ReportsLoading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="mb-4 flex justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-9 w-40" />
      </div>
      <Card>
        <TableRowsSkeleton rows={5} cols={5} />
      </Card>
    </div>
  );
}
