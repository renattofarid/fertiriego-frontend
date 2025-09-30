import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import type { PersonResource } from "../lib/person.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const PersonColumns = ({
  onEdit,
  onDelete,
  onManageRoles,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onManageRoles: (person: PersonResource) => void;
}): ColumnDef<PersonResource>[] => [
  {
    accessorKey: "person.full_name",
    header: "Nombre Completo",
    cell: ({ row }) => {
      const person = row.original.person;
      return (
        <div>
          <span className="font-semibold">{person?.full_name ?? ""}</span>
          <div className="text-sm text-muted-foreground">
            {person?.type_document ?? ""}: {person?.number_document ?? ""}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "username",
    header: "Usuario",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="font-mono">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "person.type_person",
    header: "Tipo",
    cell: ({ row }) => {
      const typePersona = row.original.person?.type_person ?? "NATURAL";
      return (
        <Badge variant={typePersona === "NATURAL" ? "default" : "secondary"}>
          {typePersona}
        </Badge>
      );
    },
  },
  {
    accessorKey: "person.email",
    header: "Email",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "person.phone",
    header: "Teléfono",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "rol_name",
    header: "Rol Principal",
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue() as string}</Badge>
    ),
  },
  {
    accessorKey: "person.status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.person?.status ?? "Desconocido";
      return (
        <Badge variant={status === "Activo" ? "default" : "destructive"}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const person = row.original;

      return (
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onManageRoles(person)}>
              Gestionar Roles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(person.id)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(person.id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
