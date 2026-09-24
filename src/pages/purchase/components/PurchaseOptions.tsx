import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import type { Option } from "@/lib/core.interface";
import FilterWrapper from "@/components/FilterWrapper";
import { useSuppliers } from "@/pages/supplier/lib/supplier.hook";

const mapSupplierOption = (supplier: any): Option => ({
  value: String(supplier.id),
  label:
    supplier.business_name ||
    `${supplier.names ?? ""} ${supplier.father_surname ?? ""} ${supplier.mother_surname ?? ""}`.trim(),
  description: supplier.number_document,
});

interface PurchaseOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedPaymentType: string;
  setSelectedPaymentType: (value: string) => void;
  selectedSupplierId: string;
  setSelectedSupplierId: (value: string) => void;
}

export const PurchaseOptions = ({
  search,
  setSearch,
  selectedStatus,
  setSelectedStatus,
  selectedPaymentType,
  setSelectedPaymentType,
  selectedSupplierId,
  setSelectedSupplierId,
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

      <SearchableSelectAsync
        value={selectedSupplierId}
        onChange={setSelectedSupplierId}
        placeholder="Proveedor"
        useQueryHook={useSuppliers}
        mapOptionFn={mapSupplierOption}
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
