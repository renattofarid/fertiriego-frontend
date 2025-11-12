import { z } from "zod";

export const optionalNumericId = (message: string) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const parsed = Number(val);
      return isNaN(parsed) ? val : parsed;
    },
    z
      .number()
      .optional()
      .refine((val) => val !== undefined, { message })
  );

export const optionalStringId = (message: string) =>
  z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().min(1, message).optional()
  );

export const requiredStringId = (message: string) =>
  z
    .string()
    .min(1, message)
    .max(100, message)
    .refine((val) => val !== undefined, { message });

export const requiredNumberId = (message: string) =>
  z.preprocess(
    (val) => {
      const parsed = Number(val);
      return isNaN(parsed) ? val : parsed;
    },
    z.number().refine((val) => val !== undefined && !isNaN(val), { message })
  );

export const onlyLettersSchema = (field: string) =>
  z
    .string()
    .max(255, `El ${field} no puede exceder 255 caracteres`)
    .refine((val) => !val || /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(val), {
      message: `El ${field} solo puede contener letras y espacios`,
    })
    .optional()
    .or(z.literal("")); // si quieres permitir vacío explícito

export const dateStringSchema = (field: string) =>
  z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: `${field} no es una fecha válida`,
    })
    .optional()
    .or(z.literal(""));
