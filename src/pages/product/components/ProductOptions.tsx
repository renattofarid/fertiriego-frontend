"use client";

import SearchInput from "@/components/SearchInput";
import { FormSelect } from "@/components/FormSelect";
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
  categories: CategoryResource[];
  brands: BrandResource[];
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
  categories,
  brands,
}: ProductOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar producto"
      />

      <div className="flex gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-background"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id.toString()}>
              {"  ".repeat(category.level - 1)}{category.name}
            </option>
          ))}
        </select>

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-background"
        >
          <option value="">Todas las marcas</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id.toString()}>
              {brand.name}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-background"
        >
          <option value="">Todos los tipos</option>
          <option value="Normal">Normal</option>
          <option value="Kit">Kit</option>
          <option value="Servicio">Servicio</option>
        </select>
      </div>
    </div>
  );
}