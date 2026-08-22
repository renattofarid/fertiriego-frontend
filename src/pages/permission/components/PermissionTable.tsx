import { DataTable } from "@/components/DataTable.tsx";
import type { PermissionResource } from "../lib/permission.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<PermissionResource>[];
  data: PermissionResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PermissionTable({
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
