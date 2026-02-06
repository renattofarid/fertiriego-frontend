"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { ProductForm } from "./ProductForm";
import { type ProductSchema } from "../lib/product.schema";
import { useProductStore } from "../lib/product.store";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PRODUCT, type ProductResource } from "../lib/product.interface";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";

const { MODEL, ICON } = PRODUCT;

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: units, isLoading: unitsLoading } = useAllUnits();

  const { updateProduct, fetchProduct, product, isFinding } = useProductStore();

  const isLoading = unitsLoading || isFinding;

  useEffect(() => {
    if (!id) {
      navigate("/productos");
      return;
    }

    fetchProduct(Number(id));
  }, [id, navigate, fetchProduct]);

  const mapProductToForm = (data: ProductResource): Partial<ProductSchema> => ({
    name: data.name,
    category_id: data.category_id?.toString(),
    brand_id: data.brand_id?.toString(),
    unit_id: data.unit_id?.toString(),
    product_type_id: data.product_type_id?.toString(),
    is_igv: Boolean((data as any).is_igv) || false,
    observations: (data as any).observations || "",
    technical_sheet: [],
  });

  const handleSubmit = async (data: ProductSchema) => {
    if (!product || !id) return;

    setIsSubmitting(true);
    try {
      await updateProduct(Number(id), data);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      navigate("/productos");
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        ERROR_MESSAGE(MODEL, "update");
      errorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!product) {
    return (
      <FormWrapper>
        <div className="flex items-center gap-4 mb-6">
          <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Producto no encontrado</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
        </div>
      </div>

      {units && units.length > 0 && (
        <ProductForm
          defaultValues={mapProductToForm(product)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          units={units}
          product={product}
          onCancel={() => navigate("/productos")}
        />
      )}
    </FormWrapper>
  );
}
