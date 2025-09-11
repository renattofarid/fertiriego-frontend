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

export const userCreateSchema = z
  .object({
    username: z
      .string()
      .min(4, "El usuario debe tener al menos 4 caracteres")
      .max(20, "El usuario no puede tener más de 20 caracteres"),

    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    // .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),

    type_document: typeDocumentSchema,

    type_person: typePersonSchema,

    names: z
      .string()
      .max(255, "El nombre no puede exceder 255 caracteres")
      .optional(),

    father_surname: z
      .string()
      .max(255, "El apellido paterno no puede exceder 255 caracteres")
      .optional(),

    mother_surname: z
      .string()
      .max(255, "El apellido materno no puede exceder 255 caracteres")
      .optional(),

    business_name: z
      .string()
      .max(255, "La razón social no puede exceder 255 caracteres")
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
  })
  .superRefine((data, ctx) => {
    // Validación condicional para business_name
    if (data.type_person === "JURIDICA") {
      if (!data.business_name || data.business_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La razón social es obligatoria para personas jurídicas",
          path: ["business_name"],
        });
      }
    }
    if (data.type_person === "NATURAL") {
      if (!data.names || data.names.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El nombre es obligatorio para personas naturales",
          path: ["names"],
        });
      }

      if (!data.father_surname || data.father_surname.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El apellido paterno es obligatorio para personas naturales",
          path: ["father_surname"],
        });
      }
      if (!data.mother_surname || data.mother_surname.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El apellido materno es obligatorio para personas naturales",
          path: ["mother_surname"],
        });
      }
    }
  });

export const userUpdateSchema = userCreateSchema.partial().extend({
  password: userCreateSchema.shape.password.optional().or(z.literal("")),
  business_name: userCreateSchema.shape.business_name
    .optional()
    .or(z.literal("")),
});

export type UserSchema = z.infer<typeof userCreateSchema>;
