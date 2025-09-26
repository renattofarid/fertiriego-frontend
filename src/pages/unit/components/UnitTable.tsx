import type { ColumnDef } from "@tanstack/react-table";
import type { UnitResource } from "../lib/unit.interface";
import { DataTable } from "@/components/DataTable";

interface UnitTableProps {
  data: UnitResource[];
  columns: ColumnDef<UnitResource, any>[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function UnitTable({
  data,
  columns,
  isLoading,
  children,
}: UnitTableProps) {
  return (
    <DataTable data={data} columns={columns} isLoading={isLoading}>
      {children}
    </DataTable>
  );
}
