import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { Eye, EyeOff, Loader, Search, Save, UserPlus } from "lucide-react";
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
}

export const PersonForm = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
  roleId,
}: PersonFormProps) => {
  const isEditing = !!initialData;

  const form = useForm<PersonSchema>({
    resolver: zodResolver(personCreateSchema),
    defaultValues: {
      username: initialData?.username || "",
      password: "",
      type_document: initialData?.person?.type_document || "DNI",
      type_person: initialData?.person?.type_person || "NATURAL",
      names: initialData?.person?.names || "",
      father_surname: initialData?.person?.father_surname || "",
      mother_surname: initialData?.person?.mother_surname || "",
      business_name: initialData?.person?.business_name || "",
      address: initialData?.person?.address || "",
      phone: initialData?.person?.phone || "",
      email: initialData?.person?.email || "",
      number_document: initialData?.person?.number_document || "",
      rol_id: roleId.toString(),
    },
    mode: "onChange",
  });

  const type_person = form.watch("type_person");
  const type_document = form.watch("type_document");
  const [isSearching, setIsSearching] = useState(false);
  const [fieldsFromSearch, setFieldsFromSearch] = useState({
    names: false,
    father_surname: false,
    mother_surname: false,
    business_name: false,
    address: false,
  });

  const [showPassword, setShowPassword] = useState(false);

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
        {/* User Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el usuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese la contraseña"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Document Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="type_document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Documento</FormLabel>
                <FormSelect
                  control={form.control}
                  label=""
                  placeholder="Seleccione tipo"
                  options={[
                    { value: "DNI", label: "DNI" },
                    { value: "RUC", label: "RUC" },
                    { value: "CE", label: "CE" },
                    { value: "PASAPORTE", label: "PASAPORTE" },
                  ]}
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number_document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Documento</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Ingrese el número"
                      {...field}
                      className={fieldsFromSearch.names ? "bg-blue-50" : ""}
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
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type_person"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Persona</FormLabel>
                <FormSelect
                  control={form.control}
                  label=""
                  placeholder="Seleccione tipo"
                  options={[
                    { value: "NATURAL", label: "Natural" },
                    { value: "JURIDICA", label: "Jurídica" },
                  ]}
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Personal Information - Natural Person */}
        {type_person === "NATURAL" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="names"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombres</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese los nombres"
                      {...field}
                      className={fieldsFromSearch.names ? "bg-blue-50" : ""}
                    />
                  </FormControl>
                  <FormMessage />
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
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Business Information - Legal Person */}
        {type_person === "JURIDICA" && (
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razón Social</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese la razón social"
                    {...field}
                    className={
                      fieldsFromSearch.business_name ? "bg-blue-50" : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Ingrese el correo"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el teléfono" {...field} />
                </FormControl>
                <FormMessage />
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
          <Button type="submit" disabled={isSubmitting} className="gap-2">
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
      </form>
    </Form>
  );
};
