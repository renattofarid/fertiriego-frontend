import { useEffect, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import PensionSystemActions from "./PensionSystemActions";
import PensionSystemModal from "./PensionSystemModal";
import { PensionSystemColumns } from "./PensionSystemColumns";
import { usePensionSystems } from "../lib/pension-system.hook";
import { deletePensionSystem } from "../lib/pension-system.actions";
import {
  PENSION_SYSTEM,
  type PensionSystemResource,
} from "../lib/pension-system.interface";

const { MODEL, ICON } = PENSION_SYSTEM;

export default function PensionSystemPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<PensionSystemResource | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, refetch } = usePensionSystems({
    search,
    page,
    per_page,
  });

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const closeModal = () => {
    setOpenModal(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePensionSystem(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          ERROR_MESSAGE(MODEL, "delete"),
      );
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <PensionSystemActions onAdd={() => setOpenModal(true)} />
      </div>

      <DataTable
        columns={PensionSystemColumns({
          onEdit: (item) => {
            setEditing(item);
            setOpenModal(true);
          },
          onDelete: setDeleteId,
        })}
        data={data?.data || []}
        isLoading={isLoading}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o tipo..."
        />
      </DataTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />

      <PensionSystemModal
        open={openModal}
        item={editing}
        onClose={closeModal}
        onSuccess={() => {
          closeModal();
          refetch();
        }}
      />

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
