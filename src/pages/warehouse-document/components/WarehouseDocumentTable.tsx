import { DataTable } from "@/components/DataTable.tsx";
import type { WarehouseDocumentResource } from "../lib/warehouse-document.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<WarehouseDocumentResource>[];
  data: WarehouseDocumentResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function WarehouseDocumentTable({
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
