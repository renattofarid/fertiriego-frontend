import type { BoxShiftResource } from "../lib/box-shift.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Eye, DoorClosed } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { ButtonAction } from "@/components/ButtonAction";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

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
        <div className="flex items-center gap-2">
          <ButtonAction icon={Eye} onClick={() => onView(shift.id)} />
          {isOpen && (
            <ButtonAction icon={DoorClosed} onClick={() => onClose(shift.id)} />
          )}
          <DeleteButton onClick={() => onDelete(shift.id)} />
        </div>
      );
    },
  },
];
