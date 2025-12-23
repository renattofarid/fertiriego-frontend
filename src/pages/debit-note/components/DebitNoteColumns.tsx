import type { ColumnDef } from "@tanstack/react-table";
import type { DebitNoteResource } from "../lib/debit-note.interface";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/notas-debito/actualizar/${debitNote.id}`)
                }
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(debitNote.id)}>
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
