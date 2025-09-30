import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
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
import { Loader, Search, Save, UserPlus } from "lucide-react";
import { personCreateSchema, type PersonSchema } from "../lib/person.schema";
import { FormSelect } from "@/components/FormSelect";
import {
  searchDNI,
  searchRUC,
  isValidData,
} from "@/lib/document-search.service";
import type { PersonResource } from "../lib/person.interface";

interface PersonFormProps {
  initialData?: PersonResource | null;
  onSubmit: (data: PersonSchema) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  roleId: number; // Role ID to assign automatically
  isWorker?: boolean; // If true, only allow DNI and NATURAL person
}

export const PersonForm = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
  roleId,
  isWorker = false,
}: PersonFormProps) => {
  const isEditing = !!initialData;

  const form = useForm<PersonSchema>({
    resolver: zodResolver(personCreateSchema),
    defaultValues: {
      type_document: (initialData?.type_document as "DNI" | "RUC") || "DNI",
      type_person:
        (initialData?.type_person as "NATURAL" | "JURIDICA") || "NATURAL",
      number_document: initialData?.number_document || "",
      names: initialData?.names || "",
      gender: (initialData?.gender as "M" | "F" | "O") || "M",
      birth_date: initialData?.birth_date || "",
      father_surname: initialData?.father_surname || "",
      mother_surname: initialData?.mother_surname || "",
      business_name: initialData?.business_name || "",
      commercial_name: initialData?.commercial_name || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      rol_id: roleId.toString(),
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

  const type_person = form.watch("type_person");
  const type_document = form.watch("type_document");
  const [isSearching, setIsSearching] = useState(false);

  // Get form state for better UX
  const { errors, isValid, dirtyFields } = form.formState;
  const [fieldsFromSearch, setFieldsFromSearch] = useState({
    names: false,
    father_surname: false,
    mother_surname: false,
    business_name: false,
    address: false,
  });

  // Auto-set person type based on document type
  useEffect(() => {
    if (type_document === "DNI" && type_person !== "NATURAL") {
      form.setValue("type_person", "NATURAL", { shouldValidate: true });
    } else if (type_document === "RUC" && type_person !== "JURIDICA") {
      form.setValue("type_person", "JURIDICA", { shouldValidate: true });
    }
  }, [type_document, type_person, form]);

  // Reset document type when person type changes to JURIDICA
  useEffect(() => {
    if (type_person === "JURIDICA" && type_document !== "RUC") {
      form.setValue("type_document", "RUC", { shouldValidate: true });
      form.setValue("number_document", "", { shouldValidate: true });
    }
  }, [type_person, type_document, form]);

  const handleDocumentSearch = async () => {
    const numberDocument = form.getValues("number_document");
    const typeDocument = form.getValues("type_document");

    if (!numberDocument || !typeDocument) return;

    setIsSearching(true);

    try {
      if (typeDocument === "DNI") {
        const result = await searchDNI({ search: numberDocument });

        if (result && isValidData(result.message) && result.data) {
          const updates: Record<string, string> = {};
          const fieldsSet = {
            names: false,
            father_surname: false,
            mother_surname: false,
            business_name: false,
            address: false,
          };

          updates.names = result.data.names || "";
          updates.father_surname = result.data.father_surname || "";
          updates.mother_surname = result.data.mother_surname || "";
          fieldsSet.names = true;
          fieldsSet.father_surname = true;
          fieldsSet.mother_surname = true;

          Object.keys(updates).forEach((key) => {
            form.setValue(key as keyof PersonSchema, updates[key], {
              shouldValidate: true,
            });
          });

          setFieldsFromSearch(fieldsSet);
        }
      } else if (typeDocument === "RUC") {
        const result = await searchRUC({ search: numberDocument });

        if (result && isValidData(result.message) && result.data) {
          const updates: Record<string, string> = {};
          const fieldsSet = {
            names: false,
            father_surname: false,
            mother_surname: false,
            business_name: false,
            address: false,
          };

          updates.business_name = result.data.business_name || "";
          updates.address = result.data.address || "";
          fieldsSet.business_name = true;
          fieldsSet.address = true;

          Object.keys(updates).forEach((key) => {
            form.setValue(key as keyof PersonSchema, updates[key], {
              shouldValidate: true,
            });
          });

          setFieldsFromSearch(fieldsSet);
        }
      }
    } catch (error) {
      console.error("Error searching document:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (data: PersonSchema) => {
    try {
      await onSubmit(data);
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Document Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormSelect
            control={form.control}
            name="type_document"
            label="Tipo de Documento"
            placeholder="Seleccione tipo"
            options={
              isWorker
                ? [{ value: "DNI", label: "DNI" }] // Workers can only use DNI
                : type_person === "JURIDICA"
                ? [{ value: "RUC", label: "RUC" }]
                : [
                    { value: "DNI", label: "DNI" },
                    { value: "RUC", label: "RUC" },
                    { value: "CE", label: "CE" },
                    { value: "PASAPORTE", label: "PASAPORTE" },
                  ]
            }
          />

          <FormField
            control={form.control}
            name="number_document"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={errors.number_document ? "text-destructive" : ""}
                >
                  Número de Documento {errors.number_document && "*"}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={
                        type_document === "DNI"
                          ? "Ingrese 8 dígitos"
                          : type_document === "RUC"
                          ? "Ingrese 11 dígitos"
                          : type_document === "CE"
                          ? "Ingrese 8-9 dígitos"
                          : type_document === "PASAPORTE"
                          ? "Ingrese 8-11 caracteres"
                          : "Ingrese el número"
                      }
                      {...field}
                      className={`
                        ${
                          fieldsFromSearch.names
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }
                        ${
                          errors.number_document
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        ${
                          dirtyFields.number_document && !errors.number_document
                            ? "border-green-500"
                            : ""
                        }
                      `}
                      maxLength={
                        type_document === "DNI"
                          ? 8
                          : type_document === "RUC"
                          ? 11
                          : type_document === "CE"
                          ? 9
                          : type_document === "PASAPORTE"
                          ? 11
                          : 11
                      }
                      onChange={(e) => {
                        let value;
                        // For DNI, RUC, CE only allow numbers
                        if (
                          type_document === "DNI" ||
                          type_document === "RUC" ||
                          type_document === "CE"
                        ) {
                          value = e.target.value.replace(/\D/g, "");
                        } else {
                          // For PASAPORTE allow alphanumeric
                          value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                        }

                        field.onChange(value);

                        // Auto-search when completing DNI (8 digits) or RUC (11 digits)
                        if (
                          (type_document === "DNI" && value.length === 8) ||
                          (type_document === "RUC" && value.length === 11)
                        ) {
                          setTimeout(() => handleDocumentSearch(), 100);
                        }
                      }}
                    />
                    {(type_document === "DNI" || type_document === "RUC") && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={handleDocumentSearch}
                        disabled={isSearching || !field.value}
                      >
                        {isSearching ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
                {/* Fixed height container for feedback messages */}
                <div className="h-4 text-xs">
                  {field.value && !errors.number_document && (
                    <>
                      {type_document === "DNI" && field.value.length === 8 && (
                        <p className="text-green-600">
                          ✓ DNI válido (8 dígitos)
                        </p>
                      )}
                      {type_document === "RUC" && field.value.length === 11 && (
                        <p className="text-green-600">
                          ✓ RUC válido (11 dígitos)
                        </p>
                      )}
                      {type_document === "CE" &&
                        field.value.length >= 8 &&
                        field.value.length <= 9 && (
                          <p className="text-green-600">
                            ✓ CE válido ({field.value.length} dígitos)
                          </p>
                        )}
                      {type_document === "PASAPORTE" &&
                        field.value.length >= 8 &&
                        field.value.length <= 11 && (
                          <p className="text-green-600">
                            ✓ Pasaporte válido ({field.value.length} caracteres)
                          </p>
                        )}
                      {/* Show progress */}
                      {((type_document === "DNI" && field.value.length < 8) ||
                        (type_document === "RUC" && field.value.length < 11) ||
                        (type_document === "CE" && field.value.length < 8) ||
                        (type_document === "PASAPORTE" &&
                          field.value.length < 8)) && (
                        <p className="text-amber-600">
                          {type_document === "DNI" &&
                            `${8 - field.value.length} dígitos restantes`}
                          {type_document === "RUC" &&
                            `${11 - field.value.length} dígitos restantes`}
                          {type_document === "CE" &&
                            field.value.length < 8 &&
                            `${8 - field.value.length} dígitos restantes`}
                          {type_document === "PASAPORTE" &&
                            field.value.length < 8 &&
                            `${8 - field.value.length} caracteres restantes`}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </FormItem>
            )}
          />

          <FormSelect
            control={form.control}
            name="type_person"
            label="Tipo de Persona"
            placeholder="Seleccione tipo"
            disabled={isWorker} // Workers are always natural persons
            options={
              isWorker
                ? [{ value: "NATURAL", label: "Natural" }] // Workers are always natural
                : [
                    { value: "NATURAL", label: "Natural" },
                    { value: "JURIDICA", label: "Jurídica" },
                  ]
            }
          />
        </div>

        {/* Personal Information - Natural Person */}
        {type_person === "NATURAL" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="names"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={errors.names ? "text-destructive" : ""}>
                    Nombres {errors.names && "*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese los nombres"
                      {...field}
                      className={`
                        ${
                          fieldsFromSearch.names
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }
                        ${
                          errors.names
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        ${
                          dirtyFields.names && !errors.names
                            ? "border-green-500"
                            : ""
                        }
                      `}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Fixed height container for feedback */}
                  <div className="h-4 text-xs">
                    {!errors.names && dirtyFields.names && (
                      <p className="text-green-600">✓ Nombres válidos</p>
                    )}
                  </div>
                </FormItem>
              )}
            />

            <FormSelect
              control={form.control}
              name="gender"
              label="Género"
              placeholder="Seleccione género"
              options={[
                { value: "M", label: "Masculino" },
                { value: "F", label: "Femenino" },
                { value: "O", label: "Otro" },
              ]}
            />

            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={errors.birth_date ? "text-destructive" : ""}
                  >
                    Fecha de Nacimiento {errors.birth_date && "*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className={`
                        ${
                          errors.birth_date
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        ${
                          dirtyFields.birth_date && !errors.birth_date
                            ? "border-green-500"
                            : ""
                        }
                      `}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Fixed height container for feedback */}
                  <div className="h-4 text-xs">
                    {!errors.birth_date && dirtyFields.birth_date && (
                      <p className="text-green-600">✓ Fecha válida</p>
                    )}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="father_surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido Paterno</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese apellido paterno"
                      {...field}
                      className={
                        fieldsFromSearch.father_surname ? "bg-blue-50" : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Fixed height container for consistency */}
                  <div className="h-4"></div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mother_surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido Materno</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese apellido materno"
                      {...field}
                      className={
                        fieldsFromSearch.mother_surname ? "bg-blue-50" : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Fixed height container for consistency */}
                  <div className="h-4"></div>
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="ocupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={errors.ocupation ? "text-destructive" : ""}
                  >
                    Ocupación {errors.ocupation && "*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese la ocupación"
                      {...field}
                      className={`
                        ${
                          errors.ocupation
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        ${
                          dirtyFields.ocupation && !errors.ocupation
                            ? "border-green-500"
                            : ""
                        }
                      `}
                    />
                  </FormControl>
                  <FormMessage />
                  
                  <div className="h-4 text-xs">
                    {!errors.ocupation && dirtyFields.ocupation && (
                      <p className="text-green-600">✓ Ocupación válida</p>
                    )}
                  </div>
                </FormItem>
              )}
            /> */}
          </div>
        )}

        {/* Business Information - Legal Person */}
        {type_person === "JURIDICA" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={errors.business_name ? "text-destructive" : ""}
                  >
                    Razón Social {errors.business_name && "*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese la razón social"
                      {...field}
                      className={`
                        ${
                          fieldsFromSearch.business_name
                            ? "bg-blue-50 border-blue-200"
                            : ""
                        }
                        ${
                          errors.business_name
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        ${
                          dirtyFields.business_name && !errors.business_name
                            ? "border-green-500"
                            : ""
                        }
                      `}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Fixed height container for feedback */}
                  <div className="h-4 text-xs">
                    {!errors.business_name && dirtyFields.business_name && (
                      <p className="text-green-600">✓ Razón social válida</p>
                    )}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commercial_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={errors.commercial_name ? "text-destructive" : ""}
                  >
                    Nombre Comercial {errors.commercial_name && "*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese el nombre comercial"
                      {...field}
                      className={`
                        ${
                          errors.commercial_name
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        ${
                          dirtyFields.commercial_name && !errors.commercial_name
                            ? "border-green-500"
                            : ""
                        }
                      `}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Fixed height container for feedback */}
                  <div className="h-4 text-xs">
                    {!errors.commercial_name && dirtyFields.commercial_name && (
                      <p className="text-green-600">
                        ✓ Nombre comercial válido
                      </p>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={errors.email ? "text-destructive" : ""}>
                  Correo Electrónico {errors.email && "*"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    {...field}
                    className={`
                      ${
                        errors.email
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                      ${
                        dirtyFields.email && !errors.email
                          ? "border-green-500"
                          : ""
                      }
                    `}
                  />
                </FormControl>
                <FormMessage />
                {/* Fixed height container for feedback */}
                <div className="h-4 text-xs">
                  {!errors.email && dirtyFields.email && (
                    <p className="text-green-600">
                      ✓ Correo electrónico válido
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={errors.phone ? "text-destructive" : ""}>
                  Teléfono {errors.phone && "*"}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="987654321 (9 dígitos)"
                    {...field}
                    className={`
                      ${
                        errors.phone
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                      ${
                        dirtyFields.phone && !errors.phone
                          ? "border-green-500"
                          : ""
                      }
                    `}
                    maxLength={9}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/\D/g, "");
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
                {/* Fixed height container for feedback */}
                <div className="h-4 text-xs">
                  {!errors.phone && dirtyFields.phone && (
                    <p className="text-green-600">✓ Teléfono válido</p>
                  )}
                  {field.value &&
                    field.value.length < 9 &&
                    field.value.length > 0 && (
                      <p className="text-amber-600">
                        {9 - field.value.length} dígitos restantes
                      </p>
                    )}
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingrese la dirección"
                  {...field}
                  className={fieldsFromSearch.address ? "bg-blue-50" : ""}
                />
              </FormControl>
              <FormMessage />
              {/* Fixed height container for consistency */}
              <div className="h-4"></div>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className={`gap-2 ${!isValid ? "opacity-50" : ""}`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                {isEditing ? "Actualizando..." : "Creando..."}
              </>
            ) : (
              <>
                {isEditing ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {isEditing ? "Actualizar" : "Crear"} Persona
              </>
            )}
          </Button>
        </div>

        {/* Form validation summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Hay {Object.keys(errors).length} error
                  {Object.keys(errors).length > 1 ? "es" : ""} que necesita
                  {Object.keys(errors).length > 1 ? "n" : ""} corrección
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field} className="flex items-start">
                        <span className="inline-block w-1 h-1 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {error?.message || `Error en ${field}`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
};
