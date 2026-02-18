import type { ColumnDef } from "@tanstack/react-table";
import type {
  Carrier,
  GuideResource,
  GuideStatus,
} from "../lib/guide.interface";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/components/ButtonAction";
import { Eye, Pencil, RefreshCcw, BanknoteArrowUp } from "lucide-react";
import { DeleteButton } from "@/components/SimpleDeleteDialog";
import { ColumnActions } from "@/components/SelectActions";
import ExportButtons from "@/components/ExportButtons";

interface GuideColumnsProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  onChangeStatus: (id: number, status: GuideStatus) => void;
  onGenerateSale: (guide: GuideResource) => void;
}

export const GuideColumns = ({
  onEdit,
  onDelete,
  onView,
  onChangeStatus,
  onGenerateSale,
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
    accessorKey: "user.name",
    header: "Usuario",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <ColumnActions>
        <ExportButtons
          pdfEndpoint={`/shipping-guide-remit/${row.original.id}/pdf`}
          pdfFileName={`guia-${row.original.full_guide_number}.pdf`}
          variant="separate"
        />
        <ButtonAction
          icon={Eye}
          tooltip="Ver Detalle"
          onClick={() => onView(row.original.id)}
        />
        <ButtonAction
          icon={BanknoteArrowUp}
          tooltip="Generar Venta"
          onClick={() => onGenerateSale(row.original)}
          color="primary"
        />
        <ButtonAction
          icon={RefreshCcw}
          tooltip="Cambiar Estado"
          onClick={() => onChangeStatus(row.original.id, row.original.status)}
        />
        <ButtonAction
          icon={Pencil}
          tooltip="Editar"
          onClick={() => onEdit(row.original.id)}
        />
        <DeleteButton onClick={() => onDelete(row.original.id)} />
      </ColumnActions>
    ),
  },
];
