import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";

interface TagOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedActive: string;
  setSelectedActive: (value: string) => void;
}

const TYPE_OPTIONS = [
  { value: "rotation", label: "Rotación" },
  { value: "priority", label: "Prioridad" },
  { value: "supplier", label: "Proveedor" },
  { value: "custom", label: "Personalizado" },
];

const ACTIVE_OPTIONS = [
  { value: "1", label: "Activos" },
  { value: "0", label: "Inactivos" },
];

export default function TagOptions({
  search,
  setSearch,
  selectedType,
  setSelectedType,
  selectedActive,
  setSelectedActive,
}: TagOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar etiqueta" />
      <SearchableSelect
        options={TYPE_OPTIONS}
        value={selectedType}
        onChange={setSelectedType}
        placeholder="Todos los tipos"
      />
      <SearchableSelect
        options={ACTIVE_OPTIONS}
        value={selectedActive}
        onChange={setSelectedActive}
        placeholder="Todos los estados"
      />
    </div>
  );
}
