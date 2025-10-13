"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseOrderForm } from "./PurchaseOrderForm";
import { type PurchaseOrderSchema } from "../lib/purchase-order.schema";
import { usePurchaseOrderStore } from "../lib/purchase-order.store";
import { useAllSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import {
  PURCHASE_ORDER,
  type PurchaseOrderResource,
} from "../lib/purchase-order.interface";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PurchaseOrderDetailModal } from "./PurchaseOrderDetailModal";
import { PurchaseOrderDetailTable } from "./PurchaseOrderDetailTable";
import { usePurchaseOrderDetailStore } from "../lib/purchase-order-detail.store";

const { MODEL } = PURCHASE_ORDER;

export default function PurchaseOrderEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDetailId, setEditingDetailId] = useState<number | null>(null);

  const { data: suppliers, isLoading: suppliersLoading } = useAllSuppliers();
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();

  const { updatePurchaseOrder, fetchPurchaseOrder, purchaseOrder, isFinding } =
    usePurchaseOrderStore();

  const { fetchDetails, details } = usePurchaseOrderDetailStore();

  const isLoading =
    suppliersLoading || warehousesLoading || productsLoading || isFinding;

  useEffect(() => {
    if (!id) {
      navigate("/ordenes-compra");
      return;
    }

    fetchPurchaseOrder(Number(id));
  }, [id, navigate, fetchPurchaseOrder]);

  useEffect(() => {
    if (id) {
      fetchDetails(Number(id));
    }
  }, [id, fetchDetails]);

  const mapPurchaseOrderToForm = (
    data: PurchaseOrderResource
  ): Partial<PurchaseOrderSchema> => ({
    supplier_id: data.supplier_id?.toString(),
    warehouse_id: data.warehouse_id?.toString(),
    order_number: data.order_number,
    issue_date: data.issue_date,
    expected_date: data.expected_date,
    observations: data.observations,
    details: [],
  });

  const handleSubmit = async (data: Partial<PurchaseOrderSchema>) => {
    if (!purchaseOrder || !id) return;

    setIsSubmitting(true);
    try {
      await updatePurchaseOrder(Number(id), data);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      navigate("/ordenes-compra");
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || ERROR_MESSAGE(MODEL, "update")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDetail = () => {
    setEditingDetailId(null);
    setIsModalOpen(true);
  };

  const handleEditDetail = (detailId: number) => {
    setEditingDetailId(detailId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingDetailId(null);
    if (id) {
      fetchDetails(Number(id));
      fetchPurchaseOrder(Number(id));
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to="/ordenes-compra" />
            <TitleFormComponent title={MODEL.name} mode="edit" />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!purchaseOrder) {
    return (
      <FormWrapper>
        <div className="flex items-center gap-4 mb-6">
          <BackButton to="/ordenes-compra" />
          <TitleFormComponent title={MODEL.name} mode="edit" />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Orden de compra no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/ordenes-compra" />
          <TitleFormComponent title={MODEL.name} mode="edit" />
        </div>
      </div>

      <div className="space-y-6">
        {suppliers &&
          suppliers.length > 0 &&
          warehouses &&
          warehouses.length > 0 &&
          products &&
          products.length > 0 && (
            <PurchaseOrderForm
              defaultValues={mapPurchaseOrderToForm(purchaseOrder)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              mode="update"
              suppliers={suppliers}
              warehouses={warehouses}
              products={products}
              purchaseOrder={purchaseOrder}
              onCancel={() => navigate("/ordenes-compra")}
            />
          )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Detalles de la Orden</CardTitle>
            <Button onClick={handleAddDetail}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Detalle
            </Button>
          </CardHeader>
          <CardContent>
            {products && (
              <PurchaseOrderDetailTable
                details={details || []}
                products={products}
                onEdit={handleEditDetail}
                onRefresh={() => id && fetchDetails(Number(id))}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {isModalOpen && products && (
        <PurchaseOrderDetailModal
          open={isModalOpen}
          onClose={handleModalClose}
          purchaseOrderId={Number(id)}
          products={products}
          detailId={editingDetailId}
        />
      )}
    </FormWrapper>
  );
}
