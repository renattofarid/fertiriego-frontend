import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBoxShift } from "../lib/box-shift.hook";
import TitleComponent from "@/components/TitleComponent";
import BoxShiftActions from "./BoxShiftActions";
import BoxShiftTable from "./BoxShiftTable";
import BoxShiftOptions from "./BoxShiftOptions";
import { deleteBoxShift } from "../lib/box-shift.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { BoxShiftColumns } from "./BoxShiftColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { BOX_SHIFT } from "../lib/box-shift.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import BoxShiftCloseModal from "./BoxShiftCloseModal";

const { MODEL, ICON } = BOX_SHIFT;

export default function BoxShiftPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [closeShiftId, setCloseShiftId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = useBoxShift({
    page,
    per_page,
    search,
  });

  useEffect(() => {
    refetch({
      page,
      per_page,
      search,
    });
  }, [page, search, per_page, refetch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBoxShift(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? (error.response.data.message ?? error.response.data.error) : ERROR_MESSAGE(MODEL, "delete");
      errorToast(errorMessage);
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`${BOX_SHIFT.ROUTE}/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`${BOX_SHIFT.ROUTE}/${id}`);
  };

  const handleClose = (id: number) => {
    setCloseShiftId(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <BoxShiftActions />
      </div>

      <BoxShiftTable
        columns={BoxShiftColumns({
          onEdit: handleEdit,
          onDelete: setDeleteId,
          onView: handleView,
          onClose: handleClose,
        })}
        data={data || []}
        isLoading={isLoading}
      >
        <BoxShiftOptions search={search} setSearch={setSearch} />
      </BoxShiftTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        totalData={meta?.total || 0}
      />

      {deleteId && (
        <SimpleDeleteDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          title={MODEL.TITLES?.delete?.title}
          description={MODEL.TITLES?.delete?.subtitle}
        />
      )}

      {closeShiftId && (
        <BoxShiftCloseModal
          open={!!closeShiftId}
          onOpenChange={(open) => !open && setCloseShiftId(null)}
          shiftId={closeShiftId}
          onSuccess={() => {
            setCloseShiftId(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
