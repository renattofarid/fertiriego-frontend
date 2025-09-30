import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import type { PersonResource } from "../lib/person.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    accessorKey: "full_name",
    header: "Nombre Completo",
    cell: ({ row }) => {
      const person = row.original;
      const typeDocument = person?.type_document;
      return (
        <div>
          <div className="font-medium">
            {typeDocument === "RUC"
              ? person.business_name
              : typeDocument === "PASAPORTE"
              ? person.names
              : typeDocument === "CE"
              ? person.names
              : `${person.names} ${person.father_surname} ${person.mother_surname}`}
          </div>
          <div className="text-sm text-muted-foreground">
            {typeDocument}: {person.number_document}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type_person",
    header: "Tipo",
    cell: ({ row }) => {
      const typePersona = row.original.type_person ?? "NATURAL";
      return (
        <Badge variant={typePersona === "NATURAL" ? "default" : "secondary"}>
          {typePersona}
        </Badge>
      );
    },
  },
  {
    accessorKey: "type_document",
    header: "Tipo Documento",
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue() as string}</Badge>
    ),
  },
  {
    accessorKey: "number_document",
    header: "N° Doc.",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.original.roles;
      const firstTwoRoles = roles.slice(0, 2);
      const remainingRoles = roles.slice(2);

      return (
        <div className="flex gap-1 flex-wrap">
          {firstTwoRoles.map((role, index) => (
            <Badge key={index} variant="default">
              {role.name}
            </Badge>
          ))}
          {remainingRoles.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="default">+{remainingRoles.length}</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{remainingRoles.map((r) => r.name).join(", ")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Dirección",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "birth_date",
    header: "Fecha de Nacimiento",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  // {
  //   accessorKey: "person.status",
  //   header: "Estado",
  //   cell: ({ row }) => {
  //     const status = row.original. ?? "Desconocido";
  //     return (
  //       <Badge variant={status === "Activo" ? "default" : "destructive"}>
  //         {status}
  //       </Badge>
  //     );
  //   },
  // },
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
