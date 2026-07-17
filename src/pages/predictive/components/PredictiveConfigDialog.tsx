import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormInput } from "@/components/FormInput";
import { FormSwitch } from "@/components/FormSwitch";
import { useProduct } from "@/pages/product/lib/product.hook";
import { useUpdatePredictiveConfig } from "../lib/predictive.hook";
import { Loader2, Save } from "lucide-react";

const configSchema = z.object({
  product_id: z.string().optional(),
  safety_stock_days: z.number({ error: "Requerido" }).int().min(0),
  sales_velocity_window_days: z
    .number({ error: "Requerido" })
    .int()
    .min(1, "Mínimo 1 día"),
  critical_stock_days: z.number({ error: "Requerido" }).int().min(0),
  warning_stock_days: z.number({ error: "Requerido" }).int().min(0),
  alerts_enabled: z.boolean(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PredictiveConfigDialog({ open, onClose }: Props) {
  const { mutateAsync, isPending } = useUpdatePredictiveConfig();

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      product_id: "",
      safety_stock_days: 7,
      sales_velocity_window_days: 30,
      critical_stock_days: 7,
      warning_stock_days: 14,
      alerts_enabled: true,
    },
  });

  const onSubmit = async (values: ConfigFormValues) => {
    await mutateAsync({
      product_id: values.product_id ? Number(values.product_id) : null,
      safety_stock_days: values.safety_stock_days,
      sales_velocity_window_days: values.sales_velocity_window_days,
      critical_stock_days: values.critical_stock_days,
      warning_stock_days: values.warning_stock_days,
      alerts_enabled: values.alerts_enabled,
    });
    onClose();
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Configuración Predictiva"
      subtitle="Ajusta los parámetros del motor de reabastecimiento"
      icon="BrainCircuit"
      size="2xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-xl border p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Alcance
            </p>
            <FormSelectAsync
              control={form.control}
              name="product_id"
              label="Producto"
              placeholder="Configuración global (todos los productos)"
              useQueryHook={useProduct}
              mapOptionFn={(p) => ({ value: String(p.id), label: p.name })}
            />
          </div>

          <div className="rounded-xl border p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Parámetros del Algoritmo
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="safety_stock_days"
                label="Días de Stock de Seguridad"
                type="number"
                required
                description="Días mínimos de inventario como colchón de seguridad"
              />
              <FormInput
                control={form.control}
                name="sales_velocity_window_days"
                label="Ventana de Velocidad de Ventas"
                type="number"
                required
                description="Días históricos para calcular la velocidad de ventas"
              />
              <FormInput
                control={form.control}
                name="critical_stock_days"
                label="Días para Estado Crítico"
                type="number"
                required
                description="Umbral de días restantes para clasificar como crítico"
              />
              <FormInput
                control={form.control}
                name="warning_stock_days"
                label="Días para Advertencia"
                type="number"
                required
                description="Umbral de días restantes para clasificar como advertencia"
              />
            </div>
          </div>

          <div className="rounded-xl border p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Alertas
            </p>
            <FormSwitch
              control={form.control}
              name="alerts_enabled"
              text="Habilitar alertas"
              description="Activa o desactiva la generación de alertas de abastecimiento"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isPending ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
