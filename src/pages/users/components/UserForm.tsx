import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Eye, EyeOff, Loader } from "lucide-react";
import {
  userCreateSchema,
  userUpdateSchema,
  type UserSchema,
} from "../lib/User.schema";
import { FormSelect } from "@/components/FormSelect";
import type { TypeUserResource } from "@/pages/type-users/lib/typeUser.interface";
import { useState } from "react";
import React from "react";
import {
  searchDNI,
  searchRUC,
  isValidData,
} from "@/lib/document-search.service";
import { Search } from "lucide-react";

interface MetricFormProps {
  defaultValues: Partial<UserSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  typeUsers: TypeUserResource[];
}

export const UserForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  typeUsers,
}: MetricFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? userCreateSchema : userUpdateSchema
    ),
    defaultValues: {
      ...defaultValues,
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

  // Lógica de validación entre tipo de persona y tipo de documento
  const getValidDocumentTypes = (personType: string) => {
    if (personType === "NATURAL") {
      return ["DNI", "CE", "PASAPORTE"];
    } else if (personType === "JURIDICA") {
      return ["RUC"];
    }
    return ["DNI", "RUC", "CE", "PASAPORTE"];
  };

  // Filtrar opciones de tipo de documento según el tipo de persona
  const documentTypeOptions = [
    { value: "DNI", label: "DNI" },
    { value: "RUC", label: "RUC" },
    { value: "CE", label: "Carnet de Extranjería" },
    { value: "PASAPORTE", label: "Pasaporte" },
  ].filter((option) =>
    getValidDocumentTypes(type_person ?? "").includes(option.value)
  );

  // Resetear el tipo de documento si no es válido para el tipo de persona seleccionado
  React.useEffect(() => {
    if (
      type_person &&
      type_document &&
      !getValidDocumentTypes(type_person).includes(type_document)
    ) {
      form.setValue("type_document", undefined);
      form.setValue("number_document", "");
    }
  }, [type_person, type_document, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="bg-tertiary rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1">
            <FormSelect
              control={form.control}
              name="rol_id"
              label="Tipo de Usuario"
              placeholder="Seleccione tipo de usuario"
              options={typeUsers!.map((type) => ({
                value: type.id.toString(),
                label: type.name,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="type_document"
              label="Tipo de Documento"
              placeholder="Seleccione tipo de documento"
              options={documentTypeOptions}
            />

            <FormSelect
              control={form.control}
              name="type_person"
              label="Tipo de Persona"
              placeholder="Seleccione tipo de persona"
              options={[
                { value: "NATURAL", label: "Natural" },
                { value: "JURIDICA", label: "Juridica" },
              ]}
            />

            <FormField
              control={form.control}
              name="number_document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">
                    Número de Documento
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        maxLength={
                          type_document === "RUC"
                            ? 11
                            : type_document === "DNI"
                            ? 8
                            : type_document === "CE"
                            ? 12
                            : type_document === "PASAPORTE"
                            ? 9
                            : 0
                        }
                        placeholder="Número de Documento"
                        {...field}
                      />
                      {(type_document === "DNI" || type_document === "RUC") && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={
                            !field.value ||
                            (type_document === "DNI" &&
                              field.value.length !== 8) ||
                            (type_document === "RUC" &&
                              field.value.length !== 11) ||
                            isSearching
                          }
                          onClick={async () => {
                            if (field.value) {
                              setIsSearching(true);
                              try {
                                if (
                                  type_document === "DNI" &&
                                  field.value.length === 8
                                ) {
                                  const response = await searchDNI({
                                    search: field.value,
                                  });
                                  if (response.data) {
                                    const newFieldsFromSearch = {
                                      ...fieldsFromSearch,
                                    };
                                    if (isValidData(response.data.names)) {
                                      form.setValue(
                                        "names",
                                        response.data.names
                                      );
                                      newFieldsFromSearch.names = true;
                                    }
                                    if (
                                      isValidData(response.data.father_surname)
                                    ) {
                                      form.setValue(
                                        "father_surname",
                                        response.data.father_surname
                                      );
                                      newFieldsFromSearch.father_surname = true;
                                    }
                                    if (
                                      isValidData(response.data.mother_surname)
                                    ) {
                                      form.setValue(
                                        "mother_surname",
                                        response.data.mother_surname
                                      );
                                      newFieldsFromSearch.mother_surname = true;
                                    }
                                    setFieldsFromSearch(newFieldsFromSearch);
                                  }
                                } else if (
                                  type_document === "RUC" &&
                                  field.value.length === 11
                                ) {
                                  const response = await searchRUC({
                                    search: field.value,
                                  });
                                  if (response.data) {
                                    const newFieldsFromSearch = {
                                      ...fieldsFromSearch,
                                    };
                                    if (
                                      isValidData(response.data.business_name)
                                    ) {
                                      form.setValue(
                                        "business_name",
                                        response.data.business_name
                                      );
                                      newFieldsFromSearch.business_name = true;
                                    }
                                    if (isValidData(response.data.address)) {
                                      form.setValue(
                                        "address",
                                        response.data.address!
                                      );
                                      newFieldsFromSearch.address = true;
                                    }
                                    setFieldsFromSearch(newFieldsFromSearch);
                                  }
                                }
                              } catch (error) {
                                console.error(
                                  "Error searching document:",
                                  error
                                );
                              } finally {
                                setIsSearching(false);
                              }
                            }
                          }}
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

            {type_person === "NATURAL" && (
              <>
                <FormField
                  control={form.control}
                  name="names"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-normal">
                        Nombres
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Juan"
                          disabled={fieldsFromSearch.names}
                          {...field}
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
                      <FormLabel className="text-sm font-normal">
                        Apellido Paterno
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Perez"
                          disabled={fieldsFromSearch.father_surname}
                          {...field}
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
                      <FormLabel className="text-sm font-normal">
                        Apellido Materno
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Gomez"
                          disabled={fieldsFromSearch.mother_surname}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {type_person === "JURIDICA" && (
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-normal">
                      Razón Social
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Razón Social"
                        disabled={fieldsFromSearch.business_name}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">
                    Dirección
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Dirección"
                      disabled={fieldsFromSearch.address}
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
                  <FormLabel className="text-sm font-normal">
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input maxLength={9} placeholder="Teléfono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">
                    Correo Electrónico
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Correo Electrónico"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => {
                const [showPassword, setShowPassword] = useState(false);
                return (
                  <FormItem>
                    <FormLabel className="text-sm font-normal">
                      Contraseña
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Contraseña"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary text-muted-foreground"
                          onClick={() => setShowPassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>

        {/* <code>
          <pre>{JSON.stringify(form.getValues, null, 2)}</pre>
          <pre>{JSON.stringify(form.formState.errors, null, 2)}</pre>
        </code> */}

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>
          {/* <Button type="button" variant="neutral" onClick={() => form.trigger()}>
            Validate
          </Button> */}
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Usuario"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
