import { useEffect, useState } from "react";
import { useVehicle } from "../lib/vehicle.hook";
import TitleComponent from "@/components/TitleComponent";
import VehicleActions from "./VehicleActions";
import VehicleTable from "./VehicleTable";
import VehicleOptions from "./VehicleOptions";
import { deleteVehicle } from "../lib/vehicle.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { VehicleColumns } from "./VehicleColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { VEHICLE } from "../lib/vehicle.interface";
import VehicleModal from "./VehicleModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = VEHICLE;

export default function VehiclePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useVehicle();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVehicle(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast((error.response.data.message ?? error.response.data.error), ERROR_MESSAGE(MODEL, "delete"));
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
        <VehicleActions />
      </div>

      <VehicleTable
        isLoading={isLoading}
        columns={VehicleColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <VehicleOptions search={search} setSearch={setSearch} />
      </VehicleTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {editId !== null && (
        <VehicleModal
          id={editId}
          open={true}
          onClose={() => setEditId(null)}
          title={MODEL.name}
          mode="update"
        />
      )}

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
