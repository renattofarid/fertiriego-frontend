import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

const numericString = (message: string, min = 0) =>
  z.string().refine((val) => {
    if (!val) return false;
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= min;
  }, { message });

const optionalNumericString = (message: string, min = 0) =>
  z.string().refine((val) => {
    if (!val) return true;
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= min;
  }, { message }).optional().or(z.literal(""));

export const productionOrderComponentSchema = z.object({
  component_id: requiredStringId("Debe seleccionar un componente"),
  component_name: z.string().optional(),
  quantity_required: numericString("La cantidad requerida debe ser un número mayor a 0", 0.01),
  unit_cost: optionalNumericString("El costo unitario debe ser un número válido"),
  // ⚠️ waste_quantity/waste_percentage NO se capturan en el formulario: el
  // backend los calcula automáticamente y solo se muestran como dato de
  // solo lectura en el detalle (igual que overhead_cost a nivel de ítem).
  notes: z.string().max(500).optional(),
});

// ✅ Un ítem = un producto a producir dentro de la orden (orden anidada,
// varios productos por orden). Los componentes son opcionales: si el usuario
// no los agrega, el backend los autocompleta desde el combo (BOM) del producto.
export const productionOrderItemSchema = z.object({
  product_id: requiredStringId("Debe seleccionar un producto"),
  product_name: z.string().optional(),
  quantity_requested: numericString("La cantidad solicitada debe ser un número mayor a 0", 0.01),
  labor_cost: optionalNumericString("El costo laboral debe ser un número válido"),
  // ⚠️ overhead_cost NO se captura en el formulario: el backend lo calcula
  // automáticamente y no debe enviarse en la request.
  notes: z.string().max(500).optional(),
  use_combo: z.boolean().optional(),
  components: z.array(productionOrderComponentSchema).optional(),
});

export const productionOrderSchema = z.object({
  warehouse_origin_id: requiredStringId("Debe seleccionar un almacén de origen"),
  warehouse_dest_id: requiredStringId("Debe seleccionar un almacén de destino"),
  responsible_id: requiredStringId("Debe seleccionar un responsable"),
  requested_date: z.string().min(1, { message: "La fecha solicitada es requerida" }),
  currency: z.string().max(10).optional().or(z.literal("")),
  observations: z.string().max(1000).optional(),
  items: z
    .array(productionOrderItemSchema)
    .min(1, { message: "Debe agregar al menos un producto a producir" }),
});

export type ProductionOrderSchema = z.infer<typeof productionOrderSchema>;
export type ProductionOrderItemSchema = z.infer<typeof productionOrderItemSchema>;
export type ProductionOrderComponentSchema = z.infer<typeof productionOrderComponentSchema>;
