"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  companySchemaCreate,
  companySchemaUpdate,
  type CompanySchema,
} from "../lib/company.schema.ts";
import { Loader } from "lucide-react";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useEffect, useState } from "react";
import { searchRUC, isValidData } from "@/lib/document-search.service";
import { Search } from "lucide-react";

interface CompanyFormProps {
  defaultValues: Partial<CompanySchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const CompanyForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: CompanyFormProps) => {
  const { user } = useAuthStore();
  const [isSearching, setIsSearching] = useState(false);
  const [fieldsFromSearch, setFieldsFromSearch] = useState({
    social_reason: false,
    address: false
  });

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? companySchemaCreate : companySchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Auto-llenar responsible_id con el ID del usuario logueado
  useEffect(() => {
    if (user?.id && mode === "create") {
      form.setValue("responsible_id", user.id);
    }
  }, [user?.id, mode, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sidebar p-4 rounded-lg">
          <FormField
            control={form.control}
            name="social_reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razón Social</FormLabel>
                <FormControl>
                  <Input
                    variant="primary"
                    placeholder="Ej: Comercial Ferriego SAC"
                    disabled={fieldsFromSearch.social_reason}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ruc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUC</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      variant="primary"
                      placeholder="Ej: 20123456789"
                      maxLength={11}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!field.value || field.value.length !== 11 || isSearching}
                      onClick={async () => {
                        if (field.value && field.value.length === 11) {
                          setIsSearching(true);
                          try {
                            const response = await searchRUC({ search: field.value });
                            if (response.data) {
                              const newFieldsFromSearch = { ...fieldsFromSearch };
                              if (isValidData(response.data.business_name)) {
                                form.setValue("social_reason", response.data.business_name);
                                newFieldsFromSearch.social_reason = true;
                              }
                              if (isValidData(response.data.address)) {
                                form.setValue("address", response.data.address!);
                                newFieldsFromSearch.address = true;
                              }
                              setFieldsFromSearch(newFieldsFromSearch);
                            }
                          } catch (error) {
                            console.error("Error searching RUC:", error);
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
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trade_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Comercial</FormLabel>
                <FormControl>
                  <Input
                    variant="primary"
                    placeholder="Ej: Ferriego"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input
                    variant="primary"
                    placeholder="Ej: Av. Los Olivos 123, Lima"
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
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    variant="primary"
                    placeholder="Ej: 987654321"
                    maxLength={9}                    
                    {...field}
                  />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    variant="primary"
                    type="email"
                    placeholder="Ej: contacto@ferriego.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};