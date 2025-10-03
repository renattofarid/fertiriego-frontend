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
  productSchemaCreate,
  productSchemaUpdate,
  type ProductSchema,
} from "../lib/product.schema";
import { Loader, Upload, X, FileText } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import type { ProductResource } from "../lib/product.interface";
import type { CategoryResource } from "@/pages/category/lib/category.interface";
import type { BrandResource } from "@/pages/brand/lib/brand.interface";
import type { UnitResource } from "@/pages/unit/lib/unit.interface";
import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { useProductStore } from "../lib/product.store";
import { successToast, errorToast } from "@/lib/core.function";
import type { ProductTypeResource } from "@/pages/product-type/lib/product-type.interface";

interface ProductFormProps {
  defaultValues: Partial<ProductSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  categories: CategoryResource[];
  brands: BrandResource[];
  units: UnitResource[];
  product?: ProductResource;
  productTypes: ProductTypeResource[];
}

export const ProductForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  categories,
  brands,
  units,
  product,
  productTypes,
}: ProductFormProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>(
    product?.technical_sheet || []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { deleteTechnicalSheet } = useProductStore();

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? productSchemaCreate : productSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);

    // Update form value
    const currentFiles = form.getValues("technical_sheet") || [];
    form.setValue("technical_sheet", [...currentFiles, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

    // Update form value
    const currentFiles = form.getValues("technical_sheet") || [];
    form.setValue(
      "technical_sheet",
      currentFiles.filter((_, i) => i !== index)
    );
  };

  const removeExistingFile = async (fileUrl: string) => {
    if (!product) return;

    try {
      await deleteTechnicalSheet(product.id, { value: fileUrl });
      setExistingFiles((prev) => prev.filter((url) => url !== fileUrl));
      successToast("Ficha técnica eliminada exitosamente");
    } catch (error) {
      errorToast("Error al eliminar la ficha técnica");
    }
  };

  const getFileName = (url: string) => {
    return url.split("/").pop() || "Archivo";
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sidebar p-4 rounded-lg">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input
                      variant="primary"
                      placeholder="Ej: Televisor Samsung 55 pulgadas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormSelect
            control={form.control}
            name="category_id"
            label="Categoría"
            placeholder="Seleccione una categoría"
            options={categories.map((category) => ({
              value: category.id.toString(),
              label: `${"  ".repeat(category.level - 1)}${category.name}`,
            }))}
          />

          <FormSelect
            control={form.control}
            name="brand_id"
            label="Marca"
            placeholder="Seleccione una marca"
            options={brands.map((brand) => ({
              value: brand.id.toString(),
              label: brand.name,
            }))}
          />

          <FormSelect
            control={form.control}
            name="unit_id"
            label="Unidad"
            placeholder="Seleccione una unidad"
            options={units.map((unit) => ({
              value: unit.id.toString(),
              label: unit.name,
            }))}
          />

          <FormSelect
            control={form.control}
            name="product_type"
            label="Tipo de Producto"
            placeholder="Seleccione el tipo"
            options={productTypes.map((productType) => ({
              value: productType.id.toString(),
              label: productType.name,
            }))}
          />
        </div>

        {/* Technical Sheets Section */}
        <div className="bg-sidebar p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Fichas Técnicas</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFileDialog}
            >
              <Upload className="h-4 w-4 mr-2" />
              Agregar Archivos
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Existing Files */}
          {existingFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Archivos existentes:
              </p>
              {existingFiles.map((fileUrl, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{getFileName(fileUrl)}</span>
                    <Badge variant="secondary" className="text-xs">
                      Existente
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExistingFile(fileUrl)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Archivos seleccionados:
              </p>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{file.name}</span>
                    <Badge variant="default" className="text-xs">
                      Nuevo
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSelectedFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {existingFiles.length === 0 && selectedFiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p>No hay archivos seleccionados</p>
              <p className="text-sm">
                Haga clic en "Agregar Archivos" para subir fichas técnicas
              </p>
            </div>
          )}
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
