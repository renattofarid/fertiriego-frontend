import { useState } from "react";
import type { PersonResource } from "../lib/person.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/components/ButtonAction";
import { ColumnActions } from "@/components/SelectActions";
import { Pencil, MapPin } from "lucide-react";
import { DeleteButton } from "@/components/SimpleDeleteDialog";
import { PersonAddressSheet } from "./PersonAddressSheet";

function AddressButton({ person }: { person: PersonResource }) {
  const [open, setOpen] = useState(false);
  const displayName =
    person.type_document === "RUC"
      ? person.business_name
      : `${person.names} ${person.father_surname} ${person.mother_surname}`.trim();

  return (
    <>
      <ButtonAction
        icon={MapPin}
        tooltip="Direcciones"
        onClick={() => setOpen(true)}
      />
      <PersonAddressSheet
        personId={person.id}
        personName={displayName}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export const PersonColumns = ({
  onEdit,
  onDelete,
}: // onManageRoles,
{
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  // onManageRoles: (person: PersonResource) => void;
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
                  : (person.business_name ??
                    `${person.names} ${person.father_surname} ${person.mother_surname}`)}
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
      const id = row.original.id;

      return (
        <ColumnActions>
          <AddressButton person={row.original} />
          <ButtonAction
            icon={Pencil}
            tooltip="Editar"
            onClick={() => onEdit(id)}
          />
          <DeleteButton onClick={() => onDelete(id)} />
        </ColumnActions>
      );
    },
  },
];
