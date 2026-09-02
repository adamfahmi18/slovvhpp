import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { ProductsToolbar } from "@/components/products/products-toolbar";
import { ProductsTable } from "@/components/products/products-table";
import { Pagination } from "@/components/shared/pagination";
import { getProducts, getProductCategories } from "@/actions/products";
import { getSystemSettings } from "@/actions/settings";

export const metadata: Metadata = { title: "Produk" };
export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{ search?: string; category?: string; status?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ items, total, totalPages, pageSize }, categories, settings] = await Promise.all([
    getProducts({
      search: params.search,
      category: params.category ?? "all",
      status: (params.status as "active" | "archived" | "all") ?? "all",
      page,
      pageSize: 10,
    }),
    getProductCategories(),
    getSystemSettings(),
  ]);

  return (
    <div>
      <PageHeader title="Produk" description="Kelola katalog produk beserta rincian HPP masing-masing." />

      <ProductsToolbar categories={categories} defaultMarginPercent={Number(settings.default_margin_percent) || 30} />

      <Card className="overflow-hidden">
        <ProductsTable products={items} defaultMarginPercent={Number(settings.default_margin_percent) || 30} />
        {total > 0 && <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} />}
      </Card>
    </div>
  );
}
