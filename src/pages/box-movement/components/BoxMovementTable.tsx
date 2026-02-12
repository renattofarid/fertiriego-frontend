import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { BoxMovementResource } from "../lib/box-movement.interface";

interface BoxMovementTableProps {
  columns: ColumnDef<BoxMovementResource>[];
  data: BoxMovementResource[];
  isLoading: boolean;
  children?: React.ReactNode;
}

export default function BoxMovementTable({
  columns,
  data,
  isLoading,
  children,
}: BoxMovementTableProps) {
  return (
    <DataTable columns={columns} data={data} isLoading={isLoading}>
      {children}
    </DataTable>
  );
}
