import { useEffect, useState } from "react";
import { usePersons } from "../lib/person.hook";
import TitleComponent from "@/components/TitleComponent";
import PersonActions from "./PersonActions";
import PersonTable from "./PersonTable";
import PersonOptions from "./PersonOptions";
import { deletePerson } from "../lib/person.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { PersonColumns } from "./PersonColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PERSON } from "../lib/person.interface";
import { PersonRoleAssignment } from "./PersonRoleAssignment";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import type { PersonResource } from "../lib/person.interface";

const { MODEL, ICON } = PERSON;

export default function PersonPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  // const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [roleAssignmentPerson, setRoleAssignmentPerson] = useState<PersonResource | null>(null);
  const { data, meta, isLoading, refetch } = usePersons();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePerson(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  const handleManageRoles = (person: PersonResource) => {
    setRoleAssignmentPerson(person);
  };

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
        <PersonActions />
      </div>

      <PersonTable
        isLoading={isLoading}
        columns={PersonColumns({
          onEdit: () => console.log("TODO: Edit person"),
          onDelete: setDeleteId,
          onManageRoles: handleManageRoles,
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
            <DialogTitle>Asignación de Roles</DialogTitle>
          </DialogHeader>
          {roleAssignmentPerson && (
            <PersonRoleAssignment
              personId={roleAssignmentPerson.id}
              personName={roleAssignmentPerson.person.full_name}
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
        />
      )}
    </div>
  );
}