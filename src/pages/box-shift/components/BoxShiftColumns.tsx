import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import type { BoxShiftResource } from "../lib/box-shift.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, DoorClosed } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

export const BoxShiftColumns = ({
  onDelete,
  onView,
  onClose,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  onClose: (id: number) => void;
}): ColumnDef<BoxShiftResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => (
      <span className="font-semibold">#{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "open_date",
    header: "Fecha Apertura",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    accessorKey: "started_amount",
    header: "Monto Inicial",
    cell: ({ getValue }) => (
      <span className="font-medium">
        {formatCurrency(getValue() as number)}
      </span>
    ),
  },
  {
    accessorKey: "expected_balance",
    header: "Balance Esperado",
    cell: ({ getValue }) => (
      <span className="font-medium text-blue-600">
        {formatCurrency(getValue() as number)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      const isOpen = status === "ABIERTO";
      return (
        <Badge
          variant={isOpen ? "default" : "secondary"}
          className="font-medium"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total_income",
    header: "Total Ingresos",
    cell: ({ getValue }) => (
      <span className="font-medium text-green-600">
        +{formatCurrency(getValue() as number)}
      </span>
    ),
  },
  {
    accessorKey: "total_outcome",
    header: "Total Egresos",
    cell: ({ getValue }) => (
      <span className="font-medium text-red-600">
        -{formatCurrency(getValue() as number)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const shift = row.original;
      const isOpen = shift.is_open;

      return (
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onView(shift.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalle
            </DropdownMenuItem>
            {isOpen && (
              <DropdownMenuItem onClick={() => onClose(shift.id)}>
                <DoorClosed className="mr-2 h-4 w-4" />
                Cerrar Turno
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => onDelete(shift.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
