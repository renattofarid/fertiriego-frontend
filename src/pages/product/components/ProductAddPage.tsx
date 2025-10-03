"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import TitleFormComponent from "@/components/TitleFormComponent";
import { ProductForm } from "./ProductForm";
import { type ProductSchema } from "../lib/product.schema";
import { useProductStore } from "../lib/product.store";
import { useAllCategories } from "@/pages/category/lib/category.hook";
import { useAllBrands } from "@/pages/brand/lib/brand.hook";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import { useAllProductTypes } from "@/pages/product-type/lib/product-type.hook";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PRODUCT } from "../lib/product.interface";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";

const { MODEL } = PRODUCT;

export default function ProductAddPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useAllCategories();
  const { data: brands, isLoading: brandsLoading } = useAllBrands();
  const { data: units, isLoading: unitsLoading } = useAllUnits();
  const { data: productTypes } = useAllProductTypes();

  const { createProduct } = useProductStore();

  const isLoading =
    categoriesLoading || brandsLoading || unitsLoading || !productTypes;

  const getDefaultValues = (): Partial<ProductSchema> => ({
    name: "",
    category_id: "",
    brand_id: "",
    unit_id: "",
    product_type_id: "",
    technical_sheet: [],
  });

  const handleSubmit = async (data: ProductSchema) => {
    setIsSubmitting(true);
    try {
      await createProduct(data);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate("/productos");
    } catch (error: any) {
      errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "create"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to="/productos" />
            <TitleFormComponent title={MODEL.name} mode="create" />
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
          <BackButton to="/productos" />
          <TitleFormComponent title={MODEL.name} mode="create" />
        </div>
      </div>

      {categories &&
        categories.length > 0 &&
        brands &&
        brands.length > 0 &&
        units &&
        units.length > 0 &&
        productTypes &&
        productTypes.length > 0 && (
          <ProductForm
            defaultValues={getDefaultValues()}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="create"
            categories={categories}
            brands={brands}
            units={units}
            productTypes={productTypes}
            onCancel={() => navigate("/productos")}
          />
        )}
    </FormWrapper>
  );
}
