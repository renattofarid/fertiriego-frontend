import type { ColumnDef } from "@tanstack/react-table";
import type { ShippingGuideCarrierResource } from "../lib/shipping-guide-carrier.interface";
import { DataTable } from "@/components/DataTable";

interface ShippingGuideCarrierTableProps {
  columns: ColumnDef<ShippingGuideCarrierResource>[];
  data: ShippingGuideCarrierResource[];
  isLoading: boolean;
  children?: React.ReactNode;
}

export default function ShippingGuideCarrierTable({
  columns,
  data,
  isLoading,
  children,
}: ShippingGuideCarrierTableProps) {
  return (
    <DataTable columns={columns} data={data} isLoading={isLoading}>
      {children}
    </DataTable>
  );
}
