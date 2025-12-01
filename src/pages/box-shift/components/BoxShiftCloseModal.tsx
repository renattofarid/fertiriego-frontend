import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBoxShiftStore } from "../lib/box-shift.store";
import {
  boxShiftSchemaClose,
  type BoxShiftSchemaClose,
} from "../lib/box-shift.schema";
import { useBoxShiftById } from "../lib/box-shift.hook";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { successToast, errorToast } from "@/lib/core.function";
import { useEffect } from "react";

interface BoxShiftCloseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftId: number;
  onSuccess: () => void;
}

export default function BoxShiftCloseModal({
  open,
  onOpenChange,
  shiftId,
  onSuccess,
}: BoxShiftCloseModalProps) {
  const { closeBoxShiftAction, isSubmitting } = useBoxShiftStore();
  const { data: shift, isFinding } = useBoxShiftById(shiftId);

  const form = useForm<BoxShiftSchemaClose>({
    resolver: zodResolver(boxShiftSchemaClose) as any,
    defaultValues: {
      box_id: 0,
      closed_amount: 0,
      observation: "",
    },
  });

  useEffect(() => {
    if (shift) {
      form.setValue("box_id", shift.box_id);
      form.setValue("closed_amount", shift.expected_balance);
    }
  }, [shift, form]);

  const onSubmit = async (data: BoxShiftSchemaClose) => {
    try {
      await closeBoxShiftAction(data);
      successToast("Turno cerrado exitosamente");
      form.reset();
      onSuccess();
    } catch (error: any) {
      errorToast(
        (error.response.data.message ?? error.response.data.error) ||
          "Error al cerrar turno"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cerrar Turno de Caja</DialogTitle>
          <DialogDescription>
            Complete los campos para cerrar el turno de caja
          </DialogDescription>
        </DialogHeader>

        {isFinding ? (
          <div className="text-center py-4">
            Cargando información del turno...
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Monto Inicial:</span>
                  <span>${shift?.started_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Ingresos:</span>
                  <span className="text-green-600">
                    +${shift?.total_income.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Egresos:</span>
                  <span className="text-red-600">
                    -${shift?.total_outcome.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Balance Esperado:</span>
                  <span className="font-bold text-blue-600">
                    ${shift?.expected_balance.toFixed(2)}
                  </span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="closed_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto de Cierre</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observación</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones opcionales..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Cerrando..." : "Cerrar Turno"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
