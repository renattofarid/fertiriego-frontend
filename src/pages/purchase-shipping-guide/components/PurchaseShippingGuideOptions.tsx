import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/SearchInput";
import { GUIDE_STATUS_OPTIONS } from "../lib/purchase-shipping-guide.interface";

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
  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 py-4">
      <SearchInput onChange={setSearch} value={search} placeholder="Buscar..." />

      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {GUIDE_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleClearFilters}>
        Limpiar Filtros
      </Button>
    </div>
  );
};
