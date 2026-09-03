import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { RawMaterialsToolbar } from "@/components/raw-materials/raw-materials-toolbar";
import { RawMaterialsTable } from "@/components/raw-materials/raw-materials-table";
import { Pagination } from "@/components/shared/pagination";
import { getRawMaterials } from "@/actions/raw-materials";

export const metadata: Metadata = { title: "Bahan Baku" };
export const dynamic = "force-dynamic";

interface BahanBakuPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function BahanBakuPage({ searchParams }: BahanBakuPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const { items, total, totalPages, pageSize } = await getRawMaterials({
    search: params.search,
    page,
    pageSize: 10,
  });

  return (
    <div>
      <PageHeader
        title="Bahan Baku"
        description="Kelola daftar bahan baku beserta harganya untuk dipakai di resep produk."
      />

      <RawMaterialsToolbar />

      <Card className="overflow-hidden">
        <RawMaterialsTable materials={items} />
        {total > 0 && <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} />}
      </Card>
    </div>
  );
}
