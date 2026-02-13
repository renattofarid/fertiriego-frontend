import SearchInput from "@/components/SearchInput";
import { GUIDE_STATUS_OPTIONS } from "../lib/purchase-shipping-guide.interface";
import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelect } from "@/components/SearchableSelect";

interface PurchaseShippingGuideOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
}

export const PurchaseShippingGuideOptions = ({
  search,
  setSearch,
  selectedStatus,
  setSelectedStatus,
}: PurchaseShippingGuideOptionsProps) => {
  return (
    <FilterWrapper>
      <SearchInput
        onChange={setSearch}
        value={search}
        placeholder="Buscar..."
      />

      <SearchableSelect
        placeholder="Estado"
        onChange={setSelectedStatus}
        options={GUIDE_STATUS_OPTIONS}
        value={selectedStatus}
      />
    </FilterWrapper>
  );
};
