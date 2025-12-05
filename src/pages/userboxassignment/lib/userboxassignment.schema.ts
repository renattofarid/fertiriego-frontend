import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

export const userBoxAssignmentSchemaCreate = z.object({
  user_id: requiredStringId("El usuario es requerido"),
  box_id: requiredStringId("La caja es requerida"),
});

export const userBoxAssignmentSchemaUpdate = userBoxAssignmentSchemaCreate.partial();

export type UserBoxAssignmentSchema = z.infer<typeof userBoxAssignmentSchemaCreate>;
