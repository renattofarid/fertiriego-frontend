import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBoxMovementStore } from "../lib/box-movement.store";
import {
  boxMovementSchemaCreate,
  type BoxMovementSchemaCreate,
} from "../lib/box-movement.schema";
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
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { successToast, errorToast } from "@/lib/core.function";
import { FormSelect } from "@/components/FormSelect";

interface BoxMovementCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boxId: number;
  onSuccess: () => void;
}

export default function BoxMovementCreateModal({
  open,
  onOpenChange,
  boxId,
  onSuccess,
}: BoxMovementCreateModalProps) {
  const { createBoxMovement, isSubmitting } = useBoxMovementStore();
  const persons = useAllPersons();

  const form = useForm<BoxMovementSchemaCreate>({
    resolver: zodResolver(boxMovementSchemaCreate) as any,
    defaultValues: {
      box_id: boxId,
      type: "INGRESO",
      concept: "",
      amount_cash: 0,
      amount_deposit: 0,
      amount_yape: 0,
      amount_plin: 0,
      amount_tarjeta: 0,
      amount_other: 0,
      comment: "",
    },
  });

  const onSubmit = async (data: BoxMovementSchemaCreate) => {
    try {
      await createBoxMovement(data);
      successToast("Movimiento registrado exitosamente");
      form.reset();
      onSuccess();
    } catch (error: any) {
      errorToast((error.response.data.message ?? error.response.data.error) || "Error al registrar movimiento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento de Caja</DialogTitle>
          <DialogDescription>
            Complete los campos para registrar un nuevo movimiento
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                name="box_id"
                control={form.control}
                label="Caja"
                placeholder="Seleccione una caja"
                options={[{ value: boxId.toString(), label: `Caja #${boxId}` }]}
              />

              <FormSelect
                name="customer_id"
                control={form.control}
                label="Cliente"
                placeholder="Seleccione un cliente"
                options={
                  persons?.map((person) => ({
                    value: person.id.toString(),
                    label:
                      person.names +
                      " " +
                      (person.father_surname ?? "") +
                      " " +
                      (person.mother_surname ?? ""),
                  })) || []
                }
              />
            </div>

            <FormField
              control={form.control}
              name="concept"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concepto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descripción del movimiento..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Métodos de Pago</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount_cash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Efectivo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depósito</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_yape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yape</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_plin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plin</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_tarjeta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarjeta</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_other"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Otro</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentario (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comentario adicional..."
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
                {isSubmitting ? "Registrando..." : "Registrar Movimiento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
