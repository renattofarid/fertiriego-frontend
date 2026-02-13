import type { ColumnDef } from "@tanstack/react-table";
import type { DebitNoteResource } from "../lib/debit-note.interface";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/components/SimpleDeleteDialog";
import { ButtonAction } from "@/components/ButtonAction";
import ExportButtons from "@/components/ExportButtons";
import { ColumnActions } from "@/components/SelectActions";

interface DebitNoteColumnsProps {
  onDelete: (id: number) => void;
}

export const DebitNoteColumns = ({
  onDelete,
}: DebitNoteColumnsProps): ColumnDef<DebitNoteResource>[] => {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "sale",
      header: "Venta",
      cell: ({ getValue }) => {
        const sale = getValue() as DebitNoteResource["sale"];
        return sale.full_document_number;
      },
    },
    {
      accessorKey: "customer.names",
      header: "Cliente",
      cell: ({ row }) => {
        return row.original.customer.names;
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
      accessorKey: "motive.name",
      header: "Motivo",
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
        const amount = Number(getValue());
        return `S/ ${amount.toFixed(2)}`;
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
        const debitNote = row.original;

        return (
          <ColumnActions>
            <ExportButtons
              pdfEndpoint={`/debit-notes/${row.original.id}/pdf`}
              pdfFileName={`nota-debito-${row.original.document_number}.pdf`}
              variant="separate"
            />
            <ButtonAction
              icon={Pencil}
              tooltip="Editar"
              onClick={() =>
                navigate(`/notas-debito/actualizar/${debitNote.id}`)
              }
            />
            <DeleteButton onClick={() => onDelete(row.original.id)} />
          </ColumnActions>
        );
      },
    },
  ];
};
