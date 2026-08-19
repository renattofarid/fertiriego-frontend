import { DataTable } from "@/components/DataTable.tsx";
import type { TagResource } from "../lib/product-tag.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<TagResource>[];
  data: TagResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TagTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
