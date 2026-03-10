import type { ColumnDef } from "@tanstack/react-table";
import type { CreditNoteResource } from "../lib/credit-note.interface";
import { parse } from "date-fns";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ColumnActions } from "@/components/SelectActions";
import ExportButtons from "@/components/ExportButtons";
import { ButtonAction } from "@/components/ButtonAction";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

interface CreditNoteColumnsProps {
  onDelete: (id: number) => void;
}

export const CreditNoteColumns = ({
  onDelete,
}: CreditNoteColumnsProps): ColumnDef<CreditNoteResource>[] => {
  const navigate = useNavigate();

  return [
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
      accessorKey: "sequential_number",
      header: "Documento",
      cell: ({ row }) => (
        <span className="font-mono font-semibold">
          {row.original.full_document_number}
        </span>
      ),
    },
    {
      accessorKey: "sale",
      header: "Venta",
      cell: ({ getValue }) => {
        const sale = getValue() as CreditNoteResource["sale"];
        return (
          <div className="flex flex-col">
            <span className="font-medium text-xs text-muted-foreground">
              {sale.document_type}
            </span>
            <span className="font-mono font-semibold">
              {sale.sequential_number}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "customer.fullname",
      header: "Cliente",
      cell: ({ row }) => {
        return row.original.customer.full_name;
      },
    },
    {
      accessorKey: "issue_date",
      header: "Fecha de Emisión",
      cell: ({ getValue }) => {
        const date = parse(getValue() as string, "yyyy-MM-dd", new Date());
        return date.toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      accessorKey: "reason",
      header: "Motivo",
      cell: ({ getValue }) => {
        return (
          <span className="max-w-[200px] truncate">{getValue() as string}</span>
        );
      },
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ getValue }) => {
        const amount = Number(getValue() as string);
        return `S/ ${amount.toFixed(2)}`;
      },
    },
    {
      accessorKey: "affects_stock",
      header: "Afecta Stock",
      cell: ({ getValue }) => {
        const affects = getValue() as boolean;
        return (
          <Badge variant={affects ? "default" : "secondary"}>
            {affects ? "Sí" : "No"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <Badge
            variant={
              status === "PROCESADO"
                ? "green"
                : status === "PENDIENTE"
                  ? "amber"
                  : status === "EMITIDA"
                    ? "blue"
                    : "gray"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "sunat_status",
      header: "Estado SUNAT",
      cell: ({ getValue }) => {
        const sunatStatus = getValue() as string;
        const config: Record<
          string,
          {
            label: string;
            variant: "green" | "red" | "amber" | "blue" | "gray";
          }
        > = {
          ACEPTADO: { label: "Aceptado", variant: "green" },
          RECHAZADO: { label: "Rechazado", variant: "red" },
          PENDIENTE: { label: "Pendiente", variant: "amber" },
          ENVIADO: { label: "ENVIADO", variant: "green" },
          BAJA: { label: "Baja", variant: "gray" },
        };
        const matched = config[sunatStatus?.toUpperCase()];
        return (
          <Badge variant={matched?.variant ?? "gray"}>
            {matched?.label ?? (sunatStatus || "—")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Fecha de Creación",
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return date.toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const creditNote = row.original;

        return (
          <ColumnActions>
            <ExportButtons
              pdfEndpoint={`/credit-notes/${row.original.id}/pdf`}
              pdfFileName={`nota-credito-${row.original.document_number}.pdf`}
              variant="separate"
            />
            <ButtonAction
              icon={Pencil}
              tooltip="Editar"
              onClick={() =>
                navigate(`/notas-credito/actualizar/${creditNote.id}`)
              }
            />
            <DeleteButton onClick={() => onDelete(row.original.id)} />
          </ColumnActions>
        );
      },
    },
  ];
};
