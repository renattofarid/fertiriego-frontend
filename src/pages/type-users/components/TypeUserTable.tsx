import { DataTable } from "@/components/DataTable.tsx";
import type { TypeUserResource } from "../lib/typeUser.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<TypeUserResource>[];
  data: TypeUserResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TypeUserTable({
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
