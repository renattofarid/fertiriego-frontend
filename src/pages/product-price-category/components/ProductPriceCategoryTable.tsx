import { DataTable } from "@/components/DataTable.tsx";
import type { ProductPriceCategoryResource } from "../lib/product-price-category.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<ProductPriceCategoryResource>[];
  data: ProductPriceCategoryResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ProductPriceCategoryTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{}}
      >
        {children}
      </DataTable>
    </div>
  );
}
