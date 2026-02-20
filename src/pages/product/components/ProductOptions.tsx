"use client";

import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useCategory } from "@/pages/category/lib/category.hook";
import { useBrand } from "@/pages/brand/lib/brand.hook";
import type { CategoryResource } from "@/pages/category/lib/category.interface";
import type { BrandResource } from "@/pages/brand/lib/brand.interface";

interface ProductOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
}

export default function ProductOptions({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedType,
  setSelectedType,
}: ProductOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar producto"
      />

      <SearchableSelectAsync
        useQueryHook={useCategory}
        mapOptionFn={(category: CategoryResource) => ({
          value: category.id.toString(),
          label: category.name,
          description: category.code,
        })}
        value={selectedCategory}
        onChange={setSelectedCategory}
        placeholder="Todas las categorías"
      />

      <SearchableSelectAsync
        useQueryHook={useBrand}
        mapOptionFn={(brand: BrandResource) => ({
          value: brand.id.toString(),
          label: brand.name,
        })}
        value={selectedBrand}
        onChange={setSelectedBrand}
        placeholder="Todas las marcas"
      />

      <SearchableSelect
        options={[
          { value: "Normal", label: "Normal" },
          { value: "Kit", label: "Kit" },
          { value: "Servicio", label: "Servicio" },
        ]}
        value={selectedType}
        onChange={setSelectedType}
        placeholder="Todos los tipos"
      />
    </div>
  );
}
