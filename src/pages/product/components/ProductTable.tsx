import { DataTable } from "@/components/DataTable.tsx";
import type { ProductResource } from "../lib/product.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<ProductResource>[];
  data: ProductResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ProductTable({
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
        initialColumnVisibility={{ technical_sheet: false, product_images: false }}
      >
        {children}
      </DataTable>
    </div>
  );
}
