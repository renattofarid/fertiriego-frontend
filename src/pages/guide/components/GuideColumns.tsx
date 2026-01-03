import type { ColumnDef } from "@tanstack/react-table";
import type {
  Carrier,
  GuideResource,
  GuideStatus,
} from "../lib/guide.interface";
import { SelectActions } from "@/components/SelectActions";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface GuideColumnsProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  onChangeStatus: (id: number, status: GuideStatus) => void;
}

export const GuideColumns = ({
  onEdit,
  onDelete,
  onView,
  onChangeStatus,
}: GuideColumnsProps): ColumnDef<GuideResource>[] => [
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
    accessorKey: "transfer_date",
    header: "F. Traslado",
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
    accessorKey: "customer",
    header: "Cliente",
    cell: ({ row }) => {
      const sale = row.original.sale;
      return (
        <span className="text-sm text-wrap">
          {sale?.customer_fullname || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "modality",
    header: "Modalidad",
    cell: ({ getValue }) => {
      const modality = getValue() as string;
      return (
        <Badge variant="outline">
          {modality === "PUBLICO" ? "Transporte Público" : "Transporte Privado"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "carrier",
      header: "Transportista",
      cell: ({ getValue }) => {
        const carrier = getValue() as Carrier;
        return (
          <span className="text-sm text-wrap">
            {carrier?.names ?? carrier?.business_name}
        </span>
      );
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
        REGISTRADA: "secondary",
        ENVIADA: "default",
        ACEPTADA: "default",
        RECHAZADA: "destructive",
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
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => onDelete(row.original.id)}
            className="text-destructive"
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </SelectActions>
    ),
  },
];
