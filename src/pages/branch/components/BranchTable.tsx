import { DataTable } from "@/components/DataTable.tsx";
import type { BranchResource } from "../lib/branch.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<BranchResource>[];
  data: BranchResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function BranchTable({
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