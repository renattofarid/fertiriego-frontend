import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClients } from "../lib/client.hook";
import TitleComponent from "@/components/TitleComponent";
import ClientActions from "./ClientActions";
import PersonTable from "@/pages/person/components/PersonTable";
import PersonOptions from "@/pages/person/components/PersonOptions";
import { deletePerson } from "@/pages/person/lib/person.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { PersonColumns } from "@/pages/person/components/PersonColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { CLIENT, CLIENT_ROLE_ID } from "../lib/client.interface";
import { PersonRoleAssignment } from "@/pages/person/components/PersonRoleAssignment";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import type { PersonResource } from "@/pages/person/lib/person.interface";

const { MODEL, ICON } = CLIENT;

export default function ClientPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [roleAssignmentPerson, setRoleAssignmentPerson] =
    useState<PersonResource | null>(null);
  const { data, refetch, isLoading } = useClients({
    search,
    page,
    per_page,
  });

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePerson(deleteId, CLIENT_ROLE_ID);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error.response.data.message ?? error.response.data.error,
        ERROR_MESSAGE(MODEL, "delete"),
      );
    } finally {
      setDeleteId(null);
    }
  };

  // const handleManageRoles = (person: PersonResource) => {
  //   setRoleAssignmentPerson(person);
  // };

  const handleCloseRoleAssignment = () => {
    setRoleAssignmentPerson(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <ClientActions />
      </div>

      <PersonTable
        isLoading={isLoading}
        columns={PersonColumns({
          onEdit: (person) => navigate(`/clientes/editar/${person}`),
          onDelete: setDeleteId,
          // onManageRoles: handleManageRoles,
        })}
        data={data?.data || []}
      >
        <PersonOptions search={search} setSearch={setSearch} />
      </PersonTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />

      {/* Role Assignment Modal */}
      {roleAssignmentPerson && (
        <PersonRoleAssignment
          personId={roleAssignmentPerson.id}
          personName={roleAssignmentPerson.names}
          open={!!roleAssignmentPerson}
          onClose={handleCloseRoleAssignment}
        />
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          // title={`Eliminar ${MODEL.name}`}
          // description={`¿Está seguro de que desea eliminar este ${MODEL.name.toLowerCase()}? Esta acción no se puede deshacer.`}
        />
      )}
    </div>
  );
}
