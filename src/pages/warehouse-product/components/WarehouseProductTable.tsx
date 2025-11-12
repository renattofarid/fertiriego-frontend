import { DataTable } from "@/components/DataTable.tsx";
import type { WarehouseProductResource } from "../lib/warehouse-product.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<WarehouseProductResource>[];
  data: WarehouseProductResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function WarehouseProductTable({
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
