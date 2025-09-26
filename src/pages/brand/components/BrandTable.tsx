import { DataTable } from "@/components/DataTable.tsx";
import type { BrandResource } from "../lib/brand.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<BrandResource>[];
  data: BrandResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function BrandTable({
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