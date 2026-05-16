import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { GeneralModal } from "@/components/GeneralModal";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/ui/button";
import { useUpdateWarehouseProductStock } from "../lib/warehouse-product.hook";
import { Save } from "lucide-react";
import {Form} from "@/components/ui/form";

interface EditStockModalProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  currentStock: number;
}

export const EditStockModal = ({
  open,
  onClose,
  productId,
  productName,
  currentStock,
}: EditStockModalProps) => {
  const { mutate: updateStock, isPending } = useUpdateWarehouseProductStock();

  const form = useForm({
    defaultValues: {
      stock: currentStock.toString(),
    },
  });

  // Sincronizar el estado por si el prop cambia
  useEffect(() => {
    if (open) {
      form.reset({ stock: currentStock.toString() });
    }
  }, [open, currentStock, form]);

  const onSubmit = form.handleSubmit((data) => {
    const newStock = parseFloat(data.stock);
    
    if (isNaN(newStock) || newStock < 0) return;

    updateStock(
      { id: productId, stock: newStock },
      {
        onSuccess: () => {
          onClose(); 
        },
      }
    );
  });

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Editar Stock"
      subtitle={`Actualizando stock de: ${productName}`}
      icon="Package"
      size="md"
    >
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 py-4">
          <FormInput
            control={form.control}
            name="stock"
            label="Nuevo Stock"
            type="number"
            step="0.01" 
            placeholder="0.00"
          />

          <div className="flex gap-4 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Guardando..." : "Guardar Stock"}
            </Button>
          </div>
        </form>
      </Form> 
    </GeneralModal>
  );
};