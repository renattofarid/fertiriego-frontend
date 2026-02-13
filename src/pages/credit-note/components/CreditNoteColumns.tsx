import type { ColumnDef } from "@tanstack/react-table";
import type { CreditNoteResource } from "../lib/credit-note.interface";
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
      accessorKey: "sale",
      header: "Venta",
      cell: ({ getValue }) => {
        const sale = getValue() as CreditNoteResource["sale"];
        return sale.serie + "-" + sale.numero;
      },
    },
    {
      accessorKey: "sale.customer_fullname",
      header: "Cliente",
      cell: ({ row }) => {
        return row.original.sale.customer.full_name;
      },
    },
    {
      accessorKey: "issue_date",
      header: "Fecha de Emisión",
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return date.toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      accessorKey: "credit_note_type",
      header: "Tipo",
      cell: ({ getValue }) => {
        const type = getValue() as string;
        const typeLabels: Record<string, string> = {
          DEVOLUCION: "Devolución",
          DESCUENTO: "Descuento",
          ANULACION: "Anulación",
          BONIFICACION: "Bonificación",
        };
        return typeLabels[type] || type;
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
                ? "default"
                : status === "PENDIENTE"
                  ? "secondary"
                  : "destructive"
            }
          >
            {status}
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
