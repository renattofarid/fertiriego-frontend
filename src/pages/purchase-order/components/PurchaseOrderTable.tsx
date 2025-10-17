import { DataTable } from "@/components/DataTable.tsx";
import type { PurchaseOrderResource } from "../lib/purchase-order.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<PurchaseOrderResource>[];
  data: PurchaseOrderResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PurchaseOrderTable({
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
