"use client";

import { useState } from "react";
import { useSale } from "../lib/sale.hook";
import SaleTable from "./SaleTable";
import SaleActions from "./SaleActions";
import SaleOptions from "./SaleOptions";
import { getSaleColumns } from "./SaleColumns";
import { useSaleStore } from "../lib/sales.store";
import { useNavigate } from "react-router-dom";
import type { SaleResource } from "../lib/sale.interface";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";

export default function SalePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);

  const { data: sales, isLoading, refetch } = useSale({
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

  const handleViewDetails = (sale: SaleResource) => {
    navigate(`/ventas/detalle/${sale.id}`);
  };

  const handleManage = (sale: SaleResource) => {
    navigate(`/ventas/detalle/${sale.id}`);
  };

  const handleQuickPay = (sale: SaleResource) => {
    // TODO: Implementar pago rápido
    navigate(`/ventas/detalle/${sale.id}`);
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
        <div>
          <h1 className="text-2xl font-bold">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de ventas del sistema
          </p>
        </div>
        <SaleActions />
      </div>

      <SaleTable columns={columns} data={sales || []} isLoading={isLoading}>
        <SaleOptions search={search} setSearch={setSearch} />
      </SaleTable>

      <SimpleDeleteDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
        title="Eliminar Venta"
        message="¿Está seguro de que desea eliminar esta venta? Esta acción no se puede deshacer."
      />
    </div>
  );
}
