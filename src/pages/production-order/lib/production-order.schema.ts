import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

export const productionOrderComponentSchema = z.object({
  component_id: requiredStringId("Debe seleccionar un componente"),
  component_name: z.string().optional(),
  quantity_required: z.string().refine((val) => {
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0.01;
  }, {
    message: "La cantidad requerida debe ser un número mayor a 0",
  }),
  unit_cost: z.string().refine((val) => {
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0;
  }, {
    message: "El costo unitario debe ser un número válido",
  }).optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export const productionOrderSchema = z.object({
  warehouse_origin_id: requiredStringId("Debe seleccionar un almacén de origen"),
  warehouse_dest_id: requiredStringId("Debe seleccionar un almacén de destino"),
  product_id: requiredStringId("Debe seleccionar un producto"),
  responsible_id: requiredStringId("Debe seleccionar un responsable"),
  requested_date: z.string().min(1, { message: "La fecha solicitada es requerida" }),
  quantity_requested: z.string().refine((val) => {
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0.01;
  }, {
    message: "La cantidad solicitada debe ser un número mayor a 0",
  }),
  currency: z.string().max(10).optional().or(z.literal("")),
  labor_cost: z.string().refine((val) => {
    if (!val) return true;
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0;
  }, {
    message: "El costo laboral debe ser un número válido",
  }).optional().or(z.literal("")),
  observations: z.string().max(1000).optional(),
  components: z
    .array(productionOrderComponentSchema)
    .min(1, { message: "Debe agregar al menos un componente" }),
});

export type ProductionOrderSchema = z.infer<typeof productionOrderSchema>;
export type ProductionOrderComponentSchema = z.infer<typeof productionOrderComponentSchema>;
