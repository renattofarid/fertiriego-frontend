import { DataTable } from "@/components/DataTable.tsx";
import type { BoxResource } from "../lib/box.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<BoxResource>[];
  data: BoxResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function BoxTable({
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