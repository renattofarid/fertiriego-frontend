import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

const typeDocumentSchema = z.enum(["DNI", "RUC", "CE", "PASAPORTE"], {
  error: "Debe seleccionar un tipo de documento",
});

const typePersonSchema = z.enum(["NATURAL", "JURIDICA"], {
  error: "Debe seleccionar un tipo de persona",
});

export type TypeDocument = z.infer<typeof typeDocumentSchema>;
export type TypePerson = z.infer<typeof typePersonSchema>;

export const userCreateSchema = z.object({
  username: z
    .string()
    .min(4, "El usuario debe tener al menos 4 caracteres")
    .max(20, "El usuario no puede tener más de 20 caracteres"),

  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),

  type_document: typeDocumentSchema,

  type_person: typePersonSchema,

  names: z
    .string()
    .min(2, "Debe ingresar un nombre válido")
    .max(100, "El nombre no puede exceder 100 caracteres"),

  father_surname: z
    .string()
    .min(2, "Debe ingresar un apellido paterno válido")
    .max(50, "El apellido paterno no puede exceder 50 caracteres"),

  mother_surname: z
    .string()
    .min(2, "Debe ingresar un apellido materno válido")
    .max(50, "El apellido materno no puede exceder 50 caracteres"),

  business_name: z
    .string()
    .max(150, "La razón social no puede exceder 150 caracteres")
    .optional()
    .or(z.literal("")), // Para permitir vacío cuando es persona natural

  address: z
    .string()
    .min(5, "Debe ingresar una dirección válida")
    .max(200, "La dirección no puede exceder 200 caracteres"),

  phone: z.string().regex(/^[0-9]{9}$/, "El teléfono debe tener 9 dígitos"),

  email: z.string().email("Debe ingresar un correo válido"),

  rol_id: requiredStringId("Debe seleccionar un rol válido"),

  number_document: z
    .string()
    .refine(
      (val) => /^[0-9]{8,11}$/.test(val),
      "El número de documento debe tener entre 8 y 11 dígitos"
    ),
});

export const userUpdateSchema = userCreateSchema.partial().extend({
  password: userCreateSchema.shape.password.optional().or(z.literal("")),
  business_name: userCreateSchema.shape.business_name
    .optional()
    .or(z.literal("")),
});

export type UserSchema = z.infer<typeof userCreateSchema>;
