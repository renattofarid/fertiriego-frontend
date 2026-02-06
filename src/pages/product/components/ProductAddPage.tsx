"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { PRODUCT } from "../lib/product.interface";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";

const { MODEL, ICON } = PRODUCT;

export default function ProductAddPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: units, isLoading: unitsLoading } = useAllUnits();

  const { createProduct } = useProductStore();

  const isLoading = unitsLoading;

  const getDefaultValues = (): Partial<ProductSchema> => ({
    name: "",
    category_id: "",
    brand_id: "",
    unit_id: "",
    product_type_id: "",
    is_igv: false,
    observations: "",
    technical_sheet: [],
  });

  const handleSubmit = async (data: ProductSchema) => {
    setIsSubmitting(true);
    try {
      await createProduct(data);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate("/productos");
    } catch (error: any) {
      errorToast(
        error.response.data.message ?? error.response.data.error,
        ERROR_MESSAGE(MODEL, "create")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title={MODEL.name} mode="create" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title={MODEL.name} mode="create" icon={ICON} />
        </div>
      </div>

      {units && units.length > 0 && (
          <ProductForm
            defaultValues={getDefaultValues()}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="create"
            units={units}
            onCancel={() => navigate("/productos")}
          />
        )}
    </FormWrapper>
  );
}
