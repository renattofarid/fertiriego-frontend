import { DataTable } from "@/components/DataTable.tsx";
import type { WarehouseResource } from "../lib/warehouse.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<WarehouseResource>[];
  data: WarehouseResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function WarehouseTable({
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