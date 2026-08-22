import { DataTable } from "@/components/DataTable.tsx";
import type { MenuGroupResource } from "../lib/menuGroup.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<MenuGroupResource>[];
  data: MenuGroupResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function MenuGroupTable({
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
