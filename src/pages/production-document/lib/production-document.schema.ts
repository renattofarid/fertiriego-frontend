import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

// Schema para los componentes del documento de producción
export const productionDocumentComponentSchema = z.object({
  component_id: requiredStringId("Debe seleccionar un componente"),
  quantity_required: z.string().refine((val) => {
    const parsed = Number(val);
    return !isNaN(parsed) && parsed > 0;
  }, {
    message: "La cantidad requerida debe ser un número mayor a 0",
  }),
  quantity_used: z.string().refine((val) => {
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0;
  }, {
    message: "La cantidad usada debe ser un número válido",
  }),
  unit_cost: z.string().refine((val) => {
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0;
  }, {
    message: "El costo unitario debe ser un número válido",
  }),
  notes: z.string().optional(),
});

// Schema principal para crear/actualizar documento de producción
export const productionDocumentSchema = z.object({
  warehouse_origin_id: requiredStringId("Debe seleccionar un almacén de origen"),
  warehouse_dest_id: requiredStringId("Debe seleccionar un almacén de destino"),
  product_id: requiredStringId("Debe seleccionar un producto"),
  user_id: requiredStringId("Debe seleccionar un usuario"),
  responsible_id: requiredStringId("Debe seleccionar un responsable"),
  production_date: z
    .string()
    .min(1, { message: "La fecha de producción es requerida" }),
  quantity_produced: z.string().refine((val) => {
    const parsed = Number(val);
    return !isNaN(parsed) && parsed > 0;
  }, {
    message: "La cantidad producida debe ser un número mayor a 0",
  }),
  labor_cost: z.string().refine((val) => {
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0;
  }, {
    message: "El costo laboral debe ser un número válido",
  }),
  overhead_cost: z.string().refine((val) => {
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0;
  }, {
    message: "El costo indirecto debe ser un número válido",
  }),
  observations: z.string().optional(),
  components: z
    .array(productionDocumentComponentSchema)
    .min(1, { message: "Debe agregar al menos un componente" }),
});

export type ProductionDocumentSchema = z.infer<typeof productionDocumentSchema>;
export type ProductionDocumentComponentSchema = z.infer<typeof productionDocumentComponentSchema>;
