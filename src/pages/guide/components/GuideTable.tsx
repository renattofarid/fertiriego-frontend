import type { ColumnDef } from "@tanstack/react-table";
import type { GuideResource } from "../lib/guide.interface";
import { DataTable } from "@/components/DataTable";

interface GuideTableProps {
  columns: ColumnDef<GuideResource>[];
  data: GuideResource[];
  isLoading: boolean;
  children?: React.ReactNode;
}

export default function GuideTable({
  columns,
  data,
  isLoading,
  children,
}: GuideTableProps) {
  return (
    <DataTable columns={columns} data={data} isLoading={isLoading}>
      {children}
    </DataTable>
  );
}
