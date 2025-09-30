import { DataTable } from "@/components/DataTable.tsx";
import type { PersonResource } from "../lib/person.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<PersonResource>[];
  data: PersonResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PersonTable({
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
        initialColumnVisibility={{
          email: false,
          type_person: false,
          birth_date: false,
          address: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
