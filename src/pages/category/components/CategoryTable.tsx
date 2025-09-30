import { DataTable } from "@/components/DataTable.tsx";
import type { CategoryResource } from "../lib/category.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<CategoryResource>[];
  data: CategoryResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CategoryTable({
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