import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
}

export default function PurchaseOrderOptions({
  search,
  setSearch,
  selectedStatus,
  setSelectedStatus,
}: Props) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar..."
      />
      <SearchableSelect
        value={selectedStatus}
        onChange={setSelectedStatus}
        options={[
          { value: "Pendiente", label: "Pendiente" },
          { value: "Completada", label: "Completada" },
          { value: "Cancelada", label: "Cancelada" },
        ]}
        placeholder="Filtrar por estado"
      />
    </FilterWrapper>
  );
}
