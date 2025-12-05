import { DataTable } from "@/components/DataTable.tsx";
import type { UserBoxAssignmentResource } from "../lib/userboxassignment.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<UserBoxAssignmentResource>[];
  data: UserBoxAssignmentResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function UserBoxAssignmentTable({
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
