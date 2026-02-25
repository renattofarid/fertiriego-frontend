import { onlyLettersSchema, requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

const typeDocumentSchema = z.enum(["DNI", "RUC", "CE", "PASAPORTE"], {
  error: "Debe seleccionar un tipo de documento",
});

const typePersonSchema = z.enum(["NATURAL", "JURIDICA"], {
  error: "Debe seleccionar un tipo de persona",
});

const genderSchema = z.enum(["M", "F", "O"], {
  error: "Debe seleccionar un género",
});

export type TypeDocument = z.infer<typeof typeDocumentSchema>;
export type TypePerson = z.infer<typeof typePersonSchema>;
export type Gender = z.infer<typeof genderSchema>;

export const personCreateSchema = z
  .object({
    type_document: typeDocumentSchema,

    type_person: typePersonSchema,

    number_document: z
      .string()
      .min(1, "El número de documento es obligatorio")
      .refine(
        (val) => /^[0-9]+$/.test(val),
        "El número de documento solo puede contener números"
      )
      .refine(
        (val) => val.length >= 8 && val.length <= 11,
        "El número de documento debe tener entre 8 y 11 dígitos"
      ),

    names: onlyLettersSchema("nombre"),
    gender: genderSchema.optional(),
    birth_date: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        "Ingrese una fecha válida"
      ),
    father_surname: onlyLettersSchema("apellido paterno"),
    mother_surname: onlyLettersSchema("apellido materno"),

    business_name: z
      .string()
      .max(255, "La razón social no puede exceder 255 caracteres")
      .optional()
      .or(z.literal("")),

    commercial_name: z
      .string()
      .max(255, "El nombre comercial no puede exceder 255 caracteres")
      .optional()
      .or(z.literal("")),

    address: z
      .string()
      .min(5, "La dirección debe tener al menos 5 caracteres")
      .max(200, "La dirección no puede exceder 200 caracteres")
      .optional()
      .or(z.literal("")),

    phone: z
      .string()
      .min(1, "El teléfono es obligatorio")
      .regex(/^[0-9]{9}$/, "El teléfono debe tener exactamente 9 dígitos"),

    email: z
      .string()
      .min(1, "El correo electrónico es obligatorio")
      .email("Ingrese un correo electrónico válido")
      .max(255, "El correo no puede exceder 255 caracteres"),

    // ocupation: z
    //   .string()
    //   .max(100, "La ocupación no puede exceder 100 caracteres")
    //   .optional()
    //   .or(z.literal("")),

    driver_license: z
      .string()
      .max(20, "La licencia no puede exceder 20 caracteres")
      .optional()
      .or(z.literal("")),

    role_id: requiredStringId("Debe seleccionar un rol válido"),
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
      if (!data.commercial_name || data.commercial_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El nombre comercial es obligatorio para personas jurídicas",
          path: ["commercial_name"],
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

      if (!data.gender) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El género es obligatorio para personas naturales",
          path: ["gender"],
        });
      }

      if (!data.birth_date || data.birth_date.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La fecha de nacimiento es obligatoria para personas naturales",
          path: ["birth_date"],
        });
      }

      // if (!data.ocupation || data.ocupation.trim() === "") {
      //   ctx.addIssue({
      //     code: z.ZodIssueCode.custom,
      //     message: "La ocupación es obligatoria para personas naturales",
      //     path: ["ocupation"],
      //   });
      // }
    }

    // Validaciones específicas por tipo de documento
    if (data.type_document === "DNI" && data.number_document.length !== 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El DNI debe tener exactamente 8 dígitos",
        path: ["number_document"],
      });
    }

    if (data.type_document === "RUC" && data.number_document.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El RUC debe tener exactamente 11 dígitos",
        path: ["number_document"],
      });
    }

    if (
      data.type_document === "CE" &&
      (data.number_document.length < 8 || data.number_document.length > 9)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El Carnet de Extranjería debe tener entre 8 y 9 dígitos",
        path: ["number_document"],
      });
    }

    if (
      data.type_document === "PASAPORTE" &&
      (data.number_document.length < 8 || data.number_document.length > 11)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El Pasaporte debe tener entre 8 y 11 caracteres",
        path: ["number_document"],
      });
    }
  });

export const personUpdateSchema = personCreateSchema.partial().extend({
  business_name: personCreateSchema.shape.business_name
    .optional()
    .or(z.literal("")),
});

export type PersonSchema = z.infer<typeof personCreateSchema>;
