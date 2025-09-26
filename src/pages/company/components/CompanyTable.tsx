import { DataTable } from "@/components/DataTable.tsx";
import type { CompanyResource } from "../lib/company.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<CompanyResource>[];
  data: CompanyResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CompanyTable({
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