import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWarehouseDocuments } from "../lib/warehouse-document.hook";
import TitleComponent from "@/components/TitleComponent";
import WarehouseDocumentActions from "./WarehouseDocumentActions";
import WarehouseDocumentTable from "./WarehouseDocumentTable";
import WarehouseDocumentOptions from "./WarehouseDocumentOptions";
import {
  deleteWarehouseDocument,
  confirmWarehouseDocument,
  cancelWarehouseDocument,
} from "../lib/warehouse-document.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { WarehouseDocumentColumns } from "./WarehouseDocumentColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { WAREHOUSE_DOCUMENT } from "../lib/warehouse-document.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const { MODEL, ICON } = WAREHOUSE_DOCUMENT;

export default function WarehouseDocumentPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [cancelId, setCancelId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = useWarehouseDocuments();
  const { data: warehouses } = useAllWarehouses();

  useEffect(() => {
    refetch();
  }, [
    page,
    search,
    per_page,
    selectedWarehouse,
    selectedType,
    selectedStatus,
    refetch,
  ]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWarehouseDocument(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGE(MODEL, "delete");
      errorToast(errorMessage);
    } finally {
      setDeleteId(null);
    }
  };

  const handleConfirm = async () => {
    if (!confirmId) return;
    try {
      await confirmWarehouseDocument(confirmId);
      await refetch();
      successToast("Documento confirmado exitosamente");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al confirmar el documento";
      errorToast(errorMessage);
    } finally {
      setConfirmId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await cancelWarehouseDocument(cancelId);
      await refetch();
      successToast("Documento cancelado exitosamente");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al cancelar el documento";
      errorToast(errorMessage);
    } finally {
      setCancelId(null);
    }
  };

  const handleCreateDocument = () => {
    navigate("/documentos-almacen/agregar");
  };

  const handleEditDocument = (id: number) => {
    navigate(`/documentos-almacen/actualizar/${id}`);
  };

  const handleViewDocument = (id: number) => {
    navigate(`/documentos-almacen/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural!}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <WarehouseDocumentActions onCreateDocument={handleCreateDocument} />
      </div>

      <WarehouseDocumentTable
        isLoading={isLoading}
        columns={WarehouseDocumentColumns({
          onEdit: handleEditDocument,
          onDelete: setDeleteId,
          onView: handleViewDocument,
          onConfirm: setConfirmId,
          onCancel: setCancelId,
        })}
        data={data || []}
      >
        {warehouses && (
          <WarehouseDocumentOptions
            search={search}
            setSearch={setSearch}
            selectedWarehouse={selectedWarehouse}
            setSelectedWarehouse={setSelectedWarehouse}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            warehouses={warehouses}
          />
        )}
      </WarehouseDocumentTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {confirmId !== null && (
        <AlertDialog open={true} onOpenChange={(open) => !open && setConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Documento</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro que desea confirmar este documento? Esta acción
                actualizará el inventario y no se podrá editar posteriormente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {cancelId !== null && (
        <AlertDialog open={true} onOpenChange={(open) => !open && setCancelId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Documento</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro que desea cancelar este documento? Esta acción
                revertirá los cambios en el inventario.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, mantener</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} className="bg-destructive">
                Sí, cancelar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
