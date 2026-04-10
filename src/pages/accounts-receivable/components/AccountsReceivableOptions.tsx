import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { Option } from "@/lib/core.interface";

const currencyOptions: Option[] = [
  { value: "", label: "Todas las monedas" },
  { value: "PEN", label: "S/. Soles" },
  { value: "USD", label: "$ Dólares" },
];

interface AccountsReceivableOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
}

export default function AccountsReceivableOptions({
  search,
  setSearch,
  currency,
  setCurrency,
}: AccountsReceivableOptionsProps) {
  return (
    <>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar cuenta por cobrar..."
      />
      <SearchableSelect
        options={currencyOptions}
        value={currency}
        onChange={setCurrency}
        placeholder="Moneda"
        className="w-full"
      />
    </>
  );
}
