import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/FormSelect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { assignPurchaseSchema, type AssignPurchaseSchema } from "../lib/purchase-shipping-guide.schema";
import { Loader } from "lucide-react";
import type { PurchaseResource } from "@/pages/purchase/lib/purchase.interface";

interface AssignPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (purchaseId: number) => Promise<void>;
  purchases: PurchaseResource[];
  isSubmitting: boolean;
}

export const AssignPurchaseModal = ({
  open,
  onClose,
  onSubmit,
  purchases,
  isSubmitting,
}: AssignPurchaseModalProps) => {
  const form = useForm<AssignPurchaseSchema>({
    resolver: zodResolver(assignPurchaseSchema),
    defaultValues: {
      purchase_id: "",
    },
  });

  const handleSubmit = async (data: AssignPurchaseSchema) => {
    await onSubmit(Number(data.purchase_id));
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Compra</DialogTitle>
          <DialogDescription>
            Seleccione la compra que desea asociar a esta guía de remisión.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormSelect
              control={form.control}
              name="purchase_id"
              label="Compra"
              placeholder="Seleccione una compra"
              options={purchases.map((purchase) => ({
                value: purchase.id.toString(),
                label: `${purchase.correlativo} - ${purchase.supplier_fullname}`,
              }))}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`} />
                {isSubmitting ? "Asignando..." : "Asignar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
