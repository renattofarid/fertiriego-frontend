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
  warehouseProductSchemaCreate,
  warehouseProductSchemaUpdate,
  type WarehouseProductSchema,
} from "../lib/warehouse-product.schema.ts";
import { Loader, Plus } from "lucide-react";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { FormSelect } from "@/components/FormSelect";
import { useState } from "react";
import ProductModal from "@/pages/product/components/ProductModal";
import { PRODUCT } from "@/pages/product/lib/product.interface";

interface WarehouseProductFormProps {
  defaultValues: Partial<WarehouseProductSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const WarehouseProductForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: WarehouseProductFormProps) => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const { data: warehouses, isLoading: loadingWarehouses } = useAllWarehouses();
  const {
    data: products,
    isLoading: loadingProducts,
    refetch: refetchProducts,
  } = useAllProducts();

  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? warehouseProductSchemaCreate
        : warehouseProductSchemaUpdate
    ),
    defaultValues: {
      warehouse_id: "",
      product_id: "",
      stock: 0,
      min_stock: null,
      max_stock: null,
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Preparar opciones para el selector de almacenes
  const warehouseOptions =
    warehouses?.map((warehouse) => ({
      value: warehouse.id.toString(),
      label: warehouse.name,
    })) || [];

  // Preparar opciones para el selector de productos
  const productOptions =
    products?.map((product) => ({
      value: product.id.toString(),
      label: product.name,
    })) || [];

  // Handlers para el modal de producto
  const handleOpenProductModal = () => {
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
  };

  const handleCloseProduct = () => {
    setIsProductModalOpen(false);
    refetchProducts();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sidebar p-4 rounded-lg">
          <div className="col-span-full">
            <FormSelect
              name="warehouse_id"
              label="Almacén"
              placeholder="Seleccione un almacén"
              options={warehouseOptions}
              control={form.control}
              disabled={loadingWarehouses}
            />
          </div>

          <div className="col-span-full">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <FormSelect
                  name="product_id"
                  label="Producto"
                  placeholder="Seleccione un producto"
                  options={productOptions}
                  control={form.control}
                  disabled={loadingProducts}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleOpenProductModal}
                title="Crear nuevo producto"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    variant="primary"
                    type="number"
                    placeholder="Ej: 400"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="min_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Mínimo (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    variant="primary"
                    type="number"
                    placeholder="Ej: 50"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Máximo (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    variant="primary"
                    type="number"
                    placeholder="Ej: 1000"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : Number(value));
                    }}
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

      {/* Modal para crear producto */}
      <ProductModal
        open={isProductModalOpen}
        onClose={handleCloseProduct}
        onCloseModal={handleCloseProductModal}
        title={PRODUCT.TITLES.create.title}
        mode="create"
      />
    </Form>
  );
};
