import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShippingGuideCarriers } from "../lib/shipping-guide-carrier.hook";
import TitleComponent from "@/components/TitleComponent";
import ShippingGuideCarrierActions from "./ShippingGuideCarrierActions";
import ShippingGuideCarrierTable from "./ShippingGuideCarrierTable";
import ShippingGuideCarrierOptions from "./ShippingGuideCarrierOptions";
import { useShippingGuideCarrierStore } from "../lib/shipping-guide-carrier.store";
import { ShippingGuideCarrierStatusChangeDialog } from "./ShippingGuideCarrierStatusChangeDialog";
import {
  successToast,
  errorToast,
} from "@/lib/core.function";
import { ShippingGuideCarrierColumns } from "./ShippingGuideCarrierColumns";
import DataTablePagination from "@/components/DataTablePagination";
import {
  SHIPPING_GUIDE_CARRIER,
  type ShippingGuideCarrierStatus,
} from "../lib/shipping-guide-carrier.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON, ROUTE } = SHIPPING_GUIDE_CARRIER;

export default function ShippingGuideCarrierPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [statusChangeData, setStatusChangeData] = useState<{
    id: number;
    currentStatus: ShippingGuideCarrierStatus;
  } | null>(null);

  const { data, meta, isLoading, refetch } = useShippingGuideCarriers({
    page,
    search,
    per_page,
  });
  const { changeStatus } = useShippingGuideCarrierStore();

  const handleEdit = (id: number) => {
    navigate(`${ROUTE}/actualizar/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`${ROUTE}/${id}`);
  };

  const handleChangeStatus = (
    id: number,
    currentStatus: ShippingGuideCarrierStatus
  ) => {
    setStatusChangeData({ id, currentStatus });
  };

  const confirmStatusChange = async (newStatus: ShippingGuideCarrierStatus) => {
    if (!statusChangeData) return;
    try {
      await changeStatus(statusChangeData.id, newStatus);
      await refetch();
      successToast(`Estado actualizado a ${newStatus}`);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al actualizar el estado",
        "Error al cambiar el estado"
      );
    } finally {
      setStatusChangeData(null);
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
        <ShippingGuideCarrierActions />
      </div>

      <ShippingGuideCarrierTable
        isLoading={isLoading}
        columns={ShippingGuideCarrierColumns({
          onEdit: handleEdit,
          onView: handleView,
          onChangeStatus: handleChangeStatus,
        })}
        data={data || []}
      >
        <ShippingGuideCarrierOptions search={search} setSearch={setSearch} />
      </ShippingGuideCarrierTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {statusChangeData !== null && (
        <ShippingGuideCarrierStatusChangeDialog
          open={true}
          onOpenChange={(open) => !open && setStatusChangeData(null)}
          onConfirm={confirmStatusChange}
          currentStatus={statusChangeData.currentStatus}
        />
      )}
    </div>
  );
}
