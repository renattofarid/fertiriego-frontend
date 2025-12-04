"use client";

import { useState } from "react";
import { useOrder } from "../lib/order.hook";
import OrderTable from "./OrderTable";
import { getOrderColumns } from "./OrderColumns";
import { useOrderStore } from "../lib/order.store";
import { useNavigate } from "react-router-dom";
import { ORDER, type OrderResource } from "../lib/order.interface";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import TitleComponent from "@/components/TitleComponent";
import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function OrderPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

  const {
    data: orders,
    isLoading,
    refetch,
  } = useOrder({
    search,
  });

  const { removeOrder } = useOrderStore();

  const handleEdit = (order: OrderResource) => {
    navigate(`/pedidos/actualizar/${order.id}`);
  };

  const handleDelete = (id: number) => {
    setOrderToDelete(id);
    setOpenDelete(true);
  };

  const handleViewDetails = async (order: OrderResource) => {
    navigate(`/pedidos/${order.id}`);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      try {
        await removeOrder(orderToDelete);
        refetch();
        setOpenDelete(false);
        setOrderToDelete(null);
      } catch (error) {
        console.error("Error al eliminar pedido", error);
      }
    }
  };

  const { MODEL, ICON } = ORDER;

  const columns = getOrderColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onViewDetails: handleViewDetails,
  });

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <TitleComponent
          title={MODEL.name}
          subtitle="Administrar todos los pedidos registrados en el sistema"
          icon={ICON}
        />
        <Button onClick={() => navigate("/pedidos/agregar")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pedido
        </Button>
      </div>

      <OrderTable columns={columns} data={orders || []} isLoading={isLoading}>
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Buscar pedidos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </OrderTable>

      <SimpleDeleteDialog
        open={openDelete}
        onOpenChange={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />
    </PageWrapper>
  );
}
