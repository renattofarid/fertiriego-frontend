import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { BoxShiftResource } from "../lib/box-shift.interface";

interface BoxShiftTableProps {
  columns: ColumnDef<BoxShiftResource>[];
  data: BoxShiftResource[];
  isLoading: boolean;
  children?: React.ReactNode;
}

export default function BoxShiftTable({
  columns,
  data,
  isLoading,
  children,
}: BoxShiftTableProps) {
  return (
    <DataTable columns={columns} data={data} isLoading={isLoading}>
      {children}
    </DataTable>
  );
}
