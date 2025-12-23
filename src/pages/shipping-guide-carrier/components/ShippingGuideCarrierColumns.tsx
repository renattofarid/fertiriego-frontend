import type { ColumnDef } from "@tanstack/react-table";
import type {
  ShippingGuideCarrierResource,
  ShippingGuideCarrierStatus,
} from "../lib/shipping-guide-carrier.interface";
import { SelectActions } from "@/components/SelectActions";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ShippingGuideCarrierColumnsProps {
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onChangeStatus: (id: number, status: ShippingGuideCarrierStatus) => void;
}

export const ShippingGuideCarrierColumns = ({
  onEdit,
  onView,
  onChangeStatus,
}: ShippingGuideCarrierColumnsProps): ColumnDef<ShippingGuideCarrierResource>[] => [
  {
    accessorKey: "full_guide_number",
    header: "N° Documento",
    cell: ({ getValue }) => (
      <Badge variant={"outline"} className="font-mono text-xs font-semibold">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "issue_date",
    header: "F. Emisión",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <span className="text-sm">
          {date.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "transfer_start_date",
    header: "F. Inicio Traslado",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <span className="text-sm">
          {date.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "carrier",
    header: "Transportista",
    cell: ({ row }) => {
      const carrier = row.original.carrier;
      return (
        <span className="text-sm text-wrap">
          {carrier?.business_name ||
            (carrier?.names ?? "") +
              " " +
              (carrier?.father_surname ?? "") +
              " " +
              (carrier?.mother_surname ?? "") ||
            "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "remittent",
    header: "Remitente",
    cell: ({ row }) => {
      const remittent = row.original.remittent;
      return (
        <span className="text-sm text-wrap">
          {remittent?.business_name ||
            (remittent?.names ?? "") +
              " " +
              (remittent?.father_surname ?? "") +
              " " +
              (remittent?.mother_surname ?? "") ||
            "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "driver",
    header: "Conductor",
    cell: ({ row }) => {
      const driver = row.original.driver;
      return (
        <span className="text-sm text-wrap">{driver?.full_name || "-"}</span>
      );
    },
  },
  {
    accessorKey: "vehicle",
    header: "Vehículo",
    cell: ({ row }) => {
      const vehicle = row.original.vehicle;
      return <span className="text-sm font-mono">{vehicle?.plate || "-"}</span>;
    },
  },
  {
    accessorKey: "total_weight",
    header: "Peso Total",
    cell: ({ row }) => {
      const weight = row.original.total_weight;
      return <span className="text-sm font-mono">{weight} KG</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const statusVariant = {
        EMITIDA: "secondary",
        EN_TRANSITO: "default",
        ENTREGADA: "default",
        ANULADA: "destructive",
      }[status] as "secondary" | "default" | "destructive";

      return <Badge variant={statusVariant}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <SelectActions>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onView(row.original.id)}>
            Ver Detalle
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChangeStatus(row.original.id, row.original.status)}
          >
            Cambiar Estado
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
            Editar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </SelectActions>
    ),
  },
];
