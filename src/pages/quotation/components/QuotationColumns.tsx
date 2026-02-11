import { Badge } from "@/components/ui/badge";
import { Eye, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { QuotationResource } from "../lib/quotation.interface";
import ExportButtons from "@/components/ExportButtons";
import { ButtonAction } from "@/components/ButtonAction";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

interface QuotationColumnsProps {
  onEdit: (quotation: QuotationResource) => void;
  onDelete: (id: number) => void;
  onViewDetails: (quotation: QuotationResource) => void;
}

export const getQuotationColumns = ({
  onEdit,
  onDelete,
  onViewDetails,
}: QuotationColumnsProps): ColumnDef<QuotationResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        #{row.original.id}
      </Badge>
    ),
  },
  {
    accessorKey: "quotation_number",
    header: "N° Cotización",
    cell: ({ row }) => (
      <span className="font-mono font-semibold">
        {row.original.quotation_number}
      </span>
    ),
  },
  {
    accessorKey: "customer_fullname",
    header: "Cliente",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        {row.original?.customer?.business_name ||
          row.original?.customer?.full_name}
      </div>
    ),
  },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ row }) => <span>{row.original?.warehouse?.name || "N/A"}</span>,
  },
  {
    accessorKey: "fecha_emision",
    header: "Fecha Emisión",
    cell: ({ row }) => {
      const date = new Date(row.original.fecha_emision);
      return (
        <Badge variant="outline">
          {date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </Badge>
      );
    },
  },
  {
    accessorKey: "payment_type",
    header: "Tipo Pago",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.payment_type === "CONTADO" ? "default" : "secondary"
        }
      >
        {row.original.payment_type}
      </Badge>
    ),
  },
  {
    accessorKey: "days",
    header: "Días",
    cell: ({ row }) => {
      if (row.original.payment_type === "CREDITO" && row.original.days) {
        return <span>{row.original.days} días</span>;
      }
      return <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "currency",
    header: "Moneda",
    cell: ({ row }) => <Badge variant="outline">{row.original.currency}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const getStatusVariant = (
        status: string,
      ): "default" | "green" | "destructive" | "secondary" => {
        switch (status) {
          case "Pendiente":
            return "default";
          case "Aprobado":
            return "green";
          case "Rechazado":
            return "destructive";
          case "Vencido":
            return "secondary";
          default:
            return "default";
        }
      };

      return (
        <Badge variant={getStatusVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "delivery_time",
    header: "Tiempo Entrega",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.delivery_time}</span>
    ),
  },
  {
    accessorKey: "validity_time",
    header: "Vigencia",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.validity_time}</span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <ExportButtons
          pdfEndpoint={`/quotation/pdf/${row.original.id}`}
          pdfFileName={`cotizacion-${row.original.quotation_number}.pdf`}
          variant="separate"
        />
        <ButtonAction
          icon={Eye}
          onClick={() => onViewDetails(row.original)}
          tooltip="Ver Detalles"
        />
        <ButtonAction
          icon={Pencil}
          onClick={() => onEdit(row.original)}
          tooltip="Editar"
        />
        <DeleteButton onClick={() => onDelete(row.original.id)} />
      </div>
    ),
  },
];
