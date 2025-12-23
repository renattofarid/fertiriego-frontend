import type { ColumnDef } from "@tanstack/react-table";
import type { VehicleResource } from "../lib/vehicle.interface";
import { DataTable } from "@/components/DataTable";

interface VehicleTableProps {
  data: VehicleResource[];
  columns: ColumnDef<VehicleResource, any>[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function VehicleTable({
  data,
  columns,
  isLoading,
  children,
}: VehicleTableProps) {
  return (
    <DataTable data={data} columns={columns} isLoading={isLoading}>
      {children}
    </DataTable>
  );
}
