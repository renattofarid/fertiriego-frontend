import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDrivers } from "../lib/driver.hook";
import TitleComponent from "@/components/TitleComponent";
import DriverActions from "./DriverActions";
import PersonTable from "@/pages/person/components/PersonTable";
import PersonOptions from "@/pages/person/components/PersonOptions";
import { deletePerson } from "@/pages/person/lib/person.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { PersonColumns } from "@/pages/person/components/PersonColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { DRIVER, DRIVER_ROLE_ID } from "../lib/driver.interface";
import { PersonRoleAssignment } from "@/pages/person/components/PersonRoleAssignment";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import type { PersonResource } from "@/pages/person/lib/person.interface";

const { MODEL, ICON } = DRIVER;

export default function DriverPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [roleAssignmentPerson, setRoleAssignmentPerson] =
    useState<PersonResource | null>(null);
  const { data, meta, isLoading, refetch } = useDrivers();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePerson(deleteId, DRIVER_ROLE_ID);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast((error.response.data.message ?? error.response.data.error), ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  // const handleManageRoles = (person: PersonResource) => {
  //   setRoleAssignmentPerson(person);
  // };

  const handleCloseRoleAssignment = () => {
    setRoleAssignmentPerson(null);
    refetch(); // Refresh the data to show updated roles
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <DriverActions />
      </div>

      <PersonTable
        isLoading={isLoading}
        columns={PersonColumns({
          onEdit: (person) => navigate(`/conductores/editar/${person}`),
          onDelete: setDeleteId,
          // onManageRoles: handleManageRoles,
        })}
        data={data || []}
      >
        <PersonOptions search={search} setSearch={setSearch} />
      </PersonTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {/* Role Assignment Modal */}
      <Dialog
        open={!!roleAssignmentPerson}
        onOpenChange={(open) => !open && handleCloseRoleAssignment()}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Asignación de Roles - {MODEL.name}</DialogTitle>
          </DialogHeader>
          {roleAssignmentPerson && (
            <PersonRoleAssignment
              open={!!roleAssignmentPerson}
              personId={roleAssignmentPerson.id}
              personName={roleAssignmentPerson.names}
              onClose={handleCloseRoleAssignment}
            />
          )}
        </DialogContent>
      </Dialog>

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
