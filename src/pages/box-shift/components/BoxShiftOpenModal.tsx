import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBoxShiftStore } from "../lib/box-shift.store";
import {
  boxShiftSchemaCreate,
  type BoxShiftSchemaCreate,
} from "../lib/box-shift.schema";
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
import { useAllBoxes } from "@/pages/box/lib/box.hook";
import { successToast, errorToast } from "@/lib/core.function";
import { FormSelect } from "@/components/FormSelect";
import FormSkeleton from "@/components/FormSkeleton";

interface BoxShiftOpenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function BoxShiftOpenModal({
  open,
  onOpenChange,
  onSuccess,
}: BoxShiftOpenModalProps) {
  const { createBoxShift, isSubmitting } = useBoxShiftStore();
  const { data: boxes, isLoading: loadingBoxes } = useAllBoxes();

  const form = useForm<BoxShiftSchemaCreate>({
    resolver: zodResolver(boxShiftSchemaCreate) as any,
    defaultValues: {
      box_id: 0,
      started_amount: 0,
      observation: "",
    },
  });

  const onSubmit = async (data: BoxShiftSchemaCreate) => {
    try {
      await createBoxShift(data);
      successToast("Turno abierto exitosamente");
      form.reset();
      onSuccess();
    } catch (error: any) {
      errorToast((error.response.data.message ?? error.response.data.error) || "Error al abrir turno");
    }
  };

  if (loadingBoxes) return <FormSkeleton />;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Abrir Turno de Caja</DialogTitle>
          <DialogDescription>
            Complete los campos para abrir un nuevo turno de caja
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormSelect
              name="box_id"
              control={form.control}
              label="Caja"
              placeholder="Seleccione una caja"
              options={
                boxes?.map((box) => ({
                  value: box.id.toString(),
                  label: box.name,
                })) || []
              }
            />

            <FormField
              control={form.control}
              name="started_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Inicial</FormLabel>
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
                {isSubmitting ? "Abriendo..." : "Abrir Turno"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
