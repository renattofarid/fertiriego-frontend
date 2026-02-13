import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { Option } from "@/lib/core.interface";
import FilterWrapper from "@/components/FilterWrapper";

interface PurchaseOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedPaymentType: string;
  setSelectedPaymentType: (value: string) => void;
}

export const PurchaseOptions = ({
  search,
  setSearch,
  selectedStatus,
  setSelectedStatus,
  selectedPaymentType,
  setSelectedPaymentType,
}: PurchaseOptionsProps) => {
  const statusOptions: Option[] = [
    { value: "", label: "Todos los estados" },
    { value: "REGISTRADO", label: "Registrado" },
    { value: "PAGADA", label: "Pagado" },
    { value: "CANCELADO", label: "Cancelado" },
  ];

  const paymentTypeOptions: Option[] = [
    { value: "", label: "Todos los tipos" },
    { value: "CONTADO", label: "Contado" },
    { value: "CREDITO", label: "Crédito" },
  ];

  return (
    <FilterWrapper>
      <SearchInput
        onChange={setSearch}
        value={search}
        placeholder="Buscar..."
      />

      <SearchableSelect
        options={statusOptions}
        value={selectedStatus}
        onChange={setSelectedStatus}
        placeholder="Estado"
        className="w-full md:w-[180px]"
      />

      <SearchableSelect
        options={paymentTypeOptions}
        value={selectedPaymentType}
        onChange={setSelectedPaymentType}
        placeholder="Tipo de Pago"
        className="w-full md:w-[180px]"
      />
    </FilterWrapper>
  );
};
