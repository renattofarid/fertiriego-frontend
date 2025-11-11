"use client";

import { useState } from "react";
import { useSale } from "../lib/sale.hook";
import SaleTable from "./SaleTable";
import SaleActions from "./SaleActions";
import SaleOptions from "./SaleOptions";
import { getSaleColumns } from "./SaleColumns";
import { useSaleStore } from "../lib/sales.store";
import { useNavigate } from "react-router-dom";
import { SALE, type SaleResource } from "../lib/sale.interface";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import SaleDetailSheet from "./SaleDetailSheet";
import { findSaleById } from "../lib/sale.actions";
import TitleComponent from "@/components/TitleComponent";

export default function SalePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [openDetailSheet, setOpenDetailSheet] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleResource | null>(null);

  const {
    data: sales,
    isLoading,
    refetch,
  } = useSale({
    search,
  });

  const { removeSale } = useSaleStore();

  const handleEdit = (sale: SaleResource) => {
    navigate(`/ventas/actualizar/${sale.id}`);
  };

  const handleDelete = (id: number) => {
    setSaleToDelete(id);
    setOpenDelete(true);
  };

  const handleViewDetails = async (sale: SaleResource) => {
    try {
      const response = await findSaleById(sale.id);
      setSelectedSale(response.data);
      setOpenDetailSheet(true);
    } catch (error) {
      console.error("Error al cargar detalles de la venta", error);
    }
  };

  const handleManage = (sale: SaleResource) => {
    navigate(`/ventas/gestionar/${sale.id}`);
  };

  const handleQuickPay = (sale: SaleResource) => {
    navigate(`/ventas/gestionar/${sale.id}`);
  };

  const confirmDelete = async () => {
    if (saleToDelete) {
      try {
        await removeSale(saleToDelete);
        refetch();
        setOpenDelete(false);
        setSaleToDelete(null);
      } catch (error) {
        console.error("Error al eliminar venta", error);
      }
    }
  };

  const { MODEL, ICON } = SALE;

  const columns = getSaleColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onViewDetails: handleViewDetails,
    onManage: handleManage,
    onQuickPay: handleQuickPay,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <TitleComponent
          title={MODEL.name}
          subtitle="Administrar todas las ventas registradas en el sistema"
          icon={ICON}
        />
        <SaleActions />
      </div>

      <SaleTable columns={columns} data={sales || []} isLoading={isLoading}>
        <SaleOptions search={search} setSearch={setSearch} />
      </SaleTable>

      <SimpleDeleteDialog
        open={openDelete}
        onOpenChange={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />

      <SaleDetailSheet
        sale={selectedSale}
        open={openDetailSheet}
        onClose={() => {
          setOpenDetailSheet(false);
          setSelectedSale(null);
        }}
      />
    </div>
  );
}
