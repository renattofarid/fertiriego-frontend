"use client";

import { useForm } from "react-hook-form";
import { GeneralModal } from "@/components/GeneralModal";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { useOrder } from "@/pages/order/lib/order.hook";
import type { OrderResource } from "@/pages/order/lib/order.interface";
import type { GuideResource } from "../lib/guide.interface";
import { useGuideStore } from "../lib/guide.store";
import { successToast, errorToast } from "@/lib/core.function";

interface GuideLinkOrderDialogProps {
  guide: GuideResource | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const GuideLinkOrderDialog = ({
  guide,
  onClose,
  onSuccess,
}: GuideLinkOrderDialogProps) => {
  const { linkOrderToGuide, isSubmitting } = useGuideStore();
  const form = useForm({ defaultValues: { order_id: "" } });

  const handleSubmit = async () => {
    const orderId = form.getValues("order_id");
    if (!guide || !orderId) return;

    try {
      await linkOrderToGuide(guide.id, Number(orderId));
      successToast("Pedido vinculado correctamente a la guía");
      onSuccess();
      onClose();
    } catch (error: any) {
      errorToast(
        error.response?.data?.message,
        "Error al vincular el pedido a la guía",
      );
    }
  };

  return (
    <GeneralModal
      open={!!guide}
      onClose={onClose}
      title="Vincular Pedido"
      subtitle={
        guide
          ? `Asocie un pedido a la guía ${guide.full_guide_number} para que se descuente de las entregas pendientes`
          : undefined
      }
      icon="Link2"
      size="md"
    >
      <Form {...form}>
        <div className="flex flex-col gap-4">
          <FormSelectAsync
            control={form.control}
            name="order_id"
            label="Pedido"
            placeholder="Seleccione un pedido"
            useQueryHook={useOrder}
            mapOptionFn={(order: OrderResource) => ({
              value: order.id.toString(),
              label: `#${order.order_number} - ${order.customer?.full_name ?? ""}`,
            })}
            required
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!form.watch("order_id") || isSubmitting}
              className="gap-2"
            >
              <Link2 className="h-4 w-4" />
              {isSubmitting ? "Vinculando..." : "Vincular Pedido"}
            </Button>
          </div>
        </div>
      </Form>
    </GeneralModal>
  );
};
